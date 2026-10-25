import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Flower2, 
  Droplets, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  Sparkles,
  Archive,
  CheckCircle2,
  X,
  HeartPulse
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { useNotifications } from '../context/NotificationContext';
import { BotanicalSanctuary } from '../components/garden/BotanicalSanctuary';
import { BOTANICAL_ICONS, getPlantIcon } from '../data/botanicalIcons';

export function MyGardenPage({ onNavigate, onSelectPlant, onOpenDoctor }) {
  const { plants, tasks, addPlantToGarden, removePlant, updatePlant } = useGarden();
  const { addToast } = useNotifications();

  const [viewMode, setViewMode] = useState('sanctuary'); // 'sanctuary' | 'grid' | 'list'
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Add Plant Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlantData, setNewPlantData] = useState({
    custom_name: '',
    species: '',
    category: 'Herbs',
    custom_icon: '🌿',
    location: 'Balcony Container',
    indoor_outdoor: 'Outdoor',
    acquisition_date: new Date().toISOString().split('T')[0],
    status: 'Thriving',
    notes: '',
    photo_url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'
  });

  const statuses = ['All', 'Thriving', 'Growing', 'Seedling', 'Flowering', 'Harvest Ready', 'Archived'];

  const filteredPlants = plants.filter(plant => {
    if (filterStatus !== 'All' && plant.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesName = plant.custom_name.toLowerCase().includes(q);
      const matchesSpecies = plant.species.toLowerCase().includes(q);
      const matchesLoc = plant.location?.toLowerCase().includes(q);
      if (!matchesName && !matchesSpecies && !matchesLoc) return false;
    }
    return true;
  });

  function handleManualAdd(e) {
    e.preventDefault();
    if (!newPlantData.custom_name) return;

    addPlantToGarden({
      ...newPlantData,
      custom_icon: newPlantData.custom_icon || '🌿',
      care_schedule_defaults: {
        watering_interval_days: 3,
        fertilizing_interval_days: 21,
        pruning_interval_days: 14
      }
    });

    addToast(`Added ${newPlantData.custom_name} to your garden!`, 'success');
    setShowAddModal(false);
    setNewPlantData({
      custom_name: '',
      species: '',
      category: 'Herbs',
      custom_icon: '🌿',
      location: 'Balcony Container',
      indoor_outdoor: 'Outdoor',
      acquisition_date: new Date().toISOString().split('T')[0],
      status: 'Thriving',
      notes: '',
      photo_url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80'
    });
  }

  return (
    <div className="section-padding" style={{ paddingTop: '2rem' }}>
      <div className="container">
        
        {/* HEADER BAR */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <span className="badge badge-forest" style={{ marginBottom: '0.4rem' }}>
              My Botanical Sanctuary
            </span>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-forest-dark)' }}>
              My Garden ({plants.length})
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              Manage your personal living collection, check individual care routines, and record plant progress.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenDoctor ? onOpenDoctor() : onNavigate('disease-doctor')}
              className="btn btn-outline"
              style={{ gap: '0.4rem', borderColor: '#a7f3d0', color: '#065f46', backgroundColor: '#ecfdf5', fontWeight: 600 }}
            >
              <HeartPulse size={16} color="#059669" />
              Plant Doctor
            </button>
            <button
              onClick={() => onNavigate('discover')}
              className="btn btn-outline"
            >
              Browse Catalog
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
            >
              <Plus size={18} />
              Add Custom Plant
            </button>
          </div>
        </div>

        {/* FOREST APP 3D BOTANICAL SANCTUARY VIEW */}
        {viewMode === 'sanctuary' && (
          <BotanicalSanctuary
            onSelectPlant={onSelectPlant}
            onOpenDoctor={onOpenDoctor}
            onAddNewPlant={() => setShowAddModal(true)}
          />
        )}

        {/* SEARCH, STATUS FILTER & VIEW TOGGLE */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search garden by nickname, species, or location..."
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={17} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* View Mode Toggle: Sanctuary 3D, Grid, List */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--color-bg-app)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setViewMode('sanctuary')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'sanctuary' ? 'var(--color-forest)' : 'transparent',
                  color: viewMode === 'sanctuary' ? '#ffffff' : 'var(--color-text-muted)',
                  boxShadow: viewMode === 'sanctuary' ? 'var(--shadow-sm)' : 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Forest App 3D Sanctuary View"
              >
                <span>🌳</span>
                <span>Sanctuary (3D)</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'grid' ? 'var(--color-forest)' : 'transparent',
                  color: viewMode === 'grid' ? '#ffffff' : 'var(--color-text-muted)',
                  boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Grid Card View"
              >
                <Grid size={15} />
                <span>Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: viewMode === 'list' ? 'var(--color-forest)' : 'transparent',
                  color: viewMode === 'list' ? '#ffffff' : 'var(--color-text-muted)',
                  boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 650,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="List Inventory View"
              >
                <List size={15} />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            {statuses.map(st => {
              const active = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? 'var(--color-forest)' : 'var(--color-bg-app)',
                    color: active ? '#ffffff' : 'var(--color-text-secondary)',
                    border: `1px solid ${active ? 'var(--color-forest)' : 'var(--color-border)'}`,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* PLANTS DISPLAY */}
        {filteredPlants.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <Flower2 size={40} color="var(--color-sage)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
              No plants match your search.
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Try adjusting your filter or add a new plant to your garden.
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <Plus size={16} />
              Add Plant
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* LIST VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredPlants.map(plant => (
              <div
                key={plant.id}
                className="card card-interactive"
                onClick={() => onSelectPlant(plant)}
                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={plant.photo_url}
                    alt={plant.custom_name}
                    style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}>
                    {getPlantIcon(plant)}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                      {plant.custom_name}
                    </h4>
                    <span className="badge badge-forest" style={{ fontSize: '0.6875rem' }}>
                      {plant.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    {plant.species}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
                  <span className="badge" style={{
                    backgroundColor: plant.status === 'Thriving' ? '#e8f5e9' : plant.status === 'Flowering' ? '#fef3c7' : '#f1f5f9',
                    color: plant.status === 'Thriving' ? '#1b4332' : plant.status === 'Flowering' ? '#b45309' : '#334155'
                  }}>
                    {plant.status}
                  </span>
                  <ArrowRight size={16} color="var(--color-forest)" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* GRID VIEW (Shows in 'grid' mode and under 'sanctuary' mode) */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredPlants.map(plant => {
              const plantTasks = tasks.filter(t => t.garden_plant_id === plant.id && !t.is_completed);
              return (
                <div
                  key={plant.id}
                  className="card card-interactive"
                  onClick={() => onSelectPlant(plant)}
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  {/* Photo & Status Badge with Custom Icon */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={plant.photo_url}
                      alt={plant.custom_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span className="badge" style={{
                      position: 'absolute',
                      top: '0.75rem',
                      left: '0.75rem',
                      backgroundColor: plant.status === 'Thriving' ? '#e8f5e9' : plant.status === 'Flowering' ? '#fef3c7' : '#f1f5f9',
                      color: plant.status === 'Thriving' ? '#1b4332' : plant.status === 'Flowering' ? '#b45309' : '#334155',
                      backdropFilter: 'blur(4px)',
                      fontWeight: 700
                    }}>
                      {plant.status}
                    </span>
                    <span className="badge badge-forest" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', backgroundColor: 'rgba(255,255,255,0.9)' }}>
                      {plant.category}
                    </span>

                    {/* Custom Botanical Icon Emblem */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '0.75rem',
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.35rem',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {getPlantIcon(plant)}
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ marginBottom: '0.65rem' }}>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
                        {plant.custom_name}
                      </h3>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {plant.species}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                      <MapPin size={14} color="var(--color-forest)" />
                      {plant.location} • {plant.indoor_outdoor}
                    </div>

                    {plant.notes && (
                      <p style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.4,
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        "{plant.notes}"
                      </p>
                    )}

                    {/* Footer Task Counter & Action */}
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: plantTasks.length > 0 ? 'var(--color-forest)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                        {plantTasks.length > 0 ? `${plantTasks.length} pending task(s)` : 'All tasks up to date'}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-forest)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        Care Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MANUAL ADD PLANT MODAL */}
        {showAddModal && (
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--color-forest-dark)' }}>
                  Add Plant to My Garden
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleManualAdd}>
                {/* Custom Botanical Icon Selector */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Choose Botanical Icon</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-forest)', fontWeight: 650 }}>
                      Selected: {newPlantData.custom_icon} {BOTANICAL_ICONS.find(i => i.icon === newPlantData.custom_icon)?.label}
                    </span>
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '0.5rem',
                    padding: '0.65rem',
                    backgroundColor: 'var(--color-bg-app)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)'
                  }}>
                    {BOTANICAL_ICONS.map(item => {
                      const isSelected = newPlantData.custom_icon === item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setNewPlantData({ ...newPlantData, custom_icon: item.icon })}
                          style={{
                            height: '42px',
                            fontSize: '1.45rem',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid var(--color-forest)' : '1px solid transparent',
                            backgroundColor: isSelected ? '#ffffff' : 'transparent',
                            boxShadow: isSelected ? '0 2px 8px rgba(45, 106, 79, 0.22)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={item.label}
                        >
                          {item.icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Plant Nickname</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Grandma's Rosemary"
                    value={newPlantData.custom_name}
                    onChange={e => setNewPlantData({ ...newPlantData, custom_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Plant Species / Botanical Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Salvia rosmarinus"
                    value={newPlantData.species}
                    onChange={e => setNewPlantData({ ...newPlantData, species: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newPlantData.category}
                      onChange={e => setNewPlantData({ ...newPlantData, category: e.target.value })}
                    >
                      <option value="Herbs">Herbs</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Indoor Plants">Indoor Plants</option>
                      <option value="Flowers">Flowers</option>
                      <option value="Decorative Plants">Decorative Plants</option>
                      <option value="Medicinal Plants">Medicinal Plants</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newPlantData.status}
                      onChange={e => setNewPlantData({ ...newPlantData, status: e.target.value })}
                    >
                      <option value="Seedling">Seedling</option>
                      <option value="Growing">Growing</option>
                      <option value="Thriving">Thriving</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Harvest Ready">Harvest Ready</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Location in Home</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newPlantData.location}
                      onChange={e => setNewPlantData({ ...newPlantData, location: e.target.value })}
                      placeholder="e.g. Kitchen Railing"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Placement</label>
                    <select
                      className="form-select"
                      value={newPlantData.indoor_outdoor}
                      onChange={e => setNewPlantData({ ...newPlantData, indoor_outdoor: e.target.value })}
                    >
                      <option value="Outdoor">Outdoor</option>
                      <option value="Indoor">Indoor</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Photo URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={newPlantData.photo_url}
                    onChange={e => setNewPlantData({ ...newPlantData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Botanical Notes / Observations</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={newPlantData.notes}
                    onChange={e => setNewPlantData({ ...newPlantData, notes: e.target.value })}
                    placeholder="e.g. Grown from a cutting received in spring..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save to My Garden
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
