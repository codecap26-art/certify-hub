// ============================================================================
// CertifyHub Certificate Studio — Text Auto-Fit Engine
// Automatically balances and reduces font sizes for long participant names
// and dynamic fields to fit within configured width boundaries.
// ============================================================================

export interface AutoFitOptions {
  text: string;
  fontFamily: string;
  fontWeight?: string;
  currentFontSize: number;
  minFontSize?: number;
  maxFontSize?: number;
  containerWidth: number;
  padding?: number;
}

/**
 * Calculates optimal font size so that the string fits within containerWidth
 * without overflowing or wrapping awkwardly. Clamped between minFontSize and maxFontSize.
 */
export function calculateAutoFitFontSize({
  text,
  fontFamily,
  fontWeight = 'normal',
  currentFontSize,
  minFontSize = 14,
  maxFontSize = 48,
  containerWidth,
  padding = 10,
}: AutoFitOptions): number {
  if (!text || text.trim().length === 0 || containerWidth <= 0) {
    return Math.min(Math.max(currentFontSize, minFontSize), maxFontSize);
  }

  const availableWidth = Math.max(20, containerWidth - padding * 2);

  // If in browser, measure with Canvas 2D context
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Test at target max/current size
      const targetMax = Math.max(minFontSize, Math.min(currentFontSize, maxFontSize));
      ctx.font = `${fontWeight} ${targetMax}px ${fontFamily}, sans-serif`;
      const measured = ctx.measureText(text).width;

      if (measured <= availableWidth) {
        return targetMax;
      }

      // Linear scale estimation
      const scaleRatio = availableWidth / measured;
      const calculated = Math.floor(targetMax * scaleRatio);
      return Math.max(minFontSize, Math.min(calculated, maxFontSize));
    }
  }

  // Fallback heuristic estimation (average char width ~0.55 of fontSize)
  const isBold = fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800';
  const charWidthFactor = isBold ? 0.62 : 0.54;
  const estimatedChars = text.length;
  const idealFontSize = availableWidth / (estimatedChars * charWidthFactor);

  const clamped = Math.round(Math.max(minFontSize, Math.min(idealFontSize, maxFontSize)));
  return Math.min(clamped, currentFontSize || maxFontSize);
}
