/**
 * Image Resizer & Compressor Utility for LocalStorage optimization.
 * Resizes large user-uploaded logo and signature images to max 300x300px
 * and compresses quality so Base64 strings remain under 20-30KB.
 */

export function compressImageDataUrl(
  dataUrl: string,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof window === 'undefined') {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP or JPEG
      const compressed = canvas.toDataURL('image/webp', quality);

      // If WebP export is smaller, use it; otherwise fallback to input
      if (compressed && compressed.length < dataUrl.length) {
        resolve(compressed);
      } else {
        const jpegCompressed = canvas.toDataURL('image/jpeg', quality);
        if (jpegCompressed && jpegCompressed.length < dataUrl.length) {
          resolve(jpegCompressed);
        } else {
          resolve(dataUrl);
        }
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
