import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Camera, 
  Calendar, 
  Ruler, 
  Leaf, 
  Sparkles, 
  ArrowRight,
  SplitSquareVertical,
  X
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { useNotifications } from '../context/NotificationContext';

export function GrowthTrackerPage() {
  const { growthRecords, plants, addGrowthRecord } = useGarden();
  const { addToast } = useNotifications();

  const [selectedPlantId, setSelectedPlantId] = useState('All');
  const [showLogModal, setShowLogModal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  // New Record State
  const [newRecordData, setNewRecordData] = useState({
    garden_plant_id: plants[0]?.id || '',
    plant_name: plants[0]?.custom_name || '',
    height_cm: '',
    leaf_count: '',
    milestone: '',
    notes: '',
    photo_url: plants[0]?.photo_url || 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Ocimum_basilicum_8zz.jpg/1280px-Ocimum_basilicum_8zz.jpg',
    recorded_at: new Date().toISOString().split('T')[0]
  });

  const filteredRecords = growthRecords.filter(r => {
    if (selectedPlantId !== 'All' && r.garden_plant_id !== selectedPlantId) return false;
    return true;
  });

  // Calculate stats
  const totalLogs = filteredRecords.length;
  const maxHeight = filteredRecords.reduce((max, r) => Math.max(max, Number(r.height_cm) || 0), 0);
  const maxLeaves = filteredRecords.reduce((max, r) => Math.max(max, Number(r.leaf_count) || 0), 0);

  function handleAddRecord(e) {
    e.preventDefault();
    const plant = plants.find(p => p.id === newRecordData.garden_plant_id);
    addGrowthRecord({
      ...newRecordData,
      plant_name: plant ? plant.custom_name : 'Plant Specimen',
      height_cm: parseFloat(newRecordData.height_cm) || 0,
      leaf_count: parseInt(newRecordData.leaf_count) || 0
    });

    addToast('Growth observation recorded to timeline!', 'success');
    setShowLogModal(false);
    setNewRecordData({
      garden_plant_id: plants[0]?.id || '',
      plant_name: plants[0]?.custom_name || '',
      height_cm: '',
      leaf_count: '',
      milestone: '',
      notes: '',
      photo_url: plants[0]?.photo_url || '',
      recorded_at: new Date().toISOString().split('T')[0]
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
              Botanical Metrics
            </span>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-forest-dark)' }}>
              Plant Growth Tracker
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              Record stem heights, leaf counts, and photo milestones to chart your plants' development.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className="btn btn-outline"
              style={{ gap: '0.4rem' }}
            >
              <SplitSquareVertical size={16} />
              {comparisonMode ? 'View Timeline' : 'Compare Photos'}
            </button>

            <button
              onClick={() => setShowLogModal(true)}
              className="btn btn-primary"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={16} />
              Log Measurement
            </button>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--color-mint-subtle)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-forest-dark)', lineHeight: 1, display: 'block' }}>
                {totalLogs}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Logged Milestones</span>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--color-mint-subtle)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ruler size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-forest-dark)', lineHeight: 1, display: 'block' }}>
                {maxHeight} cm
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Peak Plant Height</span>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'var(--color-clay-wash)', color: 'var(--color-earth-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-earth-dark)', lineHeight: 1, display: 'block' }}>
                {maxLeaves}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Max Leaf Foliage</span>
            </div>
          </div>
        </div>

        {/* PLANT FILTER TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem' }}>
          <button
            onClick={() => setSelectedPlantId('All')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8125rem',
              fontWeight: selectedPlantId === 'All' ? 700 : 500,
              backgroundColor: selectedPlantId === 'All' ? 'var(--color-forest)' : '#ffffff',
              color: selectedPlantId === 'All' ? '#ffffff' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              whiteSpace: 'nowrap'
            }}
          >
            All Plants
          </button>
          {plants.map(p => {
            const active = selectedPlantId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlantId(p.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? 'var(--color-forest)' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.custom_name}
              </button>
            );
          })}
        </div>

        {/* COMPARISON VIEW (BEFORE & AFTER) */}
        {comparisonMode && filteredRecords.length >= 2 && (
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
              Botanical Progress Comparison
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Comparing earliest recorded milestone with latest observation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {/* Earliest Record */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ height: '240px', overflow: 'hidden' }}>
                  <img
                    src={filteredRecords[filteredRecords.length - 1].photo_url}
                    alt="Earlier photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)' }}>
                  <span className="badge badge-outline" style={{ marginBottom: '0.35rem' }}>Earliest Observation</span>
                  <h4 style={{ fontSize: '0.9375rem', color: 'var(--color-forest-dark)' }}>
                    {filteredRecords[filteredRecords.length - 1].milestone}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {filteredRecords[filteredRecords.length - 1].recorded_at} • Height: {filteredRecords[filteredRecords.length - 1].height_cm} cm
                  </span>
                </div>
              </div>

              {/* Latest Record */}
              <div style={{ border: '1.5px solid var(--color-forest)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ height: '240px', overflow: 'hidden' }}>
                  <img
                    src={filteredRecords[0].photo_url}
                    alt="Latest photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--color-mint-subtle)' }}>
                  <span className="badge badge-forest" style={{ marginBottom: '0.35rem' }}>Latest Milestone</span>
                  <h4 style={{ fontSize: '0.9375rem', color: 'var(--color-forest-dark)' }}>
                    {filteredRecords[0].milestone}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-forest)' }}>
                    {filteredRecords[0].recorded_at} • Height: {filteredRecords[0].height_cm} cm (+{(filteredRecords[0].height_cm - filteredRecords[filteredRecords.length - 1].height_cm).toFixed(1)} cm growth!)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        <div style={{ position: 'relative' }}>
          {/* Vertical timeline line */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            backgroundColor: 'var(--color-border)',
            zIndex: 0
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 1 }}>
            {filteredRecords.map((record, index) => (
              <div key={record.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Timeline node */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: index === 0 ? 'var(--color-forest)' : '#ffffff',
                  border: `2px solid ${index === 0 ? 'var(--color-forest)' : 'var(--color-sage)'}`,
                  color: index === 0 ? '#ffffff' : 'var(--color-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Leaf size={18} />
                </div>

                {/* Timeline Card */}
                <div className="card" style={{ flex: 1, padding: '1.5rem', backgroundColor: '#ffffff' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'center'
                  }}>
                    {/* Record Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-forest">{record.plant_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{record.recorded_at}</span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
                        {record.milestone}
                      </h3>

                      {/* Measurables */}
                      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                          <Ruler size={16} />
                          Height: {record.height_cm} cm
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                          <Leaf size={16} />
                          Leaves: {record.leaf_count}
                        </div>
                      </div>

                      {record.notes && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          "{record.notes}"
                        </p>
                      )}
                    </div>

                    {/* Photo */}
                    {record.photo_url && (
                      <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '180px' }}>
                        <img
                          src={record.photo_url}
                          alt={record.milestone}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOG GROWTH MODAL */}
        {showLogModal && (
          <div className="modal-backdrop" onClick={() => setShowLogModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '1.25rem' }}>
                Log Growth Measurement
              </h3>

              <form onSubmit={handleAddRecord}>
                <div className="form-group">
                  <label className="form-label">Select Plant</label>
                  <select
                    className="form-select"
                    value={newRecordData.garden_plant_id}
                    onChange={e => setNewRecordData({ ...newRecordData, garden_plant_id: e.target.value })}
                  >
                    {plants.map(p => (
                      <option key={p.id} value={p.id}>{p.custom_name} ({p.species})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="form-input"
                      placeholder="e.g. 18.5"
                      value={newRecordData.height_cm}
                      onChange={e => setNewRecordData({ ...newRecordData, height_cm: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Leaves</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      placeholder="e.g. 14"
                      value={newRecordData.leaf_count}
                      onChange={e => setNewRecordData({ ...newRecordData, leaf_count: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Milestone Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Stems branching or Rapid spring spurt"
                    value={newRecordData.milestone}
                    onChange={e => setNewRecordData({ ...newRecordData, milestone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Photo URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={newRecordData.photo_url}
                    onChange={e => setNewRecordData({ ...newRecordData, photo_url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Observations</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Leaf color vibrant green, new buds forming..."
                    value={newRecordData.notes}
                    onChange={e => setNewRecordData({ ...newRecordData, notes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowLogModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Record Measurement
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
