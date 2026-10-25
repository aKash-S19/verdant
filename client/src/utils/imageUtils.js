/**
 * Utilities for client-side image processing & compression.
 * Allows customers to upload photos from smartphones or computers
 * without exceeding storage quotas or slowing down page loading.
 */

export async function compressProfileImage(file, maxSize = 400, quality = 0.88) {
  if (!file) throw new Error('No file provided');
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPEG, PNG, WEBP, or GIF).');
  }

  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          
          // Square center crop for pristine avatar proportions
          const minDim = Math.min(img.width, img.height);
          const targetDim = Math.min(minDim, maxSize);

          canvas.width = targetDim;
          canvas.height = targetDim;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw data URL
            return resolve({
              dataUrl: e.target.result,
              originalSizeKb,
              compressedSizeKb: originalSizeKb,
              width: img.width,
              height: img.height
            });
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Crop from center
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetDim, targetDim);

          // Output as JPEG data URL for compact storage & broad compatibility
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const compressedSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

          resolve({
            dataUrl,
            originalSizeKb,
            compressedSizeKb,
            width: targetDim,
            height: targetDim
          });
        } catch (err) {
          console.warn('Canvas compression error, falling back to original:', err);
          resolve({
            dataUrl: e.target.result,
            originalSizeKb,
            compressedSizeKb: originalSizeKb,
            width: img.width,
            height: img.height
          });
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
