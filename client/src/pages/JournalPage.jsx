import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Tag, 
  Calendar, 
  Trash2, 
  Edit3, 
  Camera, 
  Sparkles,
  X
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { useNotifications } from '../context/NotificationContext';

export function JournalPage() {
  const { journalEntries, plants, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useGarden();
  const { addToast } = useNotifications();

  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New/Edit Entry State
  const [entryData, setEntryData] = useState({
    title: '',
    content: '',
    garden_plant_id: '',
    tags: 'Harvest, Culinary',
    photo_url: '',
    entry_date: new Date().toISOString().split('T')[0]
  });

  const availableTags = ['All', 'Harvest', 'Repotting', 'Milestone', 'Culinary', 'Observation', 'Balcony'];

  const filteredEntries = journalEntries.filter(entry => {
    if (selectedTag !== 'All' && !entry.tags?.includes(selectedTag)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = entry.title.toLowerCase().includes(q);
      const matchesContent = entry.content.toLowerCase().includes(q);
      const matchesPlant = entry.plant_name?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesContent && !matchesPlant) return false;
    }
    return true;
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!entryData.title || !entryData.content) return;

    const plant = plants.find(p => p.id === entryData.garden_plant_id);
    const tagsArray = entryData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addJournalEntry({
      ...entryData,
      plant_name: plant ? plant.custom_name : 'General Garden',
      tags: tagsArray.length > 0 ? tagsArray : ['Observation']
    });

    addToast('Journal entry published to your gardening diary!', 'success');
    setShowModal(false);
    setEntryData({
      title: '',
      content: '',
      garden_plant_id: '',
      tags: 'Harvest, Culinary',
      photo_url: '',
      entry_date: new Date().toISOString().split('T')[0]
    });
  }

  function handleDelete(id, title) {
    if (window.confirm(`Delete journal entry "${title}"?`)) {
      deleteJournalEntry(id);
      addToast('Journal entry deleted.', 'info');
    }
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
              Gardening Chronicle
            </span>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-forest-dark)' }}>
              Garden Journal
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              Chronicle your harvests, repotting milestones, culinary creations, and botanical reflections.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} />
            New Journal Entry
          </button>
        </div>

        {/* SEARCH & FILTER STRIP */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search journal entries by title, plant, or memories..."
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Tag Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
              {availableTags.map(tag => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? 'var(--color-forest)' : 'var(--color-bg-app)',
                      color: active ? '#ffffff' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHRONOLOGICAL TIMELINE ENTRIES */}
        {filteredEntries.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <BookOpen size={36} color="var(--color-sage)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
              No journal entries found.
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Start by recording your first harvest or garden observation!
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={16} />
              Write First Entry
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {filteredEntries.map(entry => (
              <div key={entry.id} className="card" style={{ padding: '1.75rem', backgroundColor: '#ffffff' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: entry.photo_url ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
                  gap: '2rem',
                  alignItems: 'center'
                }}>
                  {/* Text Content */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{entry.entry_date}</span>
                        <h2 style={{ fontSize: '1.35rem', color: 'var(--color-forest-dark)', marginTop: '0.2rem' }}>
                          {entry.title}
                        </h2>
                        {entry.plant_name && (
                          <span className="badge badge-forest" style={{ marginTop: '0.35rem' }}>
                            Plant: {entry.plant_name}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(entry.id, entry.title)}
                        style={{ color: '#94a3b8', padding: '0.35rem' }}
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {entry.content}
                    </p>

                    {/* Tag Badges */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {entry.tags?.map((t, i) => (
                        <span key={i} className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attached Photograph */}
                  {entry.photo_url && (
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '240px' }}>
                      <img
                        src={entry.photo_url}
                        alt={entry.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE JOURNAL ENTRY MODAL */}
        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--color-forest-dark)' }}>
                  New Garden Journal Entry
                </h3>
                <button onClick={() => setShowModal(false)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Entry Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. First Fresh Herb Pesto or Repotting Afternoon"
                    value={entryData.title}
                    onChange={e => setEntryData({ ...entryData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Associated Plant</label>
                    <select
                      className="form-select"
                      value={entryData.garden_plant_id}
                      onChange={e => setEntryData({ ...entryData, garden_plant_id: e.target.value })}
                    >
                      <option value="">General Garden</option>
                      {plants.map(p => (
                        <option key={p.id} value={p.id}>{p.custom_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={entryData.entry_date}
                      onChange={e => setEntryData({ ...entryData, entry_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Journal Notes & Observations</label>
                  <textarea
                    rows={4}
                    required
                    className="form-textarea"
                    placeholder="Describe your progress, soil smell, harvest taste, or weather notes..."
                    value={entryData.content}
                    onChange={e => setEntryData({ ...entryData, content: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Harvest, Culinary, Balcony, Milestone"
                    value={entryData.tags}
                    onChange={e => setEntryData({ ...entryData, tags: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Photo URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={entryData.photo_url}
                    onChange={e => setEntryData({ ...entryData, photo_url: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Publish Entry
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
