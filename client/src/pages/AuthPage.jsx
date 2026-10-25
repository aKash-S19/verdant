import React, { useState } from 'react';
import { 
  Sprout, 
  ArrowRight, 
  Check, 
  MapPin, 
  Sun, 
  Sparkles, 
  Compass,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { tamilNaduLocations } from '../data/tamilNaduLocations';

export function AuthPage({ initialMode = 'login', onAuthSuccess }) {
  const { login, register, resetPasswordDirect, updateProfile } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'onboarding' | 'forgot'
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Onboarding Form State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [onboardingData, setOnboardingData] = useState({
    location: '',
    garden_space: 'Balcony',
    sunlight_availability: 'Partial Sunlight (3-6 hrs)',
    indoor_outdoor_pref: 'Both',
    experience_level: 'Beginner',
    maintenance_pref: 'Low to Medium',
    preferred_categories: ['Herbs', 'Indoor Plants', 'Vegetables']
  });

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (mode === 'register' || mode === 'forgot') {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onAuthSuccess();
        }
      } else if (mode === 'register') {
        const res = await register(email, password, fullName);
        if (res.success) {
          if (res.session) {
            setMode('onboarding');
          } else {
            setInfoMsg('Account created and verified! Redirecting to garden...');
            setTimeout(() => onAuthSuccess(), 1200);
          }
        }
      } else if (mode === 'forgot') {
        const res = await resetPasswordDirect(email, password);
        if (res.success) {
          setInfoMsg('Password updated successfully! Logging you in...');
          const loginRes = await login(email, password);
          if (loginRes.success) {
            onAuthSuccess();
          } else {
            setTimeout(() => setMode('login'), 2000);
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOnboardingComplete() {
    setLoading(true);
    try {
      await updateProfile(onboardingData);
      onAuthSuccess();
    } catch (err) {
      console.error('Error saving onboarding preferences:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(cat) {
    setOnboardingData(prev => {
      const exists = prev.preferred_categories.includes(cat);
      return {
        ...prev,
        preferred_categories: exists 
          ? prev.preferred_categories.filter(c => c !== cat) 
          : [...prev.preferred_categories, cat]
      };
    });
  }

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      background: 'linear-gradient(180deg, var(--color-mint-subtle) 0%, var(--color-bg-app) 100%)'
    }}>
      <div className="card" style={{
        maxWidth: mode === 'onboarding' ? '680px' : '460px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-forest)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <Sprout size={26} />
          </div>

          <h2 style={{ fontSize: '1.625rem', color: 'var(--color-forest-dark)', marginBottom: '0.35rem' }}>
            {mode === 'login' && 'Welcome Back to Verdant AI'}
            {mode === 'register' && 'Create Your Botanical Account'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'onboarding' && 'Personalize Your Garden'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {mode === 'onboarding' 
              ? `Step ${onboardingStep} of 3: Help Verdant AI calibrate care schedules to your space.`
              : 'Grow Smarter. Garden Better.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-status-alert-bg)',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-status-alert)',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #6ee7b7',
            borderRadius: 'var(--radius-md)',
            color: '#065f46',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem'
          }}>
            <Check size={16} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* LOGIN / REGISTER / FORGOT FORM */}
        {mode !== 'onboarding' && (
          <form onSubmit={handleAuthSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Maya Chen"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  {mode === 'forgot' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    style={{ fontSize: '0.75rem', color: 'var(--color-forest)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder={mode === 'forgot' ? 'New password (min 6 characters)' : '•••••••• (min 6 characters)'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {(mode === 'register' || mode === 'forgot') && (
              <div className="form-group">
                <label className="form-label">
                  {mode === 'forgot' ? 'Confirm New Password' : 'Confirm Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    placeholder={mode === 'forgot' ? 'Re-enter your new password' : 'Re-enter your password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    tabIndex={-1}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem' }}
            >
              {loading ? 'Processing...' : (
                mode === 'login' ? 'Sign In to Garden' : 
                mode === 'register' ? 'Create Account & Continue' : 
                'Update Password & Sign In'
              )}
            </button>

            {/* Switch Mode Links */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setMode('register')} style={{ color: 'var(--color-forest)', fontWeight: 700 }}>
                    Register now
                  </button>
                </>
              ) : mode === 'register' ? (
                <>
                  Already registered?{' '}
                  <button type="button" onClick={() => setMode('login')} style={{ color: 'var(--color-forest)', fontWeight: 700 }}>
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Remember your credentials?{' '}
                  <button type="button" onClick={() => setMode('login')} style={{ color: 'var(--color-forest)', fontWeight: 700 }}>
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {/* MULTI-STEP ONBOARDING QUESTIONNAIRE */}
        {mode === 'onboarding' && (
          <div>
            {/* Step 1: Space & Location */}
            {onboardingStep === 1 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Your Location (Tamil Nadu)</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select
                      className="form-input"
                      value={selectedDistrict}
                      onChange={e => {
                        setSelectedDistrict(e.target.value);
                        setSelectedTown('');
                      }}
                      style={{ flex: 1 }}
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
                          setOnboardingData({ ...onboardingData, location: `${e.target.value}, ${selectedDistrict}, Tamil Nadu` });
                        }
                      }}
                      disabled={!selectedDistrict}
                      style={{ flex: 1 }}
                    >
                      <option value="">Select Town</option>
                      {selectedDistrict && tamilNaduLocations[selectedDistrict].sort().map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Available Gardening Space</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {['Balcony', 'Windowsill', 'Indoor Container', 'Raised Bed', 'Backyard / Garden', 'Rooftop'].map(sp => {
                      const selected = onboardingData.garden_space === sp;
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => setOnboardingData({ ...onboardingData, garden_space: sp })}
                          style={{
                            padding: '0.85rem 0.65rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${selected ? 'var(--color-forest)' : 'var(--color-border)'}`,
                            backgroundColor: selected ? 'var(--color-mint-subtle)' : '#ffffff',
                            color: selected ? 'var(--color-forest-dark)' : 'var(--color-text-secondary)',
                            fontWeight: selected ? 700 : 500,
                            fontSize: '0.8125rem',
                            textAlign: 'center'
                          }}
                        >
                          {sp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="btn btn-primary"
                  >
                    Next: Sunlight & Environment
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Sunlight & Maintenance */}
            {onboardingStep === 2 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Daily Sunlight Exposure</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {[
                      { id: 'Full Sunlight (6+ hrs)', desc: 'Direct, unobstructed sunny balcony or south window' },
                      { id: 'Partial Sunlight (3-6 hrs)', desc: 'Morning or afternoon direct sun with filtered light' },
                      { id: 'Indirect / Shaded Light', desc: 'Bright ambient room without direct harsh rays' },
                      { id: 'Low Light / Fluorescent', desc: 'Dim corridors, north windows, or office lighting' }
                    ].map(sun => {
                      const selected = onboardingData.sunlight_availability === sun.id;
                      return (
                        <div
                          key={sun.id}
                          onClick={() => setOnboardingData({ ...onboardingData, sunlight_availability: sun.id })}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${selected ? 'var(--color-forest)' : 'var(--color-border)'}`,
                            backgroundColor: selected ? 'var(--color-mint-subtle)' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <span style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-forest-dark)' }}>
                              {sun.id}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              {sun.desc}
                            </span>
                          </div>
                          {selected && <Check size={18} color="var(--color-forest)" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="form-label">Experience & Maintenance</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Experience</span>
                      <select 
                        className="form-select"
                        value={onboardingData.experience_level}
                        onChange={e => setOnboardingData({ ...onboardingData, experience_level: e.target.value })}
                      >
                        <option value="Beginner">Beginner (New grower)</option>
                        <option value="Intermediate">Intermediate (Some plants)</option>
                        <option value="Experienced">Experienced (Green thumb)</option>
                        <option value="Master">Master Gardener</option>
                      </select>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Time Commitment</span>
                      <select 
                        className="form-select"
                        value={onboardingData.maintenance_pref}
                        onChange={e => setOnboardingData({ ...onboardingData, maintenance_pref: e.target.value })}
                      >
                        <option value="Low Maintenance">Low (10 mins/week)</option>
                        <option value="Low to Medium">Low to Medium</option>
                        <option value="Medium">Medium (Regular care)</option>
                        <option value="High / Intensive">High (Daily hobbyist)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="btn btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="btn btn-primary"
                  >
                    Next: Preferred Plants
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preferred Categories & Finish */}
            {onboardingStep === 3 && (
              <div>
                <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                  Select Plant Categories You Love (Select all that apply)
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                  {[
                    'Herbs', 
                    'Vegetables', 
                    'Indoor Plants', 
                    'Flowers', 
                    'Decorative Plants', 
                    'Medicinal Plants', 
                    'Succulents'
                  ].map(cat => {
                    const active = onboardingData.preferred_categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        style={{
                          padding: '0.85rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${active ? 'var(--color-forest)' : 'var(--color-border)'}`,
                          backgroundColor: active ? 'var(--color-mint-subtle)' : '#ffffff',
                          color: active ? 'var(--color-forest-dark)' : 'var(--color-text-secondary)',
                          fontWeight: active ? 700 : 500,
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        {active && <Check size={14} color="var(--color-forest)" />}
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-mint-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-mint-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Sparkles size={16} color="var(--color-forest)" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                      Ready to Build Your Garden
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Verdant AI will initialize your personal dashboard with tasks, growth tracking, and Gemini recommendations for {onboardingData.garden_space} with {onboardingData.sunlight_availability}.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="btn btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleOnboardingComplete}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Initializing Garden...' : 'Launch My Garden Dashboard'}
                    <Sprout size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
