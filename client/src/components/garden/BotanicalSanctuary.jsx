import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Droplets, 
  Sun, 
  HeartPulse, 
  Calendar, 
  ArrowRight, 
  X, 
  Check, 
  MapPin, 
  Maximize2,
  RefreshCw,
  Plus,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useGarden } from '../../context/GardenContext';
import { useNotifications } from '../../context/NotificationContext';
import { BOTANICAL_ICONS, getPlantIcon } from '../../data/botanicalIcons';

// Preset isometric coordinate anchors for 3D Cube Balcony and Lawn plots
const BALCONY_ANCHORS = [
  { top: '48%', left: '50%' }, // Center of wooden deck
  { top: '56%', left: '42%' }, // Front-left deck
  { top: '56%', left: '58%' }, // Front-right deck
  { top: '44%', left: '38%' }, // Mid-left deck
  { top: '44%', left: '62%' }, // Mid-right deck
  { top: '38%', left: '50%' }, // Back near railing
  { top: '40%', left: '32%' }, // Near back-left pot
  { top: '40%', left: '68%' }, // Near wooden bench
  { top: '64%', left: '50%' }, // Front-center deck edge
  { top: '52%', left: '32%' }, // Left railing edge
  { top: '52%', left: '68%' }, // Right railing edge
  { top: '50%', left: '44%' }  // Near watering can
];

const LAWN_ANCHORS = [
  { top: '32%', left: '50%' },
  { top: '42%', left: '38%' },
  { top: '42%', left: '62%' },
  { top: '52%', left: '26%' },
  { top: '52%', left: '50%' },
  { top: '52%', left: '74%' },
  { top: '62%', left: '38%' },
  { top: '62%', left: '62%' },
  { top: '72%', left: '50%' },
  { top: '36%', left: '32%' },
  { top: '36%', left: '68%' },
  { top: '68%', left: '28%' }
];

export function BotanicalSanctuary({ 
  onSelectPlant, 
  onOpenDoctor, 
  onAddNewPlant 
}) {
  const { profile } = useAuth();
  const { plants, tasks, toggleTaskCompletion, updatePlant } = useGarden();
  const { addToast } = useNotifications();

  // Determine starting environment based on user's profile
  const userEnv = (profile?.garden_space || 'Balcony').toLowerCase();
  const initialEnv = userEnv.includes('balcony') ? 'balcony' : 'lawn';

  const [activeEnvironment, setActiveEnvironment] = useState(initialEnv);
  const [inspectedPlant, setInspectedPlant] = useState(null);
  const [wateringPlantId, setWateringPlantId] = useState(null);
  const [processedBalconyImg, setProcessedBalconyImg] = useState(null);

  // Client-side canvas chroma-keying to remove background and produce pristine 3D cube
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/balcony_forest_tile.jpg';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample background color from top-left corner
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        // Key out background pixels with smooth anti-aliased edge
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

          if (dist < 40) {
            data[i + 3] = 0; // Pure Transparent
          } else if (dist < 55) {
            data[i + 3] = Math.round(((dist - 40) / 15) * 255); // Smooth feathered edge
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedBalconyImg(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas image processing fallback:', err);
      }
    };
  }, []);

  // Quick watering action directly from isometric plot
  function handleWaterPlant(plant, e) {
    if (e) e.stopPropagation();
    setWateringPlantId(plant.id);

    // Celebratory Water Droplets & Forest Confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0284c7', '#38bdf8', '#52b788', '#2d6a4f', '#d8f3dc']
    });

    // Mark any pending watering tasks for this plant as completed
    const plantWaterTasks = tasks.filter(t => t.garden_plant_id === plant.id && t.task_type === 'Watering' && !t.is_completed);
    plantWaterTasks.forEach(t => toggleTaskCompletion(t.id));

    // Update status to Thriving
    updatePlant(plant.id, {
      status: 'Thriving',
      last_watered_at: new Date().toISOString()
    });

    addToast(`Hydrated ${plant.custom_name}! Balcony vitality updated.`, 'success');

    setTimeout(() => {
      setWateringPlantId(null);
    }, 1200);
  }

  const isBalcony = activeEnvironment === 'balcony';
  const anchors = isBalcony ? BALCONY_ANCHORS : LAWN_ANCHORS;
  const habitatBgImage = isBalcony ? (processedBalconyImg || '/balcony_forest_tile.jpg') : '/backyard_lawn_tile.png';

  return (
    <div className="card" style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-2xl)',
      border: '1.5px solid var(--color-mint-light)',
      boxShadow: '0 12px 36px rgba(27, 67, 50, 0.08)',
      overflow: 'hidden',
      marginBottom: '2rem'
    }}>
      {/* SANCTUARY HEADER & ENVIRONMENT SWITCHER */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.25rem 1.75rem',
        backgroundColor: '#fbfdfc',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(27, 67, 50, 0.25)',
            fontSize: '1.25rem'
          }}>
            {isBalcony ? '🏙️' : '🌿'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-forest-dark)', margin: 0 }}>
                {isBalcony ? 'Balcony Botanical Sanctuary' : 'Isometric Garden Plot'}
              </h2>
              <span className="badge badge-forest" style={{ fontSize: '0.625rem', padding: '0.1rem 0.5rem' }}>
                Forest App Mode
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              Interactive 3D living habitat • {plants.length} plant{plants.length === 1 ? '' : 's'} thriving on your {isBalcony ? 'balcony' : 'lawn'}
            </span>
          </div>
        </div>

        {/* Environment Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--color-bg-app)', padding: '0.25rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setActiveEnvironment('balcony')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: isBalcony ? 700 : 500,
              backgroundColor: isBalcony ? 'var(--color-forest)' : 'transparent',
              color: isBalcony ? '#ffffff' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🏙️</span>
            <span>Balcony Deck</span>
          </button>

          <button
            onClick={() => setActiveEnvironment('lawn')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: !isBalcony ? 700 : 500,
              backgroundColor: !isBalcony ? 'var(--color-forest)' : 'transparent',
              color: !isBalcony ? '#ffffff' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🌿</span>
            <span>Flower Lawn Plot</span>
          </button>
        </div>
      </div>

      {/* 3D ISOMETRIC HABITAT CANVAS */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '480px',
        maxHeight: '620px',
        height: 'clamp(460px, 50vw, 560px)',
        background: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #edf7f0 55%, #ddf0e3 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}>
        {/* Ambient Sunlight Flare Effect */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '8%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(254, 240, 138, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(20px)'
        }} />

        {/* Soft 3D Ground Shadow beneath floating cube */}
        <div style={{
          position: 'absolute',
          bottom: '12%',
          width: 'min(68%, 420px)',
          height: '42px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(27, 67, 50, 0.25) 0%, rgba(27, 67, 50, 0.06) 55%, transparent 75%)',
          filter: 'blur(8px)',
          pointerEvents: 'none'
        }} />

        {/* Floating Isometric Island Habitat Tile */}
        <div className="sanctuary-island-card" style={{
          position: 'relative',
          width: 'min(92%, 580px)',
          aspectRatio: '4 / 3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Base 3D Tile Artwork */}
          <img
            src={habitatBgImage}
            alt={isBalcony ? 'Isometric Balcony Garden' : 'Isometric Flower Lawn'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 28px rgba(27, 67, 50, 0.22))',
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease'
            }}
          />

          {/* Interactive Plant Nodes Mapped Across Isometric Plot */}
          {plants.map((plant, idx) => {
            const anchor = anchors[idx % anchors.length];
            const icon = getPlantIcon(plant);
            const isThriving = plant.status === 'Thriving' || plant.status === 'Growing';
            const isWateringThis = wateringPlantId === plant.id;

            return (
              <div
                key={plant.id}
                className="sanctuary-plant-node"
                onClick={() => setInspectedPlant(plant)}
                style={{
                  position: 'absolute',
                  top: anchor.top,
                  left: anchor.left,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 20 + idx,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
                title={`Click to inspect ${plant.custom_name}`}
              >
                {/* Status Halo Ring */}
                <div style={{
                  position: 'relative',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: isThriving 
                    ? '0 0 0 3px rgba(16, 185, 129, 0.35), 0 8px 16px rgba(0,0,0,0.18)' 
                    : '0 0 0 3px rgba(245, 158, 11, 0.4), 0 8px 16px rgba(0,0,0,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  border: '2px solid #ffffff'
                }}>
                  {icon}

                  {/* Pulsing Status Dot */}
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: isThriving ? '#10b981' : '#f59e0b',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 6px rgba(0,0,0,0.2)'
                  }} />

                  {/* Water Droplet Action Overlay when Watering */}
                  {isWateringThis && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(2, 132, 199, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      animation: 'statusPulse 0.4s ease infinite'
                    }}>
                      <Droplets size={20} />
                    </div>
                  )}
                </div>

                {/* Floating Plant Name Label */}
                <span style={{
                  marginTop: '0.35rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(4px)',
                  color: 'var(--color-forest-dark)',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
                  border: '1px solid rgba(82, 183, 136, 0.25)',
                  letterSpacing: '-0.01em'
                }}>
                  {plant.custom_name}
                </span>
              </div>
            );
          })}

          {/* Empty Habitat Placeholder Prompt if No Plants */}
          {plants.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '1.5rem 2rem',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
              boxShadow: '0 12px 32px rgba(27, 67, 50, 0.2)',
              border: '1.5px solid var(--color-mint-light)',
              maxWidth: '320px'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-forest-dark)', margin: '0 0 0.35rem 0' }}>
                Your {isBalcony ? 'Balcony' : 'Garden'} is Ready!
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0' }}>
                Plant your first botanical specimen to watch your Forest-style sanctuary come to life.
              </p>
              <button
                onClick={onAddNewPlant}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Plant First Seed</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Ambient HUD Controls */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1.25rem',
          right: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.75rem',
            color: 'var(--color-forest-dark)',
            fontWeight: 650,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid var(--color-border)',
            pointerEvents: 'auto'
          }}>
            <Sun size={14} color="#f59e0b" />
            <span>{isBalcony ? 'Balcony Microclimate' : 'Open Lawn Plot'} • Tap any plant to care</span>
          </div>

          <button
            onClick={onAddNewPlant}
            className="btn btn-primary btn-sm"
            style={{
              boxShadow: '0 4px 14px rgba(27, 67, 50, 0.35)',
              gap: '0.35rem',
              pointerEvents: 'auto'
            }}
          >
            <Plus size={15} />
            <span>Add to {isBalcony ? 'Balcony' : 'Plot'}</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE PLANT INSPECT & CARE MODAL */}
      {inspectedPlant && (
        <div 
          className="modal-backdrop" 
          onClick={() => setInspectedPlant(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-2xl)',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)',
              animation: 'scaleUp 0.18s ease'
            }}
          >
            {/* Header Photo & Icon */}
            <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
              <img
                src={inspectedPlant.photo_url}
                alt={inspectedPlant.custom_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(27,67,50,0.85) 0%, transparent 60%)'
              }} />

              {/* Close Button */}
              <button
                onClick={() => setInspectedPlant(null)}
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>

              {/* Custom Botanical Icon Emblem */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '1.5rem',
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.9rem',
                border: '3px solid #ffffff'
              }}>
                {getPlantIcon(inspectedPlant)}
              </div>

              {/* Status Badge */}
              <span className="badge" style={{
                position: 'absolute',
                bottom: '0.75rem',
                right: '1rem',
                backgroundColor: 'rgba(255,255,255,0.92)',
                color: 'var(--color-forest-dark)',
                fontWeight: 700
              }}>
                {inspectedPlant.status || 'Thriving'}
              </span>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem 1.5rem 1.25rem 1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-forest-dark)', margin: '0 0 0.15rem 0' }}>
                  {inspectedPlant.custom_name}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  {inspectedPlant.species}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.65rem',
                padding: '0.85rem',
                backgroundColor: 'var(--color-bg-app)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem'
              }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>Habitat Spot</span>
                  <strong style={{ color: 'var(--color-forest-dark)' }}>{inspectedPlant.location || 'Balcony Deck'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>Category</span>
                  <strong style={{ color: 'var(--color-forest-dark)' }}>{inspectedPlant.category || 'Herbs'}</strong>
                </div>
              </div>

              {/* Quick Interactive Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {/* 1. Quick Water Action Button */}
                <button
                  onClick={() => handleWaterPlant(inspectedPlant)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem',
                    fontSize: '0.92rem'
                  }}
                >
                  <Droplets size={18} />
                  <span>Hydrate & Water Plant 💧</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {/* 2. Doctor Diagnosis */}
                  <button
                    onClick={() => {
                      setInspectedPlant(null);
                      if (onOpenDoctor) onOpenDoctor(inspectedPlant);
                    }}
                    className="btn btn-outline"
                    style={{
                      justifyContent: 'center',
                      gap: '0.35rem',
                      borderColor: '#a7f3d0',
                      color: '#065f46',
                      backgroundColor: '#ecfdf5',
                      fontSize: '0.8125rem',
                      padding: '0.65rem'
                    }}
                  >
                    <HeartPulse size={15} color="#059669" />
                    <span>AI Doctor</span>
                  </button>

                  {/* 3. Open Details */}
                  <button
                    onClick={() => {
                      setInspectedPlant(null);
                      if (onSelectPlant) onSelectPlant(inspectedPlant);
                    }}
                    className="btn btn-outline"
                    style={{
                      justifyContent: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8125rem',
                      padding: '0.65rem'
                    }}
                  >
                    <span>View Diary</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
