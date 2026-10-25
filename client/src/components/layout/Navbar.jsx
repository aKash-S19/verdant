import React, { useState } from 'react';
import { 
  Sprout, 
  Compass, 
  Flower2, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Bot, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Check, 
  Sparkles,
  Menu,
  X,
  HeartPulse,
  ChevronDown,
  Camera,
  MapPin,
  Sun,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { tamilNaduLocations } from '../../data/tamilNaduLocations';
import { CURATED_AVATARS, DEFAULT_AVATAR_URL } from '../../data/curatedAvatars';
import { ProfilePhotoUploader } from '../profile/ProfilePhotoUploader';

export function Navbar({ activeTab, onNavigate }) {
  const { user, profile, logout, updateProfile } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll, addToast } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile Customization Modal State
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    avatar_url: '',
    location: '',
    garden_space: 'Balcony',
    sunlight_availability: 'Partial Sunlight (3-6 hrs)',
    experience_level: 'Intermediate',
    gardening_goal: 'Growing healthy organic herbs, vegetables, and purifying houseplants.'
  });

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTown, setSelectedTown] = useState('');

  // Synchronize modal form with active profile data when opened
  function handleOpenCustomizeModal() {
    setShowProfileMenu(false);
    const loc = profile?.location || '';
    const parts = loc.split(', ');
    const t = parts.length >= 2 ? parts[0] : '';
    const d = parts.length >= 2 ? parts[1] : '';

    setSelectedDistrict(d);
    setSelectedTown(t);

    setEditFormData({
      full_name: profile?.full_name || user?.email?.split('@')[0] || 'Gardener',
      avatar_url: profile?.avatar_url || CURATED_AVATARS[0].url,
      location: loc,
      garden_space: profile?.garden_space || 'Balcony',
      sunlight_availability: profile?.sunlight_availability || 'Partial Sunlight (3-6 hrs)',
      experience_level: profile?.experience_level || 'Intermediate',
      gardening_goal: profile?.gardening_goal || 'Cultivating healthy aromatic herbs, organic vegetables, and vibrant indoor plants.'
    });
    setShowCustomizeModal(true);
  }

  async function handleSaveCustomizedProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      let finalLocation = editFormData.location;
      if (selectedDistrict && selectedTown) {
        finalLocation = `${selectedTown}, ${selectedDistrict}, Tamil Nadu`;
      } else if (selectedDistrict) {
        finalLocation = `${selectedDistrict}, Tamil Nadu`;
      }

      await updateProfile({
        ...editFormData,
        location: finalLocation
      });

      addToast('Profile and botanical preferences updated successfully!', 'success');
      setShowCustomizeModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast('Could not save profile updates. Please try again.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  // Modern navigation items without green dots and with streamlined labels
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: Sprout },
    { id: 'discover', label: 'Discover Plants', shortLabel: 'Discover', icon: Compass },
    { id: 'garden', label: 'My Garden', shortLabel: 'Garden', icon: Flower2 },
    { id: 'scheduler', label: 'Care Calendar', shortLabel: 'Calendar', icon: Calendar },
    { id: 'growth', label: 'Growth Tracker', shortLabel: 'Tracker', icon: TrendingUp },
    { id: 'journal', label: 'Garden Journal', shortLabel: 'Journal', icon: BookOpen },
    { id: 'disease-doctor', label: 'Plant Doctor', shortLabel: 'Doctor', icon: HeartPulse },
    { id: 'assistant', label: 'AI Assistant', shortLabel: 'Assistant', icon: Bot }
  ];

  const showNavFeatures = activeTab !== 'landing' && activeTab !== 'auth';

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.25rem',
          gap: '0.5rem',
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 clamp(0.75rem, 2vw, 1.5rem)',
          boxSizing: 'border-box'
        }}>
          {/* Brand Logo & Companion Identity */}
          <div 
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          >
            <img 
              src="/favicon.svg" 
              alt="Verdant AI" 
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(27, 67, 50, 0.25)',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '1.2rem', 
                color: 'var(--color-forest-dark)',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                lineHeight: 1.2
              }}>
                Verdant AI
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(45, 106, 79, 0.12)',
                  color: 'var(--color-forest)',
                  padding: '0.12rem 0.5rem',
                  borderRadius: '999px',
                  letterSpacing: '0.04em',
                  border: '1px solid rgba(82, 183, 136, 0.3)'
                }}>
                  COMPANION
                </span>
              </div>
              <span className="brand-subtitle" style={{ 
                display: 'block', 
                fontSize: '0.6875rem', 
                color: 'var(--color-text-muted)', 
                fontWeight: 500,
                marginTop: '1px',
                lineHeight: 1
              }}>
                Grow Smarter. Garden Better.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Bar - Clean, Modern Single-Line Layout */}
          {user ? (
            <nav 
              style={{ 
                display: 'none', 
                gap: '0.2rem', 
                alignItems: 'center',
                flexWrap: 'nowrap',
                margin: '0 auto'
              }} 
              className="desktop-nav"
            >
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="nav-item-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.55rem',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 550,
                      color: isActive ? 'var(--color-forest)' : '#4b5563',
                      backgroundColor: isActive ? 'rgba(45, 106, 79, 0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(82, 183, 136, 0.35)' : '1px solid transparent',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon 
                      size={15} 
                      color={isActive ? 'var(--color-forest)' : '#6b7280'} 
                      strokeWidth={isActive ? 2.3 : 1.8} 
                    />
                    <span style={{ whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                      {item.shortLabel || item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => onNavigate('discover')}
                className="btn btn-ghost btn-sm"
                style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
              >
                <Compass size={16} />
                Discover Plants
              </button>

              <button
                onClick={() => onNavigate('auth')}
                className="btn btn-outline btn-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                Sign In
              </button>

              <button
                onClick={() => onNavigate('auth')}
                className="btn btn-primary btn-sm"
                style={{ whiteSpace: 'nowrap' }}
              >
                Get Started
              </button>
            </div>
          )}

          {/* Right Action Cluster: Notifications & Professional Profile */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', position: 'relative', flexShrink: 0 }}>
              
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  style={{
                    width: '2.4rem',
                    height: '2.4rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: showNotifications ? 'var(--color-mint-subtle)' : 'var(--color-bg-subtle)',
                    color: 'var(--color-forest)',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    border: '1px solid var(--color-border)'
                  }}
                  aria-label="Notifications"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '1px',
                      right: '1px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#e11d48',
                      color: '#fff',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 2px #fff'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Drawer */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '125%',
                    right: 0,
                    width: '320px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
                    border: '1px solid var(--color-border)',
                    padding: '1rem',
                    zIndex: 600,
                    animation: 'scaleUp 0.15s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-forest-dark)' }}>
                        Garden Notifications
                      </span>
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearAll} 
                          style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>
                        All caught up! No active alerts.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            style={{
                              padding: '0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: n.isRead ? 'var(--color-bg-app)' : 'var(--color-mint-subtle)',
                              cursor: 'pointer',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-forest-dark)' }}>
                                {n.title}
                              </span>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{n.time}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                              {n.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Professional User Profile Pill with Status & Full Name */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.3rem 0.75rem 0.3rem 0.35rem',
                    borderRadius: '999px',
                    border: showProfileMenu ? '1.5px solid var(--color-forest)' : '1px solid var(--color-border)',
                    backgroundColor: showProfileMenu ? 'rgba(45, 106, 79, 0.06)' : '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Avatar with Live Gardener Status Badge */}
                  <div style={{ position: 'relative', width: '2.1rem', height: '2.1rem' }}>
                    <img
                      src={profile?.avatar_url || CURATED_AVATARS[0].url}
                      alt={profile?.full_name || 'Gardener'}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '1.5px solid var(--color-forest)'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '1.5px solid #ffffff'
                    }} />
                  </div>

                  {/* Clean Formatted Display Name (Single-line, responsive) */}
                  <span className="nav-profile-name" style={{ 
                    fontSize: '0.8125rem', 
                    fontWeight: 700, 
                    color: 'var(--color-forest-dark)',
                    whiteSpace: 'nowrap',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Gardener'}
                  </span>

                  <ChevronDown 
                    size={14} 
                    color="var(--color-text-muted)" 
                    style={{ 
                      marginLeft: '0.15rem', 
                      transition: 'transform 0.15s ease', 
                      transform: showProfileMenu ? 'rotate(180deg)' : 'none',
                      flexShrink: 0
                    }} 
                  />
                </button>

                {/* Professional Profile Dropdown Menu - Screen Edge Constrained */}
                {showProfileMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '125%',
                    right: 0,
                    width: 'min(280px, calc(100vw - 2rem))',
                    maxWidth: 'calc(100vw - 2rem)',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.16)',
                    border: '1px solid var(--color-border)',
                    padding: '0.85rem',
                    zIndex: 600,
                    animation: 'scaleUp 0.15s ease'
                  }}>
                    {/* User Identity Header */}
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: 'var(--color-bg-app)', 
                      borderRadius: '12px',
                      marginBottom: '0.75rem' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                        <img
                          src={profile?.avatar_url || CURATED_AVATARS[0].url}
                          alt="User"
                          style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-forest)' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-forest-dark)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {profile?.full_name || 'Gardener'}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        <span className="badge badge-forest" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem' }}>
                          {profile?.garden_space || 'Balcony'}
                        </span>
                        <span className="badge badge-outline" style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem' }}>
                          {profile?.experience_level || 'Intermediate'}
                        </span>
                        {profile?.location && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                            <MapPin size={11} color="var(--color-forest)" />
                            {profile.location.split(',')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Primary Action: Customize Profile & Avatar */}
                    <button
                      onClick={handleOpenCustomizeModal}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        fontSize: '0.84rem',
                        fontWeight: 650,
                        color: '#ffffff',
                        backgroundColor: 'var(--color-forest)',
                        borderRadius: '10px',
                        textAlign: 'left',
                        marginBottom: '0.5rem',
                        boxShadow: '0 2px 8px rgba(27,67,50,0.2)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <Sparkles size={16} color="#ffffff" />
                      Customize Profile & Avatar
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('settings');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        borderRadius: '8px',
                        textAlign: 'left',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Settings size={15} color="var(--color-text-muted)" />
                      Full Account Settings
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onNavigate('garden');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        borderRadius: '8px',
                        textAlign: 'left',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Flower2 size={15} color="var(--color-text-muted)" />
                      My Garden Dashboard
                    </button>

                    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          onNavigate('landing');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#dc2626',
                          borderRadius: '8px',
                          textAlign: 'left',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LogOut size={15} color="#dc2626" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.4rem',
                  height: '2.4rem',
                  color: 'var(--color-forest)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
                className="mobile-menu-btn"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Slide-out Drawer */}
        {showNavFeatures && mobileMenuOpen && (
          <div style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--color-border)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-forest)' : 'var(--color-text-primary)',
                    backgroundColor: isActive ? 'var(--color-mint-subtle)' : 'transparent',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={19} color={isActive ? 'var(--color-forest)' : 'var(--color-text-muted)'} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        <style>{`
          .nav-item-btn:hover {
            background-color: rgba(45, 106, 79, 0.08) !important;
            color: var(--color-forest-dark) !important;
          }
          @media (max-width: 1320px) {
            .brand-subtitle {
              display: none !important;
            }
          }
          @media (max-width: 1160px) {
            .nav-profile-name {
              display: none !important;
            }
          }
          @media (max-width: 1240px) and (min-width: 961px) {
            .desktop-nav {
              gap: 0.15rem !important;
            }
            .nav-item-btn {
              padding: 0.35rem 0.42rem !important;
              font-size: 0.76rem !important;
              gap: 0.2rem !important;
            }
          }
          @media (max-width: 960px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
          }
          @media (min-width: 961px) {
            .desktop-nav { display: flex !important; }
            .mobile-menu-btn { display: none !important; }
          }
        `}</style>
      </header>

      {/* Interactive Profile & Botanical Customization Modal */}
      {showCustomizeModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => setShowCustomizeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            zIndex: 999
          }}
        >
          <div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2rem'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-forest" style={{ marginBottom: '0.35rem' }}>
                  Gardener Identity & Microclimate
                </span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-forest-dark)', margin: '0 0 0.25rem 0' }}>
                  Customize Your Profile
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Tailor your avatar, display name, and local growing conditions for personalized Gemini recommendations.
                </p>
              </div>

              <button
                onClick={() => setShowCustomizeModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomizedProfile}>
              {/* 1. Profile Photo Picker / Uploader */}
              <div style={{ marginBottom: '1.5rem' }}>
                <ProfilePhotoUploader
                  compact
                  value={editFormData.avatar_url}
                  onChange={(url) => setEditFormData(prev => ({ ...prev, avatar_url: url }))}
                />
              </div>

              {/* 2. Full Name & Experience Level */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Vijayakanth"
                    value={editFormData.full_name}
                    onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Gardener Experience Level
                  </label>
                  <select
                    className="form-select"
                    value={editFormData.experience_level}
                    onChange={e => setEditFormData({ ...editFormData, experience_level: e.target.value })}
                  >
                    <option value="Beginner">Beginner (Starting Fresh)</option>
                    <option value="Intermediate">Intermediate (Home Gardener)</option>
                    <option value="Experienced">Experienced Green Thumb</option>
                    <option value="Master Gardener">Master Gardener</option>
                  </select>
                </div>
              </div>

              {/* 3. Location (District & Town in Tamil Nadu) */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Location & Microclimate (Tamil Nadu)
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <select
                    className="form-select"
                    value={selectedDistrict}
                    onChange={e => {
                      setSelectedDistrict(e.target.value);
                      setSelectedTown('');
                    }}
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    <option value="">Select District</option>
                    {Object.keys(tamilNaduLocations).sort().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    value={selectedTown}
                    onChange={e => setSelectedTown(e.target.value)}
                    disabled={!selectedDistrict}
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    <option value="">Select Town / Area</option>
                    {selectedDistrict && tamilNaduLocations[selectedDistrict]?.sort().map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Garden Space & Sunlight Availability */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Primary Garden Space
                  </label>
                  <select
                    className="form-select"
                    value={editFormData.garden_space}
                    onChange={e => setEditFormData({ ...editFormData, garden_space: e.target.value })}
                  >
                    <option value="Balcony">Apartment Balcony</option>
                    <option value="Sunny Terrace">Sunny Terrace / Rooftop</option>
                    <option value="Indoor Living Room">Indoor Living Room</option>
                    <option value="Windowsill">Kitchen Windowsill</option>
                    <option value="Courtyard">Open Courtyard</option>
                    <option value="Backyard Garden">Backyard Garden Plot</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Sunlight Availability
                  </label>
                  <select
                    className="form-select"
                    value={editFormData.sunlight_availability}
                    onChange={e => setEditFormData({ ...editFormData, sunlight_availability: e.target.value })}
                  >
                    <option value="Full Sunlight (6+ hrs)">Full Sunlight (6+ hrs direct)</option>
                    <option value="Partial Sunlight (3-6 hrs)">Partial Sunlight (3-6 hrs)</option>
                    <option value="Indirect / Shaded Light">Bright Indirect / Shaded Light</option>
                    <option value="Low Light">Low Light (Indoor Office)</option>
                  </select>
                </div>
              </div>

              {/* 5. Gardening Goal & Bio */}
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Personal Gardening Goal / Bio
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Growing aromatic Italian sweet basil, sacred tulsi, and fresh balcony cherry tomatoes."
                  value={editFormData.gardening_goal}
                  onChange={e => setEditFormData({ ...editFormData, gardening_goal: e.target.value })}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomizeModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ gap: '0.4rem', minWidth: '140px' }}
                >
                  {savingProfile ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
