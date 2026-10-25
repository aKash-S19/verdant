import React from 'react';
import { Sprout, Heart, Shield, Sparkles } from 'lucide-react';

export function Footer({ onNavigate }) {
  return (
    <footer style={{
      backgroundColor: 'var(--color-forest-dark)',
      color: '#e2ebe0',
      paddingTop: '4rem',
      paddingBottom: '3rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '10px',
                backgroundColor: 'var(--color-forest-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sprout size={20} />
              </div>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '1.25rem', 
                color: '#ffffff' 
              }}>
                Verdant AI
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#a7bda9', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Intelligent personal gardening companion designed to empower every grower with botanical science, smart care routines, and Gemini AI guidance.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(82, 183, 136, 0.15)',
              border: '1px solid rgba(82, 183, 136, 0.3)',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              color: 'var(--color-mint)'
            }}>
              <Sparkles size={13} />
              Powered by Google Gemini & Supabase
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.02em' }}>
              Gardening Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <li>
                <button onClick={() => onNavigate('discover')} style={{ color: '#a7bda9', transition: 'color 0.15s' }}>
                  Discover Plants & Recommendations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('garden')} style={{ color: '#a7bda9', transition: 'color 0.15s' }}>
                  My Personal Garden
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('scheduler')} style={{ color: '#a7bda9', transition: 'color 0.15s' }}>
                  Smart Care Scheduler & Calendar
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('growth')} style={{ color: '#a7bda9', transition: 'color 0.15s' }}>
                  Plant Growth Tracker
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('journal')} style={{ color: '#a7bda9', transition: 'color 0.15s' }}>
                  Garden Journal & Milestones
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence & Ethics */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.02em' }}>
              Botanical Intelligence
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#a7bda9', lineHeight: 1.6, marginBottom: '1rem' }}>
              Verdant AI focuses on positive growth, proactive care regimens, light alignment, companion planting, and organic nutrition.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c2d4c4', fontSize: '0.8125rem' }}>
              <Shield size={16} color="var(--color-sage-light)" />
              Row Level Security & Private Vault
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: '#899f8c'
        }}>
          <div>
            © {new Date().getFullYear()} Verdant AI. <strong>Grow Smarter. Garden Better.</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Nurtured with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for gardeners everywhere
          </div>
        </div>
      </div>
    </footer>
  );
}
