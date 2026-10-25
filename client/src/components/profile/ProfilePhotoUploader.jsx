import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  RotateCcw, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CURATED_AVATARS, DEFAULT_AVATAR_URL } from '../../data/curatedAvatars';
import { compressProfileImage } from '../../utils/imageUtils';

export function ProfilePhotoUploader({ value, onChange, compact = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const fileInputRef = useRef(null);

  const activeUrl = value || DEFAULT_AVATAR_URL;
  const isCurated = CURATED_AVATARS.some(a => a.url === activeUrl);
  const isCustomUploaded = activeUrl.startsWith('data:image/');
  const isCustomUrl = !isCurated && !isCustomUploaded;

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP, or GIF).');
      return;
    }

    setProcessing(true);
    setErrorMessage('');
    try {
      const result = await compressProfileImage(file, 400, 0.88);
      onChange(result.dataUrl);
      setUploadStats({
        orig: result.originalSizeKb,
        comp: result.compressedSizeKb
      });
    } catch (err) {
      console.error('Image compression failed:', err);
      setErrorMessage(err.message || 'Failed to process image. Please try another file.');
    } finally {
      setProcessing(false);
    }
  }

  function handleFileInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset file input so selecting the same file again triggers change
    e.target.value = '';
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleApplyUrl(e) {
    e.preventDefault();
    if (!urlDraft.trim()) return;
    onChange(urlDraft.trim());
    setShowUrlInput(false);
    setUrlDraft('');
    setUploadStats(null);
  }

  function handleResetDefault() {
    onChange(DEFAULT_AVATAR_URL);
    setUploadStats(null);
    setErrorMessage('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        style={{ display: 'none' }}
      />

      {/* TOP: ACTIVE PHOTO PREVIEW & PRIMARY ACTIONS */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1.25rem',
        padding: compact ? '1rem' : '1.25rem',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid var(--color-border)'
      }}>
        {/* Avatar Circular Preview */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          title="Click to choose a new profile photo"
          style={{
            position: 'relative',
            width: compact ? '76px' : '90px',
            height: compact ? '76px' : '90px',
            borderRadius: '50%',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(45, 106, 79, 0.15)',
            border: '3px solid #ffffff',
            outline: '2.5px solid var(--color-forest)',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}
        >
          <img
            src={activeUrl}
            alt="Current profile avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.25s ease'
            }}
          />
          
          {/* Overlay hover cue */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(27, 67, 50, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: processing ? 1 : 0,
            transition: 'opacity 0.2s ease',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => { if (!processing) e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { if (!processing) e.currentTarget.style.opacity = '0'; }}
          >
            <Camera size={20} strokeWidth={2.5} />
            <span style={{ fontSize: '0.625rem', fontWeight: 700, marginTop: '2px' }}>
              {processing ? 'Saving...' : 'Change'}
            </span>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-forest-dark)' }}>
              Profile Photo
            </span>

            {isCustomUploaded ? (
              <span className="badge badge-forest" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                <CheckCircle2 size={11} style={{ marginRight: '4px' }} /> Custom Photo Uploaded
              </span>
            ) : isCustomUrl ? (
              <span className="badge badge-forest" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                <LinkIcon size={11} style={{ marginRight: '4px' }} /> Custom Web Photo
              </span>
            ) : (
              <span className="badge badge-sage" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                <Sparkles size={11} style={{ marginRight: '4px' }} /> Botanical Persona
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
            Upload your personal photo from your computer or phone. High-resolution images are automatically optimized.
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="btn btn-primary"
              style={{
                fontSize: '0.8125rem',
                padding: '0.45rem 0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                borderRadius: '8px'
              }}
            >
              <Upload size={14} />
              {processing ? 'Optimizing...' : 'Upload from Device'}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="btn btn-outline"
              style={{
                fontSize: '0.8125rem',
                padding: '0.45rem 0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '8px',
                borderColor: 'var(--color-border)',
                backgroundColor: '#ffffff'
              }}
            >
              <LinkIcon size={13} />
              {showUrlInput ? 'Hide URL' : 'Link Photo URL'}
            </button>

            {!isCurated && (
              <button
                type="button"
                onClick={handleResetDefault}
                className="btn btn-ghost"
                title="Revert back to default avatar"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.45rem 0.75rem',
                  color: 'var(--color-text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OPTIMIZATION / SUCCESS TOAST */}
      {uploadStats && (
        <div style={{
          padding: '0.5rem 0.85rem',
          backgroundColor: 'var(--color-mint-subtle)',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--color-forest-dark)'
        }}>
          <Check size={14} color="var(--color-forest)" strokeWidth={2.5} />
          <span>
            <strong>Photo successfully optimized!</strong> Reduced {uploadStats.orig} KB → {uploadStats.comp} KB for instant loading.
          </span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div style={{
          padding: '0.5rem 0.85rem',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#991b1b'
        }}>
          <AlertCircle size={14} color="#dc2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OPTIONAL: URL INPUT DRAWER */}
      {showUrlInput && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
          alignItems: 'center'
        }}>
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste public photo URL (e.g. https://...)"
            className="form-input"
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.75rem', flex: 1 }}
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '0.45rem 0.9rem' }}
          >
            Apply URL
          </button>
        </div>
      )}

      {/* DRAG AND DROP ZONE */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: compact ? '0.75rem 1rem' : '1rem 1.25rem',
          border: dragActive 
            ? '2px dashed var(--color-forest)' 
            : '1.5px dashed var(--color-border)',
          borderRadius: '12px',
          backgroundColor: dragActive ? 'var(--color-mint-subtle)' : '#ffffff',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-forest)' }}>
          <ImageIcon size={18} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {dragActive ? 'Drop your image here...' : 'Click or drop photo here to upload'}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
          PNG, JPG, WEBP, or GIF • Max 10MB (automatically cropped & compressed)
        </span>
      </div>

      {/* PRESET BOTANICAL AVATARS */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          color: 'var(--color-text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.04em',
          marginBottom: '0.5rem' 
        }}>
          Or Choose a Curated Botanical Persona
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))',
          gap: '0.5rem',
          padding: '0.65rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          {CURATED_AVATARS.map(avatar => {
            const isSelected = activeUrl === avatar.url;
            return (
              <div
                key={avatar.id}
                onClick={() => {
                  onChange(avatar.url);
                  setUploadStats(null);
                  setErrorMessage('');
                }}
                title={avatar.label}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  padding: '2px',
                  border: isSelected ? '2.5px solid var(--color-forest)' : '2px solid transparent',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              >
                <img
                  src={avatar.url}
                  alt={avatar.label}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-forest)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #ffffff'
                  }}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
