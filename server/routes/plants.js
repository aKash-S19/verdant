// Plant Catalog API Routes with Google Botanical Knowledge & Wikimedia High-Res Imagery
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { plantApiService } from '../services/plantApiService.js';

const router = Router();

const supaUrl = process.env.SUPABASE_URL;
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supa = (supaUrl && supaKey) ? createClient(supaUrl, supaKey) : null;

/**
 * Helper to save dynamically discovered Google/Wikimedia botanical plants to Supabase
 */
async function persistDiscoveredPlants(plantsList) {
  if (!supa || !plantsList || plantsList.length === 0) return plantsList;

  const persisted = [];
  for (const p of plantsList) {
    try {
      // Check if plant already exists in Supabase by name or scientific name
      const { data: existing } = await supa.from('plants')
        .select('*')
        .or(`name.ilike.%${p.name}%,scientific_name.ilike.%${p.scientific_name}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        persisted.push({
          ...existing[0],
          family: p.family || existing[0].tags?.[0],
          pet_friendly: p.pet_friendly,
          toxicity_notes: p.toxicity_notes
        });
      } else {
        const { data: inserted, error: insertError } = await supa.from('plants').insert([{
          name: p.name,
          scientific_name: p.scientific_name,
          category: p.category || 'Indoor Plants',
          description: p.description,
          image_url: p.image_url,
          sunlight: p.sunlight,
          watering: p.watering,
          soil: p.soil,
          temperature: p.temperature,
          difficulty: p.difficulty || 'Easy',
          maintenance_level: p.maintenance_level || 'Low',
          indoor_outdoor: p.indoor_outdoor || 'Indoor',
          growth_duration: p.growth_duration || 'Perennial',
          planting_info: p.planting_info || '',
          maintenance_tips: p.maintenance_tips || '',
          care_schedule_defaults: p.care_schedule_defaults || {
            watering_interval_days: 7,
            fertilizing_interval_days: 30,
            pruning_interval_days: 60
          },
          purpose: p.purpose || p.tags || ['Botanical Specimen'],
          tags: p.tags || ['Google Knowledge Graph', 'Verified Flora']
        }]).select().single();

        if (inserted && !insertError) {
          persisted.push({
            ...inserted,
            family: p.family,
            pet_friendly: p.pet_friendly,
            toxicity_notes: p.toxicity_notes
          });
        } else {
          persisted.push(p);
        }
      }
    } catch (e) {
      console.warn('[PlantsRoute] Could not persist plant to Supabase:', e.message);
      persisted.push(p);
    }
  }

  return persisted;
}

// GET /api/plants - Search and filter plants from PostgreSQL & Live Google Botanical Knowledge
router.get('/', async (req, res) => {
  try {
    const { category, sunlight, difficulty, indoor_outdoor, search, live } = req.query;
    let localPlants = [];

    if (supa) {
      let query = supa.from('plants').select('*');
      if (category && category !== 'All') query = query.ilike('category', `%${category}%`);
      if (difficulty && difficulty !== 'All') query = query.ilike('difficulty', `%${difficulty}%`);
      if (indoor_outdoor && indoor_outdoor !== 'All') query = query.ilike('indoor_outdoor', `%${indoor_outdoor}%`);
      if (sunlight && sunlight !== 'All') query = query.ilike('sunlight', `%${sunlight}%`);
      if (search && search.trim() !== '') {
        const cleanTerm = search.trim();
        query = query.or(`name.ilike.%${cleanTerm}%,scientific_name.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        localPlants = data;
      }
    }

    // If searching and user asked for live search OR no local matches were found:
    if (search && search.trim() !== '' && (localPlants.length < 2 || live === 'true')) {
      const cleanSearch = search.trim();
      const googlePlants = await plantApiService.fetchGoogleBotanicalKnowledge(cleanSearch);

      if (googlePlants && googlePlants.length > 0) {
        const savedGooglePlants = await persistDiscoveredPlants(googlePlants);
        // Merge with existing local plants, ensuring no duplicates by name
        const combined = [...localPlants];
        for (const gp of savedGooglePlants) {
          if (!combined.some(p => p.name.toLowerCase() === gp.name.toLowerCase() || p.scientific_name?.toLowerCase() === gp.scientific_name?.toLowerCase())) {
            combined.unshift(gp);
          }
        }

        return res.json({
          success: true,
          count: combined.length,
          plants: combined,
          source: 'google-botanical-knowledge'
        });
      }
    }

    // If local plants found from database
    if (localPlants.length > 0) {
      return res.json({
        success: true,
        count: localPlants.length,
        plants: localPlants,
        source: 'supabase'
      });
    }

    // Dynamic fallback to curated list + botanical image map
    const fallbackResults = await plantApiService.searchPlants({
      query: (search && search.trim() !== '') ? search.trim() : '',
      category,
      sunlight,
      difficulty,
      indoor_outdoor,
      limit: 24
    });

    return res.json({
      success: true,
      count: fallbackResults.length,
      plants: fallbackResults,
      source: 'catalog-fallback'
    });
  } catch (error) {
    console.error('[PlantsRoute] Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve plants catalog.', details: error.message });
  }
});

// GET /api/plants/google-search - Dedicated Google Knowledge Graph botanical lookup
router.get('/google-search', async (req, res) => {
  const query = req.query.query || req.query.q || '';
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const googlePlants = await plantApiService.fetchGoogleBotanicalKnowledge(query.trim());
    const persisted = await persistDiscoveredPlants(googlePlants);

    return res.json({
      success: true,
      count: persisted.length,
      plants: persisted
    });
  } catch (err) {
    console.error('[GoogleBotanicalSearch] Error:', err);
    return res.status(500).json({ error: 'Google Botanical search failed.', details: err.message });
  }
});

// GET /api/plants/:id - Single plant details
router.get('/:id', async (req, res) => {
  try {
    const plantId = req.params.id;

    if (supa) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(plantId)) {
        const { data, error } = await supa.from('plants').select('*').eq('id', plantId).single();
        if (!error && data) {
          return res.json({ success: true, plant: data });
        }
      }
    }

    const query = plantId.replace(/^plant-|^live-|^wiki-/, '').replace(/-/g, ' ');
    const googlePlants = await plantApiService.fetchGoogleBotanicalKnowledge(query);

    if (googlePlants && googlePlants.length > 0) {
      const persisted = await persistDiscoveredPlants(googlePlants);
      return res.json({ success: true, plant: persisted[0] });
    }

    const fallback = await plantApiService.searchPlants(query, 1);
    if (fallback && fallback.length > 0) {
      return res.json({ success: true, plant: fallback[0] });
    }

    return res.status(404).json({ error: 'Plant not found in botanical catalog.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch plant detail.', details: error.message });
  }
});

export default router;
