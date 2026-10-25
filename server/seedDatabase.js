// server/seedDatabase.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_PLANTS = [
  {
    name: "Cherry Tomato",
    scientific_name: "Solanum lycopersicum var. cerasiforme",
    category: "Vegetables",
    description: "Vigorous annual producing sweet, juicy ruby-red cluster berries throughout summer.",
    image_url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 2-3 days; maintain consistent soil moisture.",
    soil: "Rich, well-draining loamy soil enriched with organic compost.",
    temperature: "20°C - 32°C",
    difficulty: "Easy",
    maintenance_level: "Medium",
    indoor_outdoor: "Outdoor",
    growth_duration: "60-75 days to harvest",
    planting_info: "Stake vines early and pinch suckers for larger yields.",
    maintenance_tips: "Deep watering at base prevents blossom end rot and fruit splitting.",
    care_schedule_defaults: { watering_interval_days: 2, fertilizing_interval_days: 14, pruning_interval_days: 7 },
    purpose: ["Culinary", "High Yield", "Container Gardening"],
    tags: ["Vegetables", "Edible", "Sun Loving"]
  },
  {
    name: "Sweet Basil",
    scientific_name: "Ocimum basilicum",
    category: "Herbs",
    description: "Authentic culinary sweet basil with lush, highly aromatic tender emerald leaves rich in eugenol and linalool. Essential for Italian pestos and fresh culinary dishes.",
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Ocimum_basilicum_8zz.jpg/1280px-Ocimum_basilicum_8zz.jpg",
    sunlight: "Full Sunlight (6-8 hrs/day)",
    watering: "Water every 2 days; water deeply at soil base and maintain moist, well-draining soil without leaf wetting.",
    soil: "Rich, well-draining loamy garden soil with compost, pH 6.0-7.0.",
    temperature: "18°C - 30°C (frost sensitive)",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Both",
    growth_duration: "30-50 days to harvest",
    planting_info: "Sow seeds lightly on surface or transplant in sunny windowboxes/balcony pots.",
    maintenance_tips: "Pinch center flower spikes immediately to stimulate dense lateral foliage and sustain aromatic oils.",
    care_schedule_defaults: { watering_interval_days: 2, fertilizing_interval_days: 14, pruning_interval_days: 7 },
    purpose: ["Culinary Herb", "Fresh Pesto", "Balcony Container Gardening"],
    tags: ["Herbs", "Culinary", "Aromatic", "Edible"]
  },
  {
    name: "Holy Basil (Tulsi)",
    scientific_name: "Ocimum tenuiflorum",
    category: "Medicinal Plants",
    description: "Sacred Queen of Ayurvedic herbs with dark aromatic foliage and clove fragrance, revered for adaptogenic immunity, stress relief, and herbal tea infusions.",
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Tulsi_or_Tulasi_Holy_basil.jpg/1280px-Tulsi_or_Tulasi_Holy_basil.jpg",
    sunlight: "Full Direct Sunlight (6+ hrs)",
    watering: "Water every 1-2 days; keep root zone hydrated with aerated moisture, avoiding waterlogged roots.",
    soil: "Porous fertile potting loam with organic vermicompost and perlite.",
    temperature: "20°C - 38°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Both",
    growth_duration: "Perennial branching shrub",
    planting_info: "Thrives in sunny balconies, prayer courtyards, and well-lit windowsills.",
    maintenance_tips: "Pinch apical tips weekly to stimulate dense, bushy branching and prevent premature seeding.",
    care_schedule_defaults: { watering_interval_days: 2, fertilizing_interval_days: 21, pruning_interval_days: 14 },
    purpose: ["Herbal Immunity Tea", "Ayurvedic Medicine", "Sacred Courtyard Plant"],
    tags: ["Ayurveda", "Aromatic", "Medicinal", "Sacred"]
  },
  {
    name: "Neem Tree",
    scientific_name: "Azadirachta indica",
    category: "Medicinal Plants",
    description: "Hardy subtropical medicinal wonder tree with serrated pinnate leaves rich in azadirachtin, providing legendary organic pest-repellent and antibacterial properties.",
    image_url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Neem_Tree_in_Rajasthan%2C_India.jpg/1280px-Neem_Tree_in_Rajasthan%2C_India.jpg",
    sunlight: "Full Direct Sunlight (6-8+ hrs)",
    watering: "Water every 4-5 days; deep taproot system becomes exceptionally drought tolerant once established.",
    soil: "Deep, well-draining sandy loam or garden soil; tolerates poor rocky soils.",
    temperature: "22°C - 42°C (frost sensitive)",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Outdoor",
    growth_duration: "Perennial evergreen tree / courtyard planter",
    planting_info: "Plant in large deep containers or outdoor garden beds with maximum solar exposure.",
    maintenance_tips: "Boil fresh foliage to prepare 100% natural organic insect repellent spray for vegetable and flower gardens.",
    care_schedule_defaults: { watering_interval_days: 4, fertilizing_interval_days: 45, pruning_interval_days: 60 },
    purpose: ["Organic Pest Control", "Ayurvedic Health", "Natural Garden Shade"],
    tags: ["Medicinal", "Drought Tolerant", "Pest Repellent", "Ayurvedic"]
  },
  {
    name: "Monstera Deliciosa",
    scientific_name: "Monstera deliciosa",
    category: "Indoor Plants",
    description: "The iconic Swiss Cheese tropical plant famous for its dramatic split fenestrated leaves.",
    image_url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    sunlight: "Indirect / Shaded Light",
    watering: "Water every 7 days; let top 5 cm of soil dry out between waterings.",
    soil: "Aroid mixture with orchid bark, perlite, and peat moss.",
    temperature: "18°C - 28°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Indoor",
    growth_duration: "Perennial houseplant",
    planting_info: "Provide a moss pole or coir stake for vertical vine support.",
    maintenance_tips: "Wipe large glossy leaves clean with damp cloth to optimize photosynthesis.",
    care_schedule_defaults: { watering_interval_days: 7, fertilizing_interval_days: 30, pruning_interval_days: 60 },
    purpose: ["Interior Decor", "Air Purifying", "Architectural Focal Point"],
    tags: ["Statement Plant", "Fenestrated", "Tropical"]
  },
  {
    name: "Snake Plant (Sansevieria)",
    scientific_name: "Dracaena trifasciata",
    category: "Indoor Plants",
    description: "Extremely resilient architectural indoor plant with upright sword-like variegated leaves.",
    image_url: "https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80",
    sunlight: "Low Light / Fluorescent",
    watering: "Water every 14-20 days; drought-tolerant succulent nature.",
    soil: "Cactus & succulent porous sandy pot mix.",
    temperature: "15°C - 32°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Indoor",
    growth_duration: "Perennial evergreen",
    planting_info: "Pot in terracotta container with good drainage holes.",
    maintenance_tips: "Never overwater or leave standing in stagnant water to avoid root rot.",
    care_schedule_defaults: { watering_interval_days: 14, fertilizing_interval_days: 45, pruning_interval_days: 90 },
    purpose: ["Air Purification", "Office Desk", "Low Maintenance"],
    tags: ["Succulent", "Hardy", "Air Cleaner"]
  },
  {
    name: "Golden Pothos (Money Plant)",
    scientific_name: "Epipremnum aureum",
    category: "Indoor Plants",
    description: "Effortless cascading vine with heart-shaped emerald green leaves marbled with golden-yellow accents.",
    image_url: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=800&q=80",
    sunlight: "Partial Sunlight (3-6 hrs)",
    watering: "Water every 5-7 days when top soil feels dry.",
    soil: "Standard indoor well-draining potting soil.",
    temperature: "16°C - 30°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Indoor",
    growth_duration: "Fast growing vine",
    planting_info: "Can be grown trailing from hanging pots or climbed on trellis.",
    maintenance_tips: "Propagate cuttings easily in water glasses on your desk.",
    care_schedule_defaults: { watering_interval_days: 6, fertilizing_interval_days: 30, pruning_interval_days: 30 },
    purpose: ["Hanging Planter", "Air Purifying", "Beginner Friendly"],
    tags: ["Trailing", "Hardy", "Money Plant"]
  },
  {
    name: "Peace Lily",
    scientific_name: "Spathiphyllum wallisii",
    category: "Indoor Plants",
    description: "Lush indoor perennial with glossy deep green foliage and striking sculptural white flower spathes.",
    image_url: "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=800&q=80",
    sunlight: "Indirect / Shaded Light",
    watering: "Water every 4-5 days; visibly communicates when thirsty by gentle drooping.",
    soil: "Rich peat-based potting soil with excellent drainage.",
    temperature: "18°C - 28°C",
    difficulty: "Easy",
    maintenance_level: "Medium",
    indoor_outdoor: "Indoor",
    growth_duration: "Perennial flowering houseplant",
    planting_info: "Keep away from harsh direct midday sunshine to preserve delicate foliage.",
    maintenance_tips: "Mist foliage weekly in dry weather to provide humidity.",
    care_schedule_defaults: { watering_interval_days: 5, fertilizing_interval_days: 30, pruning_interval_days: 45 },
    purpose: ["Air Cleanser", "White Flowers", "Living Room Focus"],
    tags: ["Flowering Indoor", "Air Purifying", "Glossy Leaves"]
  },
  {
    name: "Aloe Vera",
    scientific_name: "Aloe barbadensis Miller",
    category: "Succulents",
    description: "Famous succulent containing therapeutic cooling gel inside thick fleshy leaves.",
    image_url: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 10-14 days; allow soil to dry completely.",
    soil: "Gritty succulent soil blend.",
    temperature: "18°C - 35°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Both",
    growth_duration: "Perennial succulent",
    planting_info: "Propagate readily by separating root offsets ('pups').",
    maintenance_tips: "Harvest outer mature leaves near base for soothing skincare gel.",
    care_schedule_defaults: { watering_interval_days: 12, fertilizing_interval_days: 45, pruning_interval_days: 60 },
    purpose: ["Medicinal Skincare", "First Aid", "Succulent Garden"],
    tags: ["Medicinal", "Succulent", "Easy Care"]
  },
  {
    name: "Damask Rose",
    scientific_name: "Rosa × damascena",
    category: "Flowers",
    description: "Classic fragrant flowering shrub known worldwide for aromatic blossoms and rose water essential oils.",
    image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 3-4 days at ground level.",
    soil: "Rich, well-draining clay loam with organic mulch.",
    temperature: "15°C - 30°C",
    difficulty: "Moderate",
    maintenance_level: "Medium",
    indoor_outdoor: "Outdoor",
    growth_duration: "Perennial flowering bush",
    planting_info: "Prune dead stems in early spring to spur vibrant floral buds.",
    maintenance_tips: "Deadhead spent blooms to encourage continuous flowering cycles.",
    care_schedule_defaults: { watering_interval_days: 3, fertilizing_interval_days: 21, pruning_interval_days: 21 },
    purpose: ["Ornamental", "Cut Flowers", "Perfume & Essential Oils"],
    tags: ["Flowers", "Fragrant", "Classic Garden"]
  },
  {
    name: "Arabian Jasmine (Mogra)",
    scientific_name: "Jasminum sambac",
    category: "Flowers",
    description: "Intensely scented white blossoms treasured for garlands, teas, and sensory balcony fragrances.",
    image_url: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 2-3 days; keep root zone hydrated.",
    soil: "Rich organic potting soil with perlite.",
    temperature: "20°C - 35°C",
    difficulty: "Easy",
    maintenance_level: "Medium",
    indoor_outdoor: "Both",
    growth_duration: "Perennial blooming shrub",
    planting_info: "Grow on balcony railings where its intoxicating night fragrance can drift indoors.",
    maintenance_tips: "Prune stem tips after blooming to trigger immediate new flowering clusters.",
    care_schedule_defaults: { watering_interval_days: 3, fertilizing_interval_days: 14, pruning_interval_days: 21 },
    purpose: ["Aromatherapy", "Fragrant Flowers", "Balcony Climber"],
    tags: ["Jasmine", "Fragrant", "Blossoms"]
  },
  {
    name: "African Marigold",
    scientific_name: "Tagetes erecta",
    category: "Flowers",
    description: "Cheerful pom-pom golden orange blossoms famous for companion planting and festive garden decor.",
    image_url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 2-3 days; avoid wetting floral heads directly.",
    soil: "Average well-draining garden soil.",
    temperature: "18°C - 32°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Outdoor",
    growth_duration: "45-60 days to bloom",
    planting_info: "Plant near tomatoes and vegetables to naturally deter root nematodes and pests.",
    maintenance_tips: "Deadhead faded blooms weekly to keep continuous golden floral production.",
    care_schedule_defaults: { watering_interval_days: 3, fertilizing_interval_days: 21, pruning_interval_days: 14 },
    purpose: ["Companion Planting", "Festive Garlands", "Natural Pest Deterrent"],
    tags: ["Golden Blooms", "Companion Plant", "Easy"]
  },
  {
    name: "Spearmint",
    scientific_name: "Mentha spicata",
    category: "Herbs",
    description: "Fast-spreading refreshing herb with fragrant serrated green leaves for beverages and salads.",
    image_url: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=800&q=80",
    sunlight: "Partial Sunlight (3-6 hrs)",
    watering: "Water every 2 days; prefers damp soil moisture.",
    soil: "Rich moist garden loam or potting mix.",
    temperature: "15°C - 28°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Both",
    growth_duration: "Perennial runner",
    planting_info: "Grow in dedicated containers to prevent aggressive spreading in beds.",
    maintenance_tips: "Harvest regularly to keep plants compact and lush.",
    care_schedule_defaults: { watering_interval_days: 2, fertilizing_interval_days: 21, pruning_interval_days: 10 },
    purpose: ["Culinary Drinks", "Tea & Mojitos", "Cooling Herb"],
    tags: ["Herbs", "Refreshing", "Container Plant"]
  },
  {
    name: "Tuscan Rosemary",
    scientific_name: "Salvia rosmarinus",
    category: "Herbs",
    description: "Hardy woody perennial with pungent pine-like aromatic needles for roasting, breads, and garden scents.",
    image_url: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 5-7 days; loves drying out between deep soaks.",
    soil: "Sandy, gritty soil with excellent drainage.",
    temperature: "14°C - 32°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Both",
    growth_duration: "Perennial evergreen shrub",
    planting_info: "Plant in terracotta container with porous gravel base.",
    maintenance_tips: "Clip branch tips regularly for culinary seasonings and bushy growth.",
    care_schedule_defaults: { watering_interval_days: 6, fertilizing_interval_days: 45, pruning_interval_days: 30 },
    purpose: ["Culinary Seasoning", "Mediterranean Herb", "Drought Hardy"],
    tags: ["Rosemary", "Fragrant", "Woody Herb"]
  },
  {
    name: "Hot Green Chilli",
    scientific_name: "Capsicum annuum",
    category: "Vegetables",
    description: "Prolific culinary vegetable shrub yielding crisp, spicy emerald green peppers all season long.",
    image_url: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 2-3 days; reduce water slightly when peppers form to boost pungency.",
    soil: "Warm, fertile potting mix enriched with organic worm castings.",
    temperature: "22°C - 36°C",
    difficulty: "Easy",
    maintenance_level: "Medium",
    indoor_outdoor: "Both",
    growth_duration: "65-80 days to harvest",
    planting_info: "Grows vigorously in medium 10-12 inch balcony containers.",
    maintenance_tips: "Harvest green chillies using shears to avoid breaking brittle branches.",
    care_schedule_defaults: { watering_interval_days: 2, fertilizing_interval_days: 14, pruning_interval_days: 21 },
    purpose: ["Kitchen Spice", "High Yield Vegetable", "Compact Container"],
    tags: ["Spicy", "Vegetables", "Container Friendly"]
  },
  {
    name: "Meyer Lemon Tree",
    scientific_name: "Citrus × meyeri",
    category: "Fruit Plants",
    description: "Compact prolific citrus tree with intensely fragrant blossoms and sweet, juicy golden culinary lemons.",
    image_url: "https://images.unsplash.com/photo-1534856966150-c832f7e7a065?auto=format&fit=crop&w=800&q=80",
    sunlight: "Full Sunlight (6+ hrs)",
    watering: "Water every 3-4 days; keep soil moist without waterlogging.",
    soil: "Slightly acidic sandy loam with citrus fertilizer.",
    temperature: "18°C - 34°C",
    difficulty: "Moderate",
    maintenance_level: "Medium",
    indoor_outdoor: "Both",
    growth_duration: "Perennial citrus dwarf tree",
    planting_info: "Thrives in large patio containers with good drainage holes.",
    maintenance_tips: "Apply iron and zinc micro-nutrients when leaves show yellowing veins.",
    care_schedule_defaults: { watering_interval_days: 3, fertilizing_interval_days: 30, pruning_interval_days: 60 },
    purpose: ["Fresh Lemon Harvest", "Citrus Fragrance", "Patio Tree"],
    tags: ["Citrus", "Fruit", "Edible"]
  },
  {
    name: "Spider Plant",
    scientific_name: "Chlorophytum comosum",
    category: "Indoor Plants",
    description: "Graceful arching ribbon leaves with creamy white stripes; produces playful baby plantlets on cascading runners.",
    image_url: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=800&q=80",
    sunlight: "Partial Sunlight (3-6 hrs)",
    watering: "Water every 5-7 days; resilient to occasional drought.",
    soil: "Standard lightweight well-aerated potting mix.",
    temperature: "15°C - 28°C",
    difficulty: "Easy",
    maintenance_level: "Low",
    indoor_outdoor: "Indoor",
    growth_duration: "Perennial evergreen clump",
    planting_info: "Terrific for high shelves or macramé hanging holders.",
    maintenance_tips: "Clip plantlets and set in potting soil for instant free baby plants.",
    care_schedule_defaults: { watering_interval_days: 6, fertilizing_interval_days: 30, pruning_interval_days: 45 },
    purpose: ["Air Cleanser", "Hanging Basket", "Super Easy"],
    tags: ["Variegated", "Air Cleaning", "Beginner"]
  }
];

async function seed() {
  console.log('🌿 Seeding Supabase Botanical Plant Catalog...');
  
  const { count } = await supabase.from('plants').select('*', { count: 'exact', head: true });
  console.log(`Current plant count in Supabase: ${count}`);
  
  if (count === 0) {
    const { data, error } = await supabase.from('plants').insert(SEED_PLANTS).select();
    if (error) {
      console.error('❌ Error inserting plants:', error);
    } else {
      console.log(`✅ Successfully seeded ${data.length} botanical plants into Supabase 'plants' table!`);
    }
  } else {
    console.log(`ℹ️ 'plants' table already has ${count} records. Skipping seed.`);
  }

  // Check tables status
  const tables = ['profiles', 'plants', 'user_gardens', 'care_tasks', 'growth_records', 'journal_entries', 'notifications', 'ai_conversations', 'ai_messages', 'plant_favorites'];
  console.log('\n📊 Production Database Health Check:');
  for (const t of tables) {
    const { count: c, error: err } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (err) {
      console.log(`  ❌ ${t}: ${err.message}`);
    } else {
      console.log(`  ✅ ${t}: ${c} records`);
    }
  }
}

seed().catch(console.error);
