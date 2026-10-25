import React from 'react';
import { 
  Sprout, 
  ArrowRight, 
  Compass, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Bot, 
  ShieldCheck, 
  Sun, 
  Droplets, 
  Sparkles,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';

export function LandingPage({ onGetStarted, onExplorePlants }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        paddingTop: '4rem',
        paddingBottom: '5rem',
        background: 'linear-gradient(180deg, #edf7ee 0%, var(--color-bg-app) 100%)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-forest)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem'
              }}>
                <Sparkles size={15} color="var(--color-sage)" />
                Intelligent Personal Gardening Companion
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--color-forest-dark)',
                marginBottom: '1.25rem'
              }}>
                Grow Smarter.<br />
                <span style={{ color: 'var(--color-forest-medium)' }}>Garden Better.</span>
              </h1>

              <p style={{
                fontSize: '1.125rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                marginBottom: '2rem',
                maxWidth: '520px'
              }}>
                Verdant AI combines botanical science with Gemini intelligence to help you discover ideal plants, follow effortless care routines, track vibrant growth, and cultivate thriving gardens.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={onGetStarted} 
                  className="btn btn-primary btn-lg"
                  style={{ gap: '0.65rem' }}
                >
                  Start Your Garden Free
                  <ArrowRight size={18} />
                </button>

                <button 
                  onClick={onExplorePlants} 
                  className="btn btn-outline btn-lg"
                >
                  <Compass size={18} />
                  Explore Plants
                </button>
              </div>

              {/* Trust Indicators */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--color-forest-medium)" />
                  Zero Guesswork
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--color-forest-medium)" />
                  Tailored to Your Balcony & Light
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  <CheckCircle2 size={16} color="var(--color-forest-medium)" />
                  Powered by Gemini AI
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80" 
                  alt="Lush botanical garden with potted herbs" 
                  style={{ width: '100%', height: '320px', objectFit: 'cover' }}
                />

                {/* Floating Micro-Card 1: Task Checklist */}
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-mint-subtle)',
                    color: 'var(--color-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Droplets size={18} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                      Today's Care Task
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      Sweet Basil • Morning Hydration
                    </span>
                  </div>
                </div>

                {/* Floating Micro-Card 2: AI Garden Advice */}
                <div style={{
                  position: 'absolute',
                  bottom: '1.25rem',
                  right: '1.25rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--color-border)',
                  maxWidth: '260px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <Bot size={15} color="var(--color-sage)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                      Gemini Garden Insight
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    "Rotate your balcony pots by 90° this morning for balanced sunlight exposure."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: 5 STAGES */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span className="badge badge-forest" style={{ marginBottom: '0.75rem' }}>
              Simple Botanical Methodology
            </span>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem', color: 'var(--color-forest-dark)' }}>
              How Verdant AI Nurtures Your Garden
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              From discovering your first seedling to celebrating abundant harvests, follow an intelligent journey tailored to your space.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                step: '01',
                title: 'Discover Plants',
                desc: 'Browse rich botanical profiles and receive Gemini recommendations tailored to your balcony, sunlight, and time.',
                icon: Compass
              },
              {
                step: '02',
                title: 'Build Your Garden',
                desc: 'Add custom plants with locations, nicknames, photos, and growth stages to your private Supabase garden vault.',
                icon: Sprout
              },
              {
                step: '03',
                title: 'Follow Care Routines',
                desc: 'Personalized schedules for watering, feeding, and pruning so you always know what your plants need today.',
                icon: Calendar
              },
              {
                step: '04',
                title: 'Track Growth & Journal',
                desc: 'Record stem heights, leaf counts, photo milestones, and journal culinary achievements in an elegant timeline.',
                icon: TrendingUp
              },
              {
                step: '05',
                title: 'Ask Gemini AI',
                desc: 'Get immediate answers to any gardening question with checklists and step-by-step guidance from our botanical companion.',
                icon: Bot
              }
            ].map(stage => {
              const Icon = stage.icon;
              return (
                <div key={stage.step} className="card" style={{ padding: '1.75rem 1.25rem', position: 'relative' }}>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-mint-light)',
                    lineHeight: 1,
                    display: 'block',
                    marginBottom: '0.75rem'
                  }}>
                    {stage.step}
                  </span>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-mint-subtle)',
                    color: 'var(--color-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--color-forest-dark)' }}>
                    {stage.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY FOR BEGINNERS & EXPERTS */}
      <section className="section-padding" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
            <span className="badge badge-sage" style={{ marginBottom: '0.75rem' }}>
              Designed For Every Grower
            </span>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
              Built for Beginners & Master Gardeners Alike
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Whether you are tending your first potted succulent on a windowsill or managing a full patio harvest.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* Beginner Column */}
            <div className="card" style={{ padding: '2.25rem', borderLeft: '4px solid var(--color-forest-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-mint-subtle)',
                  color: 'var(--color-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sprout size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>For Beginners</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Confidence from day one</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  "No more overwatering confusion with clear finger-test hydration alerts.",
                  "Personalized plant recommendations suited specifically to your low light or small balcony.",
                  "Beginner-friendly step-by-step instructions for repotting and gentle pruning.",
                  "Instant Gemini gardening assistant to answer common questions in plain language."
                ].map((text, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.65rem', fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={18} color="var(--color-sage)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Experienced Column */}
            <div className="card" style={{ padding: '2.25rem', borderLeft: '4px solid var(--color-terracotta)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-clay-wash)',
                  color: 'var(--color-earth-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sun size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)' }}>For Experienced Gardeners</h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Precision tracking & records</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  "Complete multi-plant care calendar synchronizing watering, fertilizing, and pruning.",
                  "Quantitative growth tracking: chart plant height and leaf development over weeks.",
                  "Dedicated garden journal with photos, custom tags, and harvest documentation.",
                  "Customized care intervals and soil specifications tailored to microclimates."
                ].map((text, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.65rem', fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                    <CheckCircle2 size={18} color="var(--color-terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="section-padding" style={{
        background: 'linear-gradient(135deg, var(--color-forest-dark) 0%, var(--color-forest) 100%)',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <div className="container-narrow">
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Sprout size={32} color="var(--color-mint-light)" />
          </div>

          <h2 style={{ color: '#ffffff', fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to Cultivate Your Personal Garden?
          </h2>

          <p style={{ color: '#c2d9c5', fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 2.25rem auto' }}>
            Join Verdant AI today. Personalize your care routines, track growth milestones, and let Gemini guide your green thumb.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={onGetStarted} 
              className="btn btn-lg"
              style={{ backgroundColor: 'var(--color-mint-light)', color: 'var(--color-forest-dark)', fontWeight: 700 }}
            >
              Create My Garden Now
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={onExplorePlants} 
              className="btn btn-lg"
              style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1.5px solid rgba(255, 255, 255, 0.3)' }}
            >
              Browse Plant Catalog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
