import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Sun, 
  Sliders, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { tamilNaduLocations } from '../data/tamilNaduLocations';
import { CURATED_AVATARS, DEFAULT_AVATAR_URL } from '../data/curatedAvatars';
import { ProfilePhotoUploader } from '../components/profile/ProfilePhotoUploader';

export function ProfileSettingsPage() {
  const { profile, user, updateProfile, isDemoMode } = useAuth();
  const { addToast } = useNotifications();

  const defaultLocation = profile?.location || '';
  const locationParts = defaultLocation.split(', ');
  const initialTown = locationParts.length === 3 ? locationParts[0] : '';
  const initialDistrict = locationParts.length === 3 ? locationParts[1] : '';

  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedTown, setSelectedTown] = useState(initialTown);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || 'Vijayakanth',
    avatar_url: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    location: defaultLocation,
    experience_level: profile?.experience_level || 'Intermediate',
    garden_space: profile?.garden_space || 'Balcony',
    sunlight_availability: profile?.sunlight_availability || 'Partial Sunlight (3-6 hrs)',
    indoor_outdoor_pref: profile?.indoor_outdoor_pref || 'Both',
    maintenance_pref: profile?.maintenance_pref || 'Low to Medium',
    preferred_categories: profile?.preferred_categories || ['Herbs', 'Indoor Plants', 'Vegetables']
  });

  const [notifications, setNotifications] = useState(
    profile?.notification_preferences || {
      watering: true,
      fertilizing: true,
      pruning: true,
      tips: true
    }
  );

  const [saving, setSaving] = useState(false);

  function toggleCategory(cat) {
    setFormData(prev => {
      const exists = prev.preferred_categories.includes(cat);
      return {
        ...prev,
        preferred_categories: exists 
          ? prev.preferred_categories.filter(c => c !== cat) 
          : [...prev.preferred_categories, cat]
      };
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        ...formData,
        notification_preferences: notifications
      });
      addToast('Profile and gardening settings saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="section-padding" style={{ paddingTop: '2rem' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        
        {/* HEADER BAR */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-forest" style={{ marginBottom: '0.4rem' }}>
            Account & Calibration
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-forest-dark)' }}>
            Profile & Gardening Settings
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Customize your gardening microclimate and AI preferences for tailored care routines.
          </p>
        </div>

        {/* SYSTEM STATUS CARD */}
        <div className="card" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isSupabaseConfigured() ? 'var(--color-mint-subtle)' : '#fef3c7',
              color: isSupabaseConfigured() ? 'var(--color-forest)' : '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-forest-dark)', display: 'block' }}>
                {isSupabaseConfigured() ? 'Supabase Vault Connected' : 'Hybrid Local Mode Active'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {isSupabaseConfigured() 
                  ? 'All data synchronized to PostgreSQL with Row Level Security.' 
                  : 'Operating seamlessly with local storage engine. Connect SUPABASE_URL in .env anytime.'}
              </span>
            </div>
          </div>

          <span className="badge badge-forest" style={{ fontSize: '0.75rem' }}>
            {user?.email || 'Active User'}
          </span>
        </div>

        {/* FORM SETTINGS */}
        <form onSubmit={handleSave}>
          {/* Section 1: Personal Info */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)', marginBottom: '1.25rem' }}>
              Gardener Profile
            </h3>

            {/* Profile Photo Uploader */}
            <div style={{ marginBottom: '1.75rem' }}>
              <ProfilePhotoUploader
                value={formData.avatar_url}
                onChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Your Location (Tamil Nadu)</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <select
                    className="form-input"
                    value={selectedDistrict}
                    onChange={e => {
                      setSelectedDistrict(e.target.value);
                      setSelectedTown('');
                    }}
                    style={{ flex: 1, minWidth: '200px' }}
                    required
                  >
                    <option value="">Select District</option>
                    {Object.keys(tamilNaduLocations).sort().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    className="form-input"
                    value={selectedTown}
                    onChange={e => {
                      setSelectedTown(e.target.value);
                      if (selectedDistrict && e.target.value) {
                        setFormData({ ...formData, location: `${e.target.value}, ${selectedDistrict}, Tamil Nadu` });
                      }
                    }}
                    disabled={!selectedDistrict}
                    style={{ flex: 1, minWidth: '200px' }}
                    required
                  >
                    <option value="">Select Town</option>
                    {selectedDistrict && tamilNaduLocations[selectedDistrict].sort().map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Gardening Experience</label>
                <select
                  className="form-select"
                  value={formData.experience_level}
                  onChange={e => setFormData({ ...formData, experience_level: e.target.value })}
                >
                  <option value="Beginner">Beginner (Starting fresh)</option>
                  <option value="Intermediate">Intermediate (Some gardening experience)</option>
                  <option value="Experienced">Experienced (Green thumb)</option>
                  <option value="Master">Master Gardener</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Time Commitment</label>
                <select
                  className="form-select"
                  value={formData.maintenance_pref}
                  onChange={e => setFormData({ ...formData, maintenance_pref: e.target.value })}
                >
                  <option value="Low Maintenance">Low Maintenance (10 mins/week)</option>
                  <option value="Low to Medium">Low to Medium</option>
                  <option value="Medium">Medium (Regular attention)</option>
                  <option value="High / Intensive">High (Daily hobbyist)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Garden Environment */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)', marginBottom: '1.25rem' }}>
              Environment Calibration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Primary Growing Space</label>
                <select
                  className="form-select"
                  value={formData.garden_space}
                  onChange={e => setFormData({ ...formData, garden_space: e.target.value })}
                >
                  <option value="Balcony">Balcony Container Garden</option>
                  <option value="Windowsill">Sunny Windowsill</option>
                  <option value="Indoor Container">Indoor Houseplant Corner</option>
                  <option value="Raised Bed">Raised Garden Bed</option>
                  <option value="Backyard / Garden">Backyard / Open Soil</option>
                  <option value="Rooftop">Rooftop Terrace</option>
                  <option value="Greenhouse">Greenhouse</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sunlight Exposure</label>
                <select
                  className="form-select"
                  value={formData.sunlight_availability}
                  onChange={e => setFormData({ ...formData, sunlight_availability: e.target.value })}
                >
                  <option value="Full Sunlight (6+ hrs)">Full Sunlight (6+ hrs direct)</option>
                  <option value="Partial Sunlight (3-6 hrs)">Partial Sunlight (3-6 hrs)</option>
                  <option value="Indirect / Shaded Light">Indirect / Shaded Light</option>
                  <option value="Low Light / Fluorescent">Low Light / Office Fluorescent</option>
                </select>
              </div>
            </div>

            {/* Preferred Categories */}
            <div style={{ marginTop: '1rem' }}>
              <label className="form-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
                Preferred Plant Categories
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Herbs', 'Vegetables', 'Indoor Plants', 'Flowers', 'Decorative Plants', 'Medicinal Plants', 'Succulents'].map(cat => {
                  const active = formData.preferred_categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.8125rem',
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? 'var(--color-forest)' : 'var(--color-bg-app)',
                        color: active ? '#ffffff' : 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {active && <Check size={14} />}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Notification Preferences */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)', marginBottom: '1.25rem' }}>
              Care Reminders & Notifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'watering', label: 'Watering Alerts', desc: 'Notify when plant soil is due for hydration checks' },
                { id: 'fertilizing', label: 'Fertilizing Schedules', desc: 'Reminders for liquid organic feeding intervals' },
                { id: 'pruning', label: 'Pruning & Bushing Tips', desc: 'Prompts to pinch flowers and prune old stems' },
                { id: 'tips', label: 'Gemini AI Garden Insights', desc: 'Daily contextual advice tailored to current season and plants' }
              ].map(item => {
                const checked = notifications[item.id];
                return (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-app)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-forest-dark)', display: 'block' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {item.desc}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-forest)', cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ gap: '0.5rem' }}
            >
              <Save size={18} />
              {saving ? 'Saving Settings...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
