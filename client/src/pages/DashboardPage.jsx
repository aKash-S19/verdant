import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Droplets, 
  Sparkles, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Flame, 
  ArrowRight, 
  Compass, 
  TrendingUp,
  Clock,
  Check,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  AlertTriangle,
  BookOpen,
  HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useGarden } from '../context/GardenContext';
import { getGeminiInsights, fetchWeatherData } from '../lib/api';

export function DashboardPage({ onNavigate, onOpenPlantDetail, onOpenDoctor }) {
  const { profile } = useAuth();
  const { plants, tasks, growthRecords, journalEntries, streakDays, toggleTaskCompletion } = useGarden();

  // Gemini Insights state
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Live Weather state
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Dynamic calculated tasks metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => !t.is_skipped && (t.due_date <= todayStr || !t.is_completed));
  const completedTodayCount = tasks.filter(t => t.is_completed && t.due_date <= todayStr).length;
  const healthyPlantsCount = plants.filter(p => ['Thriving', 'Growing', 'Flowering', 'Harvest Ready'].includes(p.status)).length;
  const attentionPlantsCount = plants.filter(p => ['Needs Care', 'Sick', 'Seedling'].includes(p.status)).length;

  // Fetch real-time weather for user profile location
  useEffect(() => {
    async function loadLiveWeather() {
      setLoadingWeather(true);
      const userLoc = profile?.location || 'Chennai, India';
      const res = await fetchWeatherData(userLoc);
      if (res?.success && res.weather) {
        setWeatherData(res.weather);
      }
      setLoadingWeather(false);
    }
    loadLiveWeather();
  }, [profile?.location]);

  // Fetch Gemini Garden Insights tailored to actual user garden & weather
  useEffect(() => {
    async function loadInsights() {
      setLoadingInsights(true);
      try {
        const res = await getGeminiInsights(plants, profile);
        if (res?.insights) {
          setInsights(res.insights);
        }
      } catch (e) {
        console.error('Failed to load Gemini insights:', e);
      } finally {
        setLoadingInsights(false);
      }
    }
    loadInsights();
  }, [plants.length, profile?.garden_space]);

  function handleTaskCheck(task) {
    toggleTaskCompletion(task.id);
    if (!task.is_completed) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2d6a4f', '#52b788', '#95d5b2', '#d8f3dc']
      });
    }
  }

  return (
    <div className="section-padding" style={{ paddingTop: '2rem' }}>
      <div className="container">
        
        {/* WELCOME BANNER & STREAK COUNTER */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          padding: '1.75rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div 
              onClick={() => onNavigate && onNavigate('settings')}
              title="Click to view/edit profile & avatar"
              style={{
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={profile?.full_name || 'Gardener'}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(45, 106, 79, 0.15)',
                  outline: '2px solid var(--color-mint)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-emerald)',
                border: '2px solid #ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>

            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-sage)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Personal Garden Dashboard
              </span>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-forest-dark)', marginTop: '0.2rem' }}>
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Gardener'} 🌿
              </h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {profile?.garden_space || 'Balcony'} garden • {profile?.location || 'Location set'} • {profile?.sunlight_availability || 'Partial sun'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Streak Counter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: 'var(--color-clay-wash)',
              padding: '0.65rem 1.1rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid #fed7aa'
            }}>
              <Flame size={22} color="var(--color-earth-dark)" fill="#f97316" />
              <div>
                <span style={{ display: 'block', fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-earth-dark)', lineHeight: 1 }}>
                  {streakDays} Days
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-earth)', fontWeight: 600 }}>
                  Active Streak
                </span>
              </div>
            </div>

            {/* Quick Add Plant Action */}
            <button
              onClick={() => onNavigate('discover')}
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
            >
              <Plus size={18} />
              Add Plant
            </button>
          </div>
        </div>

        {/* LIVE OPEN-METEO WEATHER & ENVIRONMENT WIDGET */}
        <div className="card" style={{
          padding: '1.5rem 1.75rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #eef9f1 0%, #ffffff 100%)',
          border: '1.5px solid var(--color-mint-light)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-forest)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(45, 106, 79, 0.25)'
              }}>
                <Sun size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                    {weatherData?.location || profile?.location || 'Live Local Microclimate'}
                  </h3>
                  <span className="badge badge-forest" style={{ fontSize: '0.6875rem' }}>Open-Meteo Live</span>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  Real-time weather & atmospheric context for your plants
                </span>
              </div>
            </div>

            {loadingWeather ? (
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Fetching live weather...</span>
            ) : weatherData ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-forest-dark)', lineHeight: 1, display: 'block' }}>
                    {weatherData.current.temperature}°C
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    High: {weatherData.forecast.maxTemp}°C • Low: {weatherData.forecast.minTemp}°C
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Droplets size={16} color="#0284c7" />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {weatherData.current.humidity}%
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Humidity</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CloudRain size={16} color="#2563eb" />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {weatherData.forecast.rainProbability}%
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Rain Chance</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Wind size={16} color="#64748b" />
                    <div>
                      <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {weatherData.current.windSpeed} km/h
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Wind</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Weather data temporarily unavailable.</span>
            )}
          </div>

          {/* WEATHER WARNING ALERTS (IF ANY) */}
          {weatherData?.alerts && weatherData.alerts.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {weatherData.alerts.map((alert, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: alert.severity === 'warning' ? '#fff7ed' : '#eff6ff',
                  border: `1px solid ${alert.severity === 'warning' ? '#ffedd5' : '#dbeafe'}`
                }}>
                  <AlertTriangle size={18} color={alert.severity === 'warning' ? '#ea580c' : '#2563eb'} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: alert.severity === 'warning' ? '#9a3412' : '#1e40af' }}>
                      {alert.title}:
                    </span>{' '}
                    <span style={{ fontSize: '0.8125rem', color: alert.severity === 'warning' ? '#c2410c' : '#1d4ed8' }}>
                      {alert.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI PLANT DOCTOR & DISEASE DETECTION BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(45, 106, 79, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', maxWidth: '640px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <HeartPulse size={28} color="#95d5b2" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  AI Plant Doctor & Disease Detection
                </h3>
                <span style={{
                  backgroundColor: '#52b788',
                  color: '#081c15',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase'
                }}>
                  Gemini Vision
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#d8f3dc', margin: 0, lineHeight: 1.5 }}>
                Spot yellowing, brown spots, or curled foliage? Snap or upload a leaf photo to diagnose pathogens, get treatment plans, and schedule recovery tasks directly to your calendar.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onOpenDoctor ? onOpenDoctor() : onNavigate('disease-doctor')}
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                color: '#1b4332',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <HeartPulse size={18} color="#2d6a4f" />
              Diagnose Plant Leaves
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY ROW — DYNAMICALLY CALCULATED */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {/* 1. Total Plants */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-mint-subtle)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sprout size={24} />
            </div>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-forest-dark)', lineHeight: 1, display: 'block' }}>
                {plants.length}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Total Plants
              </span>
            </div>
          </div>

          {/* 2. Healthy / Thriving */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46', lineHeight: 1, display: 'block' }}>
                {healthyPlantsCount}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Thriving Plants
              </span>
            </div>
          </div>

          {/* 3. Tasks Due Today */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-mint-subtle)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-forest-dark)', lineHeight: 1, display: 'block' }}>
                {todayTasks.filter(t => !t.is_completed).length}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Tasks Due Today
              </span>
            </div>
          </div>

          {/* 4. Completed Today */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-clay-wash)',
              color: 'var(--color-earth-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-earth-dark)', lineHeight: 1, display: 'block' }}>
                {completedTodayCount}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Tasks Completed
              </span>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT GRID */}
        {plants.length === 0 ? (
          /* EMPTY GARDEN STATE REQUIRED BY SPECIFICATION */
          <div className="card" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-mint-subtle)',
              color: 'var(--color-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Sprout size={36} />
            </div>

            <h2 style={{ fontSize: '1.75rem', color: 'var(--color-forest-dark)', marginBottom: '0.75rem' }}>
              Your garden is empty.
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              You haven't added any plants to your personal sanctuary yet. Discover suitable cultivars from our real plant database or ask Gemini to recommend plants tailored to your environment!
            </p>

            <button
              onClick={() => onNavigate('discover')}
              className="btn btn-primary btn-lg"
              style={{ gap: '0.65rem' }}
            >
              <Compass size={18} />
              Discover Plants
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {/* LEFT COLUMN: TODAY'S TASKS & MY PLANTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* TODAY'S TASKS SECTION */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-mint-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-forest)'
                    }}>
                      <Clock size={16} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)' }}>
                      Today's Garden Tasks
                    </h3>
                  </div>

                  <button
                    onClick={() => onNavigate('scheduler')}
                    style={{ fontSize: '0.8125rem', color: 'var(--color-forest)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    View Calendar
                    <ArrowRight size={14} />
                  </button>
                </div>

                {todayTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'var(--color-bg-app)', borderRadius: 'var(--radius-md)' }}>
                    <CheckCircle2 size={28} color="var(--color-sage)" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-forest-dark)' }}>
                      All daily tasks completed!
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Your plants are content. Check back tomorrow or log a growth entry.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {todayTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskCheck(task)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          padding: '0.9rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: task.is_completed ? 'var(--color-bg-subtle)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <button
                          style={{
                            marginTop: '2px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: `2px solid ${task.is_completed ? 'var(--color-forest)' : '#cbd5e1'}`,
                            backgroundColor: task.is_completed ? 'var(--color-forest)' : 'transparent',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {task.is_completed && <Check size={14} />}
                        </button>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              color: task.is_completed ? 'var(--color-text-muted)' : 'var(--color-forest-dark)',
                              textDecoration: task.is_completed ? 'line-through' : 'none'
                            }}>
                              {task.title}
                            </span>
                            <span className="badge badge-outline" style={{ fontSize: '0.6875rem' }}>
                              {task.task_type}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                            {task.description}
                          </p>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-forest)', fontWeight: 600, marginTop: '0.25rem', display: 'inline-block' }}>
                            {task.plant_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MY PLANTS PREVIEW */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)' }}>
                    My Garden ({plants.length})
                  </h3>
                  <button
                    onClick={() => onNavigate('garden')}
                    style={{ fontSize: '0.8125rem', color: 'var(--color-forest)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    Manage Plants
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {plants.slice(0, 4).map(plant => (
                    <div
                      key={plant.id}
                      onClick={() => onOpenPlantDetail(plant)}
                      className="card-interactive"
                      style={{
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <img
                        src={plant.photo_url}
                        alt={plant.custom_name}
                        style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '0.65rem' }}>
                        <span style={{ display: 'block', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-forest-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {plant.custom_name}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                          {plant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI GARDEN INSIGHTS & RECENT LOGS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* GEMINI AI GARDEN INSIGHT WIDGET */}
              <div className="card" style={{
                padding: '1.75rem',
                background: 'linear-gradient(135deg, #f7fcf8 0%, #ffffff 100%)',
                border: '1.5px solid var(--color-mint-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-mint-subtle)',
                    color: 'var(--color-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={18} color="var(--color-sage)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)' }}>
                      Gemini Garden Insights
                    </h3>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                      Tailored specifically to your garden inventory
                    </span>
                  </div>
                </div>

                {loadingInsights ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Analyzing garden condition...
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {insights.map((insight, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-forest-dark)', display: 'block', marginBottom: '0.35rem' }}>
                          {insight.title}
                        </span>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.65rem' }}>
                          {insight.message}
                        </p>
                        {insight.actionText && (
                          <button
                            onClick={() => onNavigate(insight.actionLink?.replace('/', '') || 'assistant')}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--color-forest)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {insight.actionText}
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <button
                    onClick={() => onNavigate('assistant')}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Ask Gemini Assistant a Gardening Question
                  </button>
                </div>
              </div>

              {/* RECENT GROWTH TIMELINE PREVIEW */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--color-forest-dark)' }}>
                    Recent Growth Logs ({growthRecords.length})
                  </h3>
                  <button
                    onClick={() => onNavigate('growth')}
                    style={{ fontSize: '0.8125rem', color: 'var(--color-forest)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    View Tracker
                    <ArrowRight size={14} />
                  </button>
                </div>

                {growthRecords.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                    No growth entries recorded yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {growthRecords.slice(0, 3).map(rec => (
                      <div key={rec.id} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        <img
                          src={rec.photo_url}
                          alt={rec.milestone || 'Growth'}
                          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-forest-dark)', display: 'block' }}>
                            {rec.milestone || rec.plant_name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            Height: {rec.height_cm} cm • {rec.leaf_count} leaves
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                            {rec.recorded_at}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
