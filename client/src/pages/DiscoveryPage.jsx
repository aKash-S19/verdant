import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Sun, 
  Droplets, 
  Heart, 
  Plus, 
  Sparkles, 
  Check, 
  X, 
  ArrowRight,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  RefreshCw,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { getGeminiRecommendations, fetchPlantsCatalog, fetchGoogleBotanicalSearch } from '../lib/api';
import { getPlantIcon } from '../data/botanicalIcons';

export function DiscoveryPage({ onNavigate }) {
  const { profile } = useAuth();
  const { favorites, toggleFavorite, addPlantToGarden } = useGarden();
  const { addToast } = useNotifications();

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedSunlight, setSelectedSunlight] = useState('All');
  const [selectedPlacement, setSelectedPlacement] = useState('All');

  // Selected Plant for Detail Modal
  const [activePlant, setActivePlant] = useState(null);
  const [isAddingToGarden, setIsAddingToGarden] = useState(false);
  const [customPlantName, setCustomPlantName] = useState('');
  const [plantLocation, setPlantLocation] = useState('Balcony');

  // AI Recommendation Wizard Modal State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardResults, setWizardResults] = useState(null);
  const [wizardParams, setWizardParams] = useState({
    space: 'Small Balcony',
    sunlight: 'Partial Sunlight (3-6 hrs)',
    maintenance: 'Low to Medium',
    experience: 'Beginner',
    preferences: ['Herbs', 'Indoor Plants', 'Vegetables']
  });

  // Keep wizard parameters synced with user profile
  React.useEffect(() => {
    if (profile) {
      setWizardParams(prev => ({
        ...prev,
        space: profile.garden_space || prev.space,
        sunlight: profile.sunlight_availability || prev.sunlight,
        experience: profile.experience_level || prev.experience
      }));
    }
  }, [profile]);

  const categories = ['All', '✨ AI Recommended', 'Herbs', 'Vegetables', 'Indoor Plants', 'Flowers', 'Decorative Plants', 'Medicinal Plants'];

  const [filteredPlants, setFilteredPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  // Dedicated Google Knowledge Graph live search
  async function handleGoogleLiveSearch(term) {
    const queryToUse = (typeof term === 'string' ? term : searchQuery).trim();
    if (!queryToUse) return;

    setIsSearchingLive(true);
    addToast(`Searching Google Botanical Knowledge for "${queryToUse}"...`, 'info');

    try {
      const res = await fetchGoogleBotanicalSearch(queryToUse);
      if (res?.success && res.plants && res.plants.length > 0) {
        setFilteredPlants(prev => {
          const newOnes = res.plants.filter(p => !prev.some(x => x.name.toLowerCase() === p.name.toLowerCase() || x.scientific_name?.toLowerCase() === p.scientific_name?.toLowerCase()));
          return [...newOnes, ...prev];
        });
        addToast(`Discovered ${res.plants.length} botanical species with high-res photos!`, 'success');
      } else {
        addToast(`No live Google botanical matches found for "${queryToUse}".`, 'info');
      }
    } catch (e) {
      console.error('Google search failed:', e);
      addToast('Live botanical lookup failed. Please try again.', 'error');
    } finally {
      setIsSearchingLive(false);
    }
  }

  // Auto-generate recommendations if user clicks AI Recommended and results aren't ready
  async function handleRunWizard() {
    setWizardLoading(true);
    try {
      const res = await getGeminiRecommendations(wizardParams);
      if (res?.recommendations && res.recommendations.length > 0) {
        setWizardResults(res.recommendations);
        addToast(`Generated ${res.recommendations.length} personalized recommendations with verified photos!`, 'success');
      } else {
        addToast('No recommendations could be generated for these settings.', 'info');
      }
    } catch (e) {
      console.error('Wizard error:', e);
      addToast('Recommendation generation failed. Please try again.', 'error');
    } finally {
      setWizardLoading(false);
    }
  }

  // Fetch filtered plants from backend
  React.useEffect(() => {
    if (selectedCategory === '✨ AI Recommended') {
      if (!wizardResults && !wizardLoading) {
        handleRunWizard();
      }
      return;
    }

    async function loadPlants() {
      setIsLoading(true);
      try {
        const queryParams = {};
        if (selectedCategory !== 'All') queryParams.category = selectedCategory;
        if (selectedDifficulty !== 'All') queryParams.difficulty = selectedDifficulty;
        if (selectedPlacement !== 'All') queryParams.indoor_outdoor = selectedPlacement;
        if (selectedSunlight !== 'All') queryParams.sunlight = selectedSunlight;
        if (searchQuery.trim() !== '') queryParams.search = searchQuery;

        const data = await fetchPlantsCatalog(queryParams);
        if (data.success && data.plants) {
          setFilteredPlants(data.plants);
        } else {
          setFilteredPlants([]);
        }
      } catch (err) {
        console.error('Failed to load plants', err);
        setFilteredPlants([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Debounce the fetch slightly for search typing
    const timeoutId = setTimeout(() => {
      loadPlants();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedSunlight, selectedPlacement]);

  // Unified plants list reflecting standard catalog OR AI recommendations
  const displayedPlants = useMemo(() => {
    if (selectedCategory === '✨ AI Recommended') {
      if (wizardResults && wizardResults.length > 0) {
        return wizardResults.map(item => ({
          ...item.plant,
          matchPercentage: item.matchPercentage,
          matchReasons: item.matchReasons,
          isAiRecommended: true
        }));
      }
      return [];
    }
    return filteredPlants;
  }, [selectedCategory, wizardResults, filteredPlants]);

  function handleAddPlantSubmit(e) {
    e.preventDefault();
    if (!activePlant) return;

    addPlantToGarden({
      plant_id: activePlant.id,
      custom_name: customPlantName || activePlant.name,
      species: `${activePlant.name} (${activePlant.scientific_name})`,
      category: activePlant.category,
      custom_icon: getPlantIcon(activePlant),
      location: plantLocation,
      indoor_outdoor: activePlant.indoor_outdoor,
      photo_url: activePlant.image_url,
      care_schedule_defaults: activePlant.care_schedule_defaults
    });

    addToast(`Added ${customPlantName || activePlant.name} to My Garden! Care schedule created.`, 'success');
    setIsAddingToGarden(false);
    setActivePlant(null);
    setCustomPlantName('');
  }

  return (
    <div className="section-padding" style={{ paddingTop: '2rem' }}>
      <div className="container">
        
        {/* HEADER & AI WIZARD BANNER */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <span className="badge badge-forest" style={{ marginBottom: '0.5rem' }}>
              Botanical Flora Catalog
            </span>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-forest-dark)' }}>
              Plant Discovery & Care Directory
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', maxWidth: '600px' }}>
              Explore botanical profiles with verified sunlight, watering, and soil specifications. Filter for your microclimate or get Gemini recommendations.
            </p>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="btn btn-primary"
            style={{ gap: '0.5rem', boxShadow: '0 4px 14px rgba(27, 67, 50, 0.25)' }}
          >
            <Sparkles size={18} />
            AI Recommendation Wizard
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Search Input with Google Botanical Live Action */}
            <div className="discovery-search-col" style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search any plant worldwide (e.g. Bonsai Ficus, Bird of Paradise, ZZ Plant, Aloe)..."
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '9.5rem' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGoogleLiveSearch();
                    }
                  }}
                />
                <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                
                <button
                  type="button"
                  onClick={() => handleGoogleLiveSearch()}
                  disabled={isSearchingLive || !searchQuery.trim()}
                  className="btn btn-sm"
                  style={{
                    position: 'absolute',
                    right: '0.45rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#ecfdf5',
                    borderColor: '#a7f3d0',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: (!searchQuery.trim() || isSearchingLive) ? 'not-allowed' : 'pointer'
                  }}
                  title="Search live Google Knowledge Graph and Wikimedia High-Res Photos"
                >
                  {isSearchingLive ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Globe size={13} />
                  )}
                  Google Search
                </button>
              </div>

              {/* Quick Google Botanical Suggestion Chips */}
              <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Popular live lookups:
                </span>
                {[
                  'Bonsai Ficus',
                  'Bird of Paradise',
                  'ZZ Plant',
                  'Peace Lily',
                  'String of Pearls',
                  'Jade Plant',
                  'Monstera',
                  'Aloe Vera'
                ].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setSearchQuery(chip);
                      handleGoogleLiveSearch(chip);
                    }}
                    style={{
                      fontSize: '0.6875rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      backgroundColor: 'var(--color-mint-subtle)',
                      border: '1px solid var(--color-mint-light)',
                      color: 'var(--color-forest)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                className="form-select"
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
              >
                <option value="All">All Difficulty Levels</option>
                <option value="Easy">Easy (Beginner Friendly)</option>
                <option value="Moderate">Moderate</option>
                <option value="Challenging">Challenging</option>
              </select>
            </div>

            {/* Sunlight Filter */}
            <div>
              <select
                className="form-select"
                value={selectedSunlight}
                onChange={e => setSelectedSunlight(e.target.value)}
              >
                <option value="All">All Sunlight Levels</option>
                <option value="Full">Full Sunlight (6+ hrs)</option>
                <option value="Partial">Partial Sunlight (3-6 hrs)</option>
                <option value="Indirect">Indirect / Shaded</option>
                <option value="Low">Low Light</option>
              </select>
            </div>

            {/* Placement Filter */}
            <div>
              <select
                className="form-select"
                value={selectedPlacement}
                onChange={e => setSelectedPlacement(e.target.value)}
              >
                <option value="All">Indoor / Outdoor</option>
                <option value="Indoor">Indoor Only</option>
                <option value="Outdoor">Outdoor Only</option>
                <option value="Both">Both (Versatile)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingTop: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid var(--color-border)',
            scrollbarWidth: 'none'
          }}>
            {categories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8125rem',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? 'var(--color-forest)' : 'var(--color-bg-app)',
                    color: active ? '#ffffff' : 'var(--color-text-secondary)',
                    border: `1px solid ${active ? 'var(--color-forest)' : 'var(--color-border)'}`,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* PLANT CARDS GRID */}
        {(isLoading || (selectedCategory === '✨ AI Recommended' && wizardLoading)) ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '1rem' }}>
              <Sun size={32} color="var(--color-forest)" />
            </div>
            <p style={{ fontWeight: 600 }}>
              {selectedCategory === '✨ AI Recommended'
                ? 'Gemini is evaluating your space & retrieving verified botanical profiles...'
                : 'Fetching dynamic botanical data...'}
            </p>
          </div>
        ) : displayedPlants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            {selectedCategory === '✨ AI Recommended' ? (
              <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-mint-subtle)',
                  color: 'var(--color-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
                  Personalized Botanical Matches
                </h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
                  Tell Gemini about your space, sunlight, and time commitment to receive tailored plant cultivars with verified care routines.
                </p>
                <button
                  type="button"
                  onClick={() => setShowWizard(true)}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <Sparkles size={16} />
                  Open Recommendation Wizard
                </button>
              </div>
            ) : (
              <p>No plants match your current filters or search query.</p>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '1.75rem'
          }}>
            {displayedPlants.map(plant => {
              const isFav = favorites.includes(plant.id);
              return (
                <div
                  key={plant.id}
                  className="card card-interactive"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: plant.isAiRecommended ? '2px solid #10b981' : undefined,
                    boxShadow: plant.isAiRecommended ? '0 4px 18px rgba(16, 185, 129, 0.15)' : undefined
                  }}
                  onClick={() => {
                    setActivePlant(plant);
                    setCustomPlantName(plant.name);
                  }}
                >
                  {/* Plant Thumbnail & Badges */}
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={plant.image_url}
                      alt={plant.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span className="badge badge-forest" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)' }}>
                      {plant.category}
                    </span>

                    {plant.matchPercentage && (
                      <span
                        className="badge"
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '3.25rem',
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          borderColor: '#a7f3d0',
                          fontWeight: 700,
                          fontSize: '0.6875rem'
                        }}
                      >
                        ✨ {plant.matchPercentage}% Match
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(plant.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isFav ? '#e11d48' : 'var(--color-text-muted)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      aria-label="Favorite"
                    >
                      <Heart size={16} fill={isFav ? '#e11d48' : 'none'} />
                    </button>
                  </div>

                  {/* Plant Card Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)', lineHeight: 1.3 }}>
                        {plant.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {plant.scientific_name}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '0.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {plant.description}
                    </p>

                    {plant.matchReasons?.[0] && (
                      <div style={{
                        marginBottom: '0.75rem',
                        fontSize: '0.72rem',
                        color: '#065f46',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: '#f0fdf4',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '6px'
                      }}>
                        <Check size={12} color="#059669" />
                        <span>{plant.matchReasons[0]}</span>
                      </div>
                    )}

                    {/* Requirements Pills */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                        <Sun size={13} color="var(--color-earth)" />
                        {plant.sunlight ? plant.sunlight.split(' ')[0] : 'Partial'} Sun
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                        <Droplets size={13} color="#0284c7" />
                        {plant.care_schedule_defaults?.watering_interval_days || 3}d cycle
                      </span>
                      <span className="badge badge-outline" style={{ fontSize: '0.6875rem', marginLeft: 'auto' }}>
                        {plant.difficulty || 'Easy'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PLANT DETAIL MODAL */}
        {activePlant && (
          <div className="modal-backdrop" onClick={() => { setActivePlant(null); setIsAddingToGarden(false); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
              
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-forest">
                      {activePlant.category} • {activePlant.difficulty}
                    </span>
                    {activePlant.family && (
                      <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>
                        Family: {activePlant.family}
                      </span>
                    )}
                    {activePlant.pet_friendly !== undefined && (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontWeight: 700,
                        backgroundColor: activePlant.pet_friendly ? '#ecfdf5' : '#fff1f2',
                        color: activePlant.pet_friendly ? '#065f46' : '#be123c',
                        border: `1px solid ${activePlant.pet_friendly ? '#a7f3d0' : '#fecdd3'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        {activePlant.pet_friendly ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                        {activePlant.pet_friendly ? 'Pet Safe' : 'Toxic to Pets'}
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: '1.625rem', color: 'var(--color-forest-dark)', margin: '0 0 0.2rem 0' }}>
                    {activePlant.name}
                  </h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    {activePlant.scientific_name}
                  </span>
                </div>

                <button
                  onClick={() => { setActivePlant(null); setIsAddingToGarden(false); }}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Plant Image with Verified Google Knowledge Badge */}
              <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '240px', marginBottom: '1.5rem', backgroundColor: '#f1f5f9' }}>
                <img
                  src={activePlant.image_url}
                  alt={activePlant.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  right: '0.75rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.72)',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Globe size={12} color="#52b788" />
                  Google Knowledge & Wikimedia Verified
                </span>
              </div>

              {!isAddingToGarden ? (
                <>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {activePlant.description}
                  </p>

                  {/* Botanical Specification Matrix */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-bg-app)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Sunlight</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--color-forest-dark)' }}>{activePlant.sunlight}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Watering Routine</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--color-forest-dark)' }}>{activePlant.watering}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Soil Preference</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--color-forest-dark)' }}>{activePlant.soil}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Temperature Range</span>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--color-forest-dark)' }}>{activePlant.temperature}</strong>
                    </div>

                    {activePlant.toxicity_notes && (
                      <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', backgroundColor: activePlant.pet_friendly ? '#f0fdf4' : '#fff1f2', borderRadius: '8px', border: `1px solid ${activePlant.pet_friendly ? '#bbf7d0' : '#fecdd3'}` }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: activePlant.pet_friendly ? '#166534' : '#9f1239', display: 'block', marginBottom: '0.15rem' }}>
                          {activePlant.pet_friendly ? 'Pet Safety Information' : 'Pet & Human Toxicity Notice'}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: activePlant.pet_friendly ? '#15803d' : '#be123c', lineHeight: 1.4 }}>
                          {activePlant.toxicity_notes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Planting & Maintenance Tips */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', color: 'var(--color-forest-dark)', marginBottom: '0.35rem' }}>
                      Maintenance & Harvesting Guidance
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {activePlant.maintenance_tips}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      onClick={() => toggleFavorite(activePlant.id)}
                      className="btn btn-outline"
                    >
                      <Heart size={16} fill={favorites.includes(activePlant.id) ? '#e11d48' : 'none'} color={favorites.includes(activePlant.id) ? '#e11d48' : 'currentColor'} />
                      {favorites.includes(activePlant.id) ? 'Favorited' : 'Save to Favorites'}
                    </button>

                    <button
                      onClick={() => setIsAddingToGarden(true)}
                      className="btn btn-primary"
                    >
                      <Plus size={16} />
                      Add to My Garden
                    </button>
                  </div>
                </>
              ) : (
                /* INLINE ADD TO GARDEN FORM */
                <form onSubmit={handleAddPlantSubmit}>
                  <h4 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)', marginBottom: '1rem' }}>
                    Configure Plant for My Garden
                  </h4>

                  <div className="form-group">
                    <label className="form-label">Plant Nickname / Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={customPlantName}
                      onChange={e => setCustomPlantName(e.target.value)}
                      placeholder="e.g. My Sunny Basil or Window Lily"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location in Your Home</label>
                    <select
                      className="form-select"
                      value={plantLocation}
                      onChange={e => setPlantLocation(e.target.value)}
                    >
                      <option value="Balcony Railing">Balcony Railing</option>
                      <option value="Sunny Windowsill">Sunny Windowsill</option>
                      <option value="Living Room Desk">Living Room Desk</option>
                      <option value="Kitchen Window">Kitchen Window</option>
                      <option value="Backyard Raised Bed">Backyard Raised Bed</option>
                      <option value="Patio Container">Patio Container</option>
                    </select>
                  </div>

                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--color-mint-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-mint-light)',
                    marginBottom: '1.5rem',
                    fontSize: '0.8125rem',
                    color: 'var(--color-forest-dark)'
                  }}>
                    ✨ <strong>Auto-Generated Routine:</strong> Adding this plant will automatically create scheduled watering (every {activePlant.care_schedule_defaults.watering_interval_days} days) and fertilizing tasks in your Care Calendar!
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddingToGarden(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Confirm & Add to Garden
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* AI RECOMMENDATION WIZARD MODAL */}
        {showWizard && (
          <div className="modal-backdrop" onClick={() => setShowWizard(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-forest)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
                      Gemini Plant Recommendation Wizard
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Tell Gemini your setup to find ideal botanical matches
                    </span>
                  </div>
                </div>

                <button onClick={() => setShowWizard(false)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {!wizardResults ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Gardening Location / Space</label>
                    <input
                      type="text"
                      className="form-input"
                      value={wizardParams.space}
                      onChange={e => setWizardParams({ ...wizardParams, space: e.target.value })}
                      placeholder="e.g. Small West-Facing Balcony or Office Cubicle"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label className="form-label">Available Sunlight</label>
                      <select
                        className="form-select"
                        value={wizardParams.sunlight}
                        onChange={e => setWizardParams({ ...wizardParams, sunlight: e.target.value })}
                      >
                        <option value="Full Sunlight (6+ hrs)">Full Sunlight (6+ hrs)</option>
                        <option value="Partial Sunlight (3-6 hrs)">Partial Sunlight (3-6 hrs)</option>
                        <option value="Indirect / Shaded Light">Indirect / Shaded Light</option>
                        <option value="Low Light / Fluorescent">Low Light</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Time Commitment</label>
                      <select
                        className="form-select"
                        value={wizardParams.maintenance}
                        onChange={e => setWizardParams({ ...wizardParams, maintenance: e.target.value })}
                      >
                        <option value="Low">Low (10 mins/week)</option>
                        <option value="Low to Medium">Low to Medium</option>
                        <option value="Medium">Medium (Consistent)</option>
                        <option value="High">High (Daily hobbyist)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleRunWizard}
                    disabled={wizardLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    {wizardLoading ? 'Gemini is Analyzing Your Environment...' : 'Generate Personalized Recommendations'}
                  </button>
                </div>
              ) : (
                /* WIZARD RESULTS */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-forest-dark)', display: 'block' }}>
                        Recommended for Your {wizardParams.space}:
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {wizardResults.length} species matched with verified botanical photos
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWizard(false);
                          setSelectedCategory('✨ AI Recommended');
                        }}
                        className="btn btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#ecfdf5',
                          borderColor: '#a7f3d0',
                          color: '#065f46',
                          fontWeight: 700,
                          padding: '0.3rem 0.65rem'
                        }}
                      >
                        View in Main Grid
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizardResults(null)}
                        style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Refine Parameters
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {wizardResults.map((item, idx) => {
                      const plant = item.plant || item;
                      const reasons = item.matchReasons || [item.whyRecommended].filter(Boolean);
                      return (
                        <div
                          key={plant.id || idx}
                          style={{
                            display: 'flex',
                            gap: '0.85rem',
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: '#ffffff',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <img
                            src={plant.image_url || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=300&q=80'}
                            alt={plant.name}
                            style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, backgroundColor: '#f0fdf4' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <div>
                                <h4 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                                  {plant.name}
                                </h4>
                                {plant.scientific_name && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontStyle: 'italic', display: 'block' }}>
                                    {plant.scientific_name}
                                  </span>
                                )}
                              </div>
                              <span className="badge badge-forest" style={{ fontSize: '0.6875rem', flexShrink: 0 }}>
                                {item.matchPercentage || 95}% Match
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0.3rem 0', flexWrap: 'wrap' }}>
                              <span className="badge badge-outline" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.4rem' }}>
                                {plant.category}
                              </span>
                              {plant.sunlight && (
                                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <Sun size={11} color="var(--color-earth)" />
                                  {plant.sunlight.split(' ')[0]} Sun
                                </span>
                              )}
                              {plant.care_schedule_defaults?.watering_interval_days && (
                                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <Droplets size={11} color="#0284c7" />
                                  {plant.care_schedule_defaults.watering_interval_days}d water
                                </span>
                              )}
                            </div>

                            {reasons.length > 0 && (
                              <div style={{ marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                {reasons.slice(0, 2).map((r, rIdx) => (
                                  <span key={rIdx} style={{ fontSize: '0.72rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Check size={11} color="#059669" />
                                    {r}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--color-border)' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowWizard(false);
                                  setActivePlant(plant);
                                }}
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--color-forest)',
                                  fontWeight: 600,
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              >
                                View Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowWizard(false);
                                  setActivePlant(plant);
                                  setIsAddingToGarden(true);
                                  setCustomPlantName(plant.name);
                                }}
                                className="btn btn-sm btn-primary"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.2rem 0.55rem',
                                  marginLeft: 'auto',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Plus size={12} />
                                Add to Garden
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .discovery-search-col {
            grid-column: span 2 !important;
          }
        }
      `}</style>
    </div>
  );
}
