// AI Plant Doctor & Disease Detection Clinic
// Multimodal Computer Vision powered by Google Gemini AI
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Leaf, 
  Bug, 
  Droplets, 
  Plus, 
  BookOpen, 
  MessageSquare, 
  RefreshCw,
  X,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import { diagnosePlantDisease } from '../lib/api';
import { useGarden } from '../context/GardenContext';
import { useNotifications } from '../context/NotificationContext';

const SAMPLE_DISEASE_CASES = [
  {
    id: 'sample-early-blight',
    title: 'Tomato Early Blight',
    plantName: 'Cherry Tomato',
    category: 'Fungal',
    image_url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    notes: 'Brown concentric spots on lower leaves with yellow halo margins.'
  },
  {
    id: 'sample-powdery-mildew',
    title: 'Powdery Mildew',
    plantName: 'Damask Rose',
    category: 'Fungal',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    notes: 'White talcum-powder like dusting spreading across upper leaf surfaces.'
  },
  {
    id: 'sample-chlorosis',
    title: 'Nitrogen Chlorosis',
    plantName: 'Monstera Deliciosa',
    category: 'Nutrient Deficiency',
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
    notes: 'Pale uniform yellowing starting on oldest lower foliage while veins remain pale.'
  },
  {
    id: 'sample-spider-mites',
    title: 'Spider Mite Damage',
    plantName: 'Golden Pothos',
    category: 'Pest Infestation',
    image_url: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?auto=format&fit=crop&w=600&q=80',
    notes: 'Tiny yellow speckles and fine silky webbing near leaf axils.'
  }
];

export function DiseaseDetectionPage({ onNavigate, initialPlant = null }) {
  const { plants, addCustomTask, addJournalEntry } = useGarden();
  const { addToast } = useNotifications();

  const [selectedImage, setSelectedImage] = useState(null); // base64 or preview URL
  const [imageBase64, setImageBase64] = useState('');
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [plantName, setPlantName] = useState(initialPlant?.custom_name || initialPlant?.species || '');
  const [selectedGardenPlantId, setSelectedGardenPlantId] = useState(initialPlant?.id || '');
  const [userNotes, setUserNotes] = useState('');

  React.useEffect(() => {
    if (initialPlant) {
      if (initialPlant.id) setSelectedGardenPlantId(initialPlant.id);
      if (initialPlant.custom_name || initialPlant.species) {
        setPlantName(initialPlant.custom_name || initialPlant.species);
      }
    }
  }, [initialPlant]);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // File Upload Handlers
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function processFile(file) {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setErrorMsg('');
    setImageMime(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result;
      setSelectedImage(base64String);
      setImageBase64(base64String);
      setDiagnosis(null);
    };
    reader.readAsDataURL(file);
  }

  // Handle Drag & Drop
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  // Handle Sample Selection
  async function handleSelectSample(sample) {
    setErrorMsg('');
    setPlantName(sample.plantName);
    setUserNotes(sample.notes);
    setSelectedImage(sample.image_url);
    setDiagnosis(null);

    // Convert sample URL to base64 via temporary canvas/fetch
    try {
      const res = await fetch(sample.image_url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImageMime(blob.type || 'image/jpeg');
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.warn('Could not load sample image to base64:', e);
    }
  }

  // Run Diagnosis
  async function handleDiagnose() {
    if (!imageBase64 && !selectedImage) {
      setErrorMsg('Please upload a leaf photograph or pick a sample plant case first.');
      return;
    }

    setIsScanning(true);
    setErrorMsg('');
    setDiagnosis(null);

    // Dynamic scanning animation messages
    const scanSteps = [
      'Scanning leaf venation & structural tissue...',
      'Detecting chlorosis, necrosis & pathogen signatures...',
      'Cross-referencing botanical pathology neural models...',
      'Formulating organic treatment & recovery protocol...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < scanSteps.length) {
        setScanStep(stepIdx);
      }
    }, 900);

    try {
      const finalPlantName = selectedGardenPlantId 
        ? plants.find(p => p.id === selectedGardenPlantId)?.custom_name || plantName 
        : plantName;

      const res = await diagnosePlantDisease({
        imageBase64: imageBase64 || selectedImage,
        mimeType: imageMime,
        plantName: finalPlantName,
        userNotes
      });

      clearInterval(interval);

      if (res.success && res.diagnosis) {
        setDiagnosis(res.diagnosis);
        addToast('Plant diagnosis completed successfully!', 'success');
      } else {
        throw new Error(res.error || 'Failed to analyze plant symptoms.');
      }
    } catch (err) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Diagnosis service encountered an issue. Please try again.');
    } finally {
      setIsScanning(false);
      setScanStep(0);
    }
  }

  // Add Treatment Task to Garden
  async function handleAddTreatmentTask(task) {
    try {
      await addCustomTask({
        garden_plant_id: selectedGardenPlantId || null,
        task_type: task.taskType || 'Custom',
        title: task.title,
        description: `${task.description} (Diagnosis: ${diagnosis.conditionName})`,
        due_date: new Date(Date.now() + 86400000 * (task.intervalDays || 1)).toISOString().split('T')[0],
        recurrence_interval_days: task.intervalDays || 7
      });
      addToast(`Prescription task "${task.title}" added to Care Calendar!`, 'success');
    } catch (err) {
      addToast('Could not save task.', 'error');
    }
  }

  // Save to Journal
  async function handleSaveToJournal() {
    if (!diagnosis) return;
    try {
      await addJournalEntry({
        garden_plant_id: selectedGardenPlantId || null,
        title: `AI Health Diagnosis: ${diagnosis.conditionName}`,
        content: `**Diagnosis Summary:**\n${diagnosis.summary}\n\n**Severity:** ${diagnosis.severity} (${diagnosis.confidenceScore}% Confidence)\n\n**Organic Remedy:**\n${diagnosis.treatmentOrganic.join('\n')}\n\n**Chemical Alternative:**\n${diagnosis.treatmentChemical.join('\n')}`,
        photo_url: selectedImage.startsWith('data:') ? 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80' : selectedImage,
        tags: ['Disease Diagnosis', diagnosis.category, diagnosis.severity]
      });
      addToast('Saved diagnosis report to Garden Journal!', 'success');
    } catch (err) {
      addToast('Could not save to journal.', 'error');
    }
  }

  function getSeverityColor(sev) {
    switch (sev?.toLowerCase()) {
      case 'none': return '#10b981';
      case 'mild': return '#f59e0b';
      case 'moderate': return '#f97316';
      case 'severe': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem 1.5rem' }}>
      {/* Header Banner with high contrast and responsive padding */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(1.75rem, 4vw, 3rem) clamp(1.25rem, 3.5vw, 2.25rem)',
        color: '#ffffff',
        marginBottom: '2.5rem',
        boxShadow: '0 20px 25px -5px rgba(27, 67, 50, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.9rem',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
          borderRadius: '999px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <Sparkles size={14} color="#95d5b2" />
          <span style={{ color: '#ffffff', letterSpacing: '0.02em' }}>Multimodal Botanical Pathology Clinic</span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(1.65rem, 4vw, 2.35rem)', 
          fontWeight: 800, 
          margin: '0 0 0.75rem 0', 
          letterSpacing: '-0.02em',
          color: '#ffffff',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          lineHeight: 1.2
        }}>
          AI Plant Doctor & Disease Detection
        </h1>
        <p style={{ fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)', color: '#d8f3dc', maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
          Photograph any discolored leaf, wilting stem, or pest stippling. Gemini AI analyzes cellular symptoms, identifies pathogens, and prescribes precise organic remedies.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          color: '#b91c1c',
          marginBottom: '2rem'
        }}>
          <AlertTriangle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Upload & Inputs on Left, Results on Right - Responsive */}
      <div className={`doctor-layout-grid ${diagnosis ? 'has-diagnosis' : ''}`}>
        {/* Left Column: Diagnostics Input */}
        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={20} color="var(--color-forest)" />
              1. Upload Leaf or Stem Photo
            </h2>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? '2px dashed var(--color-forest)' : '2px dashed var(--color-border)',
                backgroundColor: isDragging ? 'var(--color-mint-subtle)' : '#fafdfb',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {selectedImage ? (
                <div>
                  <div style={{
                    width: '180px',
                    height: '180px',
                    margin: '0 auto 1rem auto',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                    position: 'relative'
                  }}>
                    <img
                      src={selectedImage}
                      alt="Plant inspection"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isScanning && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(180deg, rgba(82, 183, 136, 0.4) 0%, rgba(45, 106, 79, 0.7) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <RefreshCw size={36} color="#ffffff" className="animate-spin" />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-forest)', fontWeight: 600 }}>
                    Click or drop another image to replace
                  </span>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--color-mint-subtle)',
                    color: 'var(--color-forest)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <UploadCloud size={28} />
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
                    Click to browse or drag and drop leaf photo
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Supports high-resolution JPG, PNG, WEBP from your phone camera or computer
                  </p>
                </div>
              )}
            </div>

            {/* Optional Plant Linking Context */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Link to a Plant in Your Garden (Optional)</label>
                <select
                  className="form-input"
                  value={selectedGardenPlantId}
                  onChange={e => {
                    setSelectedGardenPlantId(e.target.value);
                    const found = plants.find(p => p.id === e.target.value);
                    if (found) setPlantName(found.custom_name);
                  }}
                >
                  <option value="">-- Standalone Leaf Inspection --</option>
                  {plants.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.custom_name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedGardenPlantId && (
                <div>
                  <label className="form-label">Plant Species Name (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Tomato, Hibiscus, Monstera, Rose"
                    value={plantName}
                    onChange={e => setPlantName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="form-label">Visual Symptoms or Environmental Notes (Optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Leaf edges curling, spots appeared after heavy rain, yellowing from tips..."
                  value={userNotes}
                  onChange={e => setUserNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="button"
                onClick={handleDiagnose}
                disabled={isScanning || (!selectedImage && !imageBase64)}
                className="btn btn-primary"
                style={{
                  padding: '0.9rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  backgroundColor: isScanning ? 'var(--color-forest)' : undefined
                }}
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Analyzing Botanical Pathogens...
                  </>
                ) : (
                  <>
                    <HeartPulse size={18} />
                    Run AI Plant Diagnosis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Test Samples Library */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} color="var(--color-forest)" />
              Or Test Instant Sample Disease Cases
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {SAMPLE_DISEASE_CASES.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedImage === sample.image_url ? 'var(--color-mint-subtle)' : '#ffffff'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-forest)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <img
                    src={sample.image_url}
                    alt={sample.title}
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, margin: 0, color: 'var(--color-forest-dark)' }}>
                      {sample.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {sample.plantName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scanning Status or Diagnosis Clinical Report */}
        {isScanning && (
          <div className="card" style={{
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-forest)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 0 0 10px rgba(45, 106, 79, 0.15)',
              animation: 'pulse 2s infinite'
            }}>
              <Activity size={36} />
            </div>

            <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-forest-dark)', marginBottom: '0.5rem' }}>
              Multimodal Vision In Progress
            </h3>
            <p style={{ color: 'var(--color-forest)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
              {scanStep === 0 && 'Scanning leaf venation & structural tissue...'}
              {scanStep === 1 && 'Detecting chlorosis, necrosis & pathogen signatures...'}
              {scanStep === 2 && 'Cross-referencing botanical pathology neural models...'}
              {scanStep === 3 && 'Formulating organic treatment & recovery protocol...'}
            </p>

            <div style={{ width: '80%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                backgroundColor: 'var(--color-forest)',
                width: `${((scanStep + 1) / 4) * 100}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {diagnosis && !isScanning && (
          <div>
            <div className="card" style={{
              padding: '2.25rem',
              borderTop: `6px solid ${getSeverityColor(diagnosis.severity)}`,
              boxShadow: 'var(--shadow-lg)'
            }}>
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: `${getSeverityColor(diagnosis.severity)}20`,
                        color: getSeverityColor(diagnosis.severity)
                      }}
                    >
                      {diagnosis.severity} Severity
                    </span>
                    <span className="badge badge-forest" style={{ fontSize: '0.75rem' }}>
                      {diagnosis.category}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-forest-dark)', margin: '0 0 0.25rem 0' }}>
                    {diagnosis.conditionName}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    AI Confidence Score: <strong>{diagnosis.confidenceScore}%</strong>
                  </p>
                </div>

                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: `${getSeverityColor(diagnosis.severity)}15`,
                  color: getSeverityColor(diagnosis.severity),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {diagnosis.healthy ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                </div>
              </div>

              {/* Clinical Summary */}
              <div style={{
                padding: '1.125rem',
                backgroundColor: 'var(--color-bg-app)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                color: 'var(--color-text-primary)',
                marginBottom: '1.75rem',
                borderLeft: '4px solid var(--color-forest)'
              }}>
                {diagnosis.summary}
              </div>

              {/* Symptoms & Root Causes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--color-forest)" />
                    Identified Visual Symptoms
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {diagnosis.symptomsIdentified?.map((sym, idx) => (
                      <li key={idx}>{sym}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bug size={16} color="var(--color-status-warning)" />
                    Primary Root Causes
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {diagnosis.rootCauses?.map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Treatment Protocols */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-forest-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplets size={18} color="var(--color-forest)" />
                  Target Treatment Protocols
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {/* Organic Remedy */}
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🌿 Organic Natural Remedy
                    </span>
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#14532d' }}>
                      {diagnosis.treatmentOrganic?.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                          <span>•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chemical / Specialized Alternative */}
                  <div style={{
                    padding: '1.25rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🧪 Specialized Alternative
                    </span>
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                      {diagnosis.treatmentChemical?.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                          <span>•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Care Schedule Reminders */}
              {diagnosis.suggestedTasks && diagnosis.suggestedTasks.length > 0 && (
                <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--color-mint-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-forest-dark)', margin: '0 0 0.75rem 0' }}>
                    Prescription Action Items for Your Garden
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {diagnosis.suggestedTasks.map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.625rem 0.875rem',
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0, color: 'var(--color-forest-dark)' }}>
                            {t.title}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            {t.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddTreatmentTask(t)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.35rem', flexShrink: 0 }}
                        >
                          <Plus size={14} />
                          Add to Calendar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={handleSaveToJournal}
                  className="btn btn-secondary"
                  style={{ gap: '0.5rem' }}
                >
                  <BookOpen size={16} />
                  Save Report to Journal
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('assistant')}
                  className="btn btn-primary"
                  style={{ gap: '0.5rem' }}
                >
                  <MessageSquare size={16} />
                  Ask AI Assistant More Questions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .doctor-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 960px) {
          .doctor-layout-grid.has-diagnosis {
            grid-template-columns: 1fr 1.25fr;
          }
        }
      `}</style>
    </div>
  );
}
