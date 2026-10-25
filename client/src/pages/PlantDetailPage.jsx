import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Droplets, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  Archive, 
  Check, 
  Plus, 
  MapPin, 
  Camera,
  Scissors,
  HeartPulse
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { useNotifications } from '../context/NotificationContext';
import { generateGeminiCareRoutine } from '../lib/api';

export function PlantDetailPage({ plant, onBack, onNavigate, onOpenDoctor }) {
  const { tasks, growthRecords, updatePlant, removePlant, toggleTaskCompletion, addGrowthRecord } = useGarden();
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('care'); // 'care' | 'growth' | 'ai'
  const [aiRoutine, setAiRoutine] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Edit Plant State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    custom_name: plant.custom_name,
    status: plant.status,
    location: plant.location,
    notes: plant.notes || ''
  });

  // Quick Growth Log State
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLogData, setNewLogData] = useState({
    height_cm: '',
    leaf_count: '',
    milestone: '',
    notes: '',
    photo_url: plant.photo_url
  });

  // Filter plant specific tasks and growth
  const plantTasks = tasks.filter(t => t.garden_plant_id === plant.id);
  const plantGrowth = growthRecords.filter(g => g.garden_plant_id === plant.id);

  // Load AI care routine on tab switch
  useEffect(() => {
    async function fetchRoutine() {
      if (activeTab === 'ai' && !aiRoutine) {
        setLoadingAi(true);
        try {
          const res = await generateGeminiCareRoutine(plant.species || plant.custom_name, {
            location: plant.location,
            sunlight: 'Balcony Sunlight'
          });
          if (res?.carePlan) {
            setAiRoutine(res.carePlan);
          }
        } catch (err) {
          console.error('Failed to generate AI care routine:', err);
        } finally {
          setLoadingAi(false);
        }
      }
    }
    fetchRoutine();
  }, [activeTab]);

  function handleUpdateSubmit(e) {
    e.preventDefault();
    updatePlant(plant.id, editFormData);
    addToast('Plant information updated successfully.', 'success');
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Are you sure you want to remove ${plant.custom_name} from your garden?`)) {
      removePlant(plant.id);
      addToast(`${plant.custom_name} was removed from your garden.`, 'info');
      onBack();
    }
  }

  function handleAddGrowthLog(e) {
    e.preventDefault();
    addGrowthRecord({
      garden_plant_id: plant.id,
      plant_name: plant.custom_name,
      height_cm: parseFloat(newLogData.height_cm) || 0,
      leaf_count: parseInt(newLogData.leaf_count) || 0,
      milestone: newLogData.milestone || 'Periodic Growth Observation',
      notes: newLogData.notes,
      photo_url: newLogData.photo_url || plant.photo_url,
      recorded_at: new Date().toISOString().split('T')[0]
    });
    addToast('Growth milestone recorded!', 'success');
    setShowLogModal(false);
    setNewLogData({ height_cm: '', leaf_count: '', milestone: '', notes: '', photo_url: plant.photo_url });
  }

  return (
    <div className="section-padding" style={{ paddingTop: '2rem' }}>
      <div className="container">
        
        {/* TOP NAVIGATION BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <button
            onClick={onBack}
            className="btn btn-ghost"
            style={{ paddingLeft: 0, gap: '0.4rem' }}
          >
            <ArrowLeft size={18} />
            Back to My Garden
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenDoctor ? onOpenDoctor(plant) : onNavigate('disease-doctor')}
              className="btn btn-sm"
              style={{
                gap: '0.4rem',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontWeight: 700
              }}
              title="Scan plant foliage for disease using AI"
            >
              <HeartPulse size={15} color="#059669" />
              Check Plant Health
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <Edit3 size={15} />
              {isEditing ? 'Cancel Edit' : 'Edit Plant'}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-sm"
              style={{ color: '#dc2626', backgroundColor: '#fee2e2' }}
              title="Delete Plant"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* PLANT HERO CARD */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            {/* Plant Image */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '280px' }}>
              <img
                src={plant.photo_url}
                alt={plant.custom_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge" style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: 'var(--color-forest-dark)',
                fontWeight: 700
              }}>
                {plant.status}
              </span>
            </div>

            {/* Plant Details */}
            <div>
              {!isEditing ? (
                <>
                  <span className="badge badge-forest" style={{ marginBottom: '0.5rem' }}>
                    {plant.category} • {plant.indoor_outdoor}
                  </span>
                  <h1 style={{ fontSize: '2.25rem', color: 'var(--color-forest-dark)', lineHeight: 1.2, marginBottom: '0.35rem' }}>
                    {plant.custom_name}
                  </h1>
                  <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    {plant.species}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="var(--color-forest)" />
                      <span><strong>Location:</strong> {plant.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="var(--color-forest)" />
                      <span><strong>Added on:</strong> {plant.acquisition_date}</span>
                    </div>
                  </div>

                  {plant.notes && (
                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'var(--color-bg-app)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                      lineHeight: 1.5
                    }}>
                      "{plant.notes}"
                    </div>
                  )}
                </>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleUpdateSubmit}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '1rem' }}>
                    Edit Plant Information
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Nickname</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editFormData.custom_name}
                      onChange={e => setEditFormData({ ...editFormData, custom_name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={editFormData.status}
                        onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                      >
                        <option value="Seedling">Seedling</option>
                        <option value="Growing">Growing</option>
                        <option value="Thriving">Thriving</option>
                        <option value="Flowering">Flowering</option>
                        <option value="Harvest Ready">Harvest Ready</option>
                        <option value="Dormant">Dormant</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.location}
                        onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      value={editFormData.notes}
                      onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Save Changes
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* SECTION TABS: CARE ROUTINES | GROWTH HISTORY | GEMINI ADVISORY */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '2rem'
        }}>
          {[
            { id: 'care', label: 'Care Schedule & Tasks', icon: Calendar },
            { id: 'growth', label: 'Growth Records & Photos', icon: TrendingUp },
            { id: 'ai', label: 'Gemini Botanical Advisory', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  borderBottom: `2.5px solid ${active ? 'var(--color-forest)' : 'transparent'}`,
                  color: active ? 'var(--color-forest)' : 'var(--color-text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.9375rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CARE SCHEDULE & TASKS */}
        {activeTab === 'care' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
                  Scheduled Tasks for {plant.custom_name}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Click checkmark to mark task completed and advance streak
                </span>
              </div>
            </div>

            {plantTasks.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                No active care tasks scheduled for this plant yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {plantTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskCompletion(task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: task.is_completed ? 'var(--color-bg-subtle)' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <button
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: `2px solid ${task.is_completed ? 'var(--color-forest)' : '#cbd5e1'}`,
                        backgroundColor: task.is_completed ? 'var(--color-forest)' : 'transparent',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {task.is_completed && <Check size={15} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: task.is_completed ? 'var(--color-text-muted)' : 'var(--color-forest-dark)', textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                          {task.title}
                        </span>
                        <span className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>
                          {task.task_type}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                        {task.description}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Due: <strong>{task.due_date}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GROWTH RECORDS & PHOTOS */}
        {activeTab === 'growth' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
                  Growth Timeline & Milestones
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Quantitative measurements and photograph history
                </span>
              </div>

              <button
                onClick={() => setShowLogModal(true)}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <Camera size={15} />
                Log Growth Record
              </button>
            </div>

            {plantGrowth.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <TrendingUp size={36} color="var(--color-sage)" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ fontWeight: 600, color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
                  No growth records logged yet.
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  Record the plant's height, leaf count, and photos to chart its development over time.
                </p>
                <button onClick={() => setShowLogModal(true)} className="btn btn-outline btn-sm">
                  Log First Milestone
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {plantGrowth.map(log => (
                  <div key={log.id} className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ height: '180px', overflow: 'hidden' }}>
                      <img
                        src={log.photo_url}
                        alt={log.milestone}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.recorded_at}</span>
                      <h4 style={{ fontSize: '1.0625rem', color: 'var(--color-forest-dark)', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
                        {log.milestone}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-forest)', fontWeight: 600, marginBottom: '0.5rem' }}>
                        <span>Height: {log.height_cm} cm</span>
                        <span>•</span>
                        <span>Leaves: {log.leaf_count}</span>
                      </div>
                      {log.notes && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GEMINI BOTANICAL ADVISORY */}
        {activeTab === 'ai' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-forest)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>
                  Gemini Botanical Routine for {plant.custom_name}
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Calibrated for {plant.location}
                </span>
              </div>
            </div>

            {loadingAi ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Consulting botanical reasoning engine for {plant.species}...
              </p>
            ) : aiRoutine ? (
              <div>
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-mint-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-mint-light)',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-forest-dark)', lineHeight: 1.5 }}>
                    {aiRoutine.routineSummary}
                  </p>
                </div>

                <h4 style={{ fontSize: '1rem', color: 'var(--color-forest-dark)', marginBottom: '0.75rem' }}>
                  Recommended Weekly Care Cycle
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {aiRoutine.weeklyChecklist?.map((item, idx) => (
                    <div key={idx} style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <span className="badge badge-forest" style={{ marginBottom: '0.4rem' }}>{item.day}</span>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-forest-dark)', marginBottom: '0.2rem' }}>
                        {item.action}
                      </strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => onNavigate('assistant')}
                    className="btn btn-outline"
                    style={{ gap: '0.5rem' }}
                  >
                    Ask Gemini More Questions About {plant.custom_name}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* LOG GROWTH MODAL */}
        {showLogModal && (
          <div className="modal-backdrop" onClick={() => setShowLogModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-forest-dark)', marginBottom: '1.25rem' }}>
                Log Growth for {plant.custom_name}
              </h3>

              <form onSubmit={handleAddGrowthLog}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Plant Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="form-input"
                      placeholder="e.g. 15.5"
                      value={newLogData.height_cm}
                      onChange={e => setNewLogData({ ...newLogData, height_cm: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Leaf Count</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      placeholder="e.g. 12"
                      value={newLogData.leaf_count}
                      onChange={e => setNewLogData({ ...newLogData, leaf_count: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Growth Milestone Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. First Stem Branching or Blossom Spurt"
                    value={newLogData.milestone}
                    onChange={e => setNewLogData({ ...newLogData, milestone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Photo URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={newLogData.photo_url}
                    onChange={e => setNewLogData({ ...newLogData, photo_url: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Notes / Observation</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="e.g. Vigorous new leaves, foliage feels crisp and healthy..."
                    value={newLogData.notes}
                    onChange={e => setNewLogData({ ...newLogData, notes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowLogModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Record
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
