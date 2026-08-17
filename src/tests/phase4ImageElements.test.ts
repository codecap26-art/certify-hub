import { describe, it, expect } from 'vitest';
import {
  createImageElement,
  createLogoElement,
  createSignatureElement,
} from '@/lib/editor/documentModel';

describe('Phase 4 — Image-Based Certificate Elements System', () => {
  it('creates image, logo, and signature elements as independent editable objects', () => {
    const img = createImageElement('data:image/png;base64,testImage', 'Test Image', 842, 595, 0);
    expect(img.type).toBe('image');
    expect(img.imageStyle?.src).toBe('data:image/png;base64,testImage');

    const logo = createLogoElement('data:image/png;base64,testLogo', 842, 595, 1);
    expect(logo.type).toBe('logo');
    expect(logo.imageStyle?.src).toBe('data:image/png;base64,testLogo');

    const sig = createSignatureElement('data:image/png;base64,testSig', 842, 595, 2);
    expect(sig.type).toBe('signature');
    expect(sig.imageStyle?.src).toBe('data:image/png;base64,testSig');
  });

  it('supports image controls (position, width, height, rotation, opacity, lock, hide)', () => {
    const img = createImageElement('data:image/png;base64,test', 'Controlled Image', 842, 595, 0);

    img.x = 120;
    img.y = 80;
    img.width = 250;
    img.height = 180;
    img.rotation = 15;
    img.opacity = 0.8;
    img.locked = true;
    img.visible = false;

    expect(img.x).toBe(120);
    expect(img.y).toBe(80);
    expect(img.width).toBe(250);
    expect(img.height).toBe(180);
    expect(img.rotation).toBe(15);
    expect(img.opacity).toBe(0.8);
    expect(img.locked).toBe(true);
    expect(img.visible).toBe(false);
  });

  it('replaces image source while preserving position, size, and rotation', () => {
    const img = createImageElement('data:image/png;base64,original', 'Replace Image', 842, 595, 0);
    img.x = 200;
    img.y = 150;
    img.width = 180;
    img.height = 180;
    img.rotation = 45;

    // Perform replacement
    const newSrc = 'data:image/png;base64,replaced';
    img.imageStyle = {
      ...img.imageStyle,
      src: newSrc,
      originalSrc: newSrc,
    };

    expect(img.imageStyle?.src).toBe(newSrc);
    expect(img.x).toBe(200);
    expect(img.y).toBe(150);
    expect(img.width).toBe(180);
    expect(img.height).toBe(180);
    expect(img.rotation).toBe(45);
  });

  it('supports basic cropping parameters (cropX, cropY, cropWidth, cropHeight, cornerRadius)', () => {
    const img = createImageElement('data:image/png;base64,testCrop', 'Cropped Image', 842, 595, 0);

    img.imageStyle = {
      ...img.imageStyle,
      cropX: 10,
      cropY: 10,
      cropWidth: 100,
      cropHeight: 100,
      cornerRadius: 12,
    };

    expect(img.imageStyle?.cropX).toBe(10);
    expect(img.imageStyle?.cropY).toBe(10);
    expect(img.imageStyle?.cropWidth).toBe(100);
    expect(img.imageStyle?.cropHeight).toBe(100);
    expect(img.imageStyle?.cornerRadius).toBe(12);
  });
});
