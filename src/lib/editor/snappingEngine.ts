// ============================================================================
// Snapping Engine — alignment guides, centre snap, equal spacing
// ============================================================================

import { DocumentElement } from './documentModel';

export interface SnapGuide {
  orientation: 'horizontal' | 'vertical';
  position: number; // in document coordinates
  type: 'center' | 'edge' | 'element' | 'spacing';
}

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

const SNAP_THRESHOLD = 5; // pixels in document space
const SAFE_MARGIN = 15;

// ---------------------------------------------------------------------------
// Compute snap guides and adjust position
// ---------------------------------------------------------------------------
export function computeSnap(
  movingId: string,
  movingX: number,
  movingY: number,
  movingW: number,
  movingH: number,
  allElements: DocumentElement[],
  docWidth: number,
  docHeight: number,
  snappingEnabled: boolean,
): SnapResult {
  if (!snappingEnabled) {
    return { x: movingX, y: movingY, guides: [] };
  }

  const guides: SnapGuide[] = [];
  let snapX = movingX;
  let snapY = movingY;

  // Moving element edges and centers
  const mCX = movingX + movingW / 2;
  const mCY = movingY + movingH / 2;
  const mRight = movingX + movingW;
  const mBottom = movingY + movingH;

  // Page reference points
  const pageCX = docWidth / 2;
  const pageCY = docHeight / 2;

  // Horizontal snaps (adjust X)
  const hCandidates: { target: number; source: number; type: SnapGuide['type'] }[] = [
    // Page center
    { target: pageCX, source: mCX, type: 'center' },
    // Page edges
    { target: 0, source: movingX, type: 'edge' },
    { target: docWidth, source: mRight, type: 'edge' },
    // Safe margins
    { target: SAFE_MARGIN, source: movingX, type: 'edge' },
    { target: docWidth - SAFE_MARGIN, source: mRight, type: 'edge' },
  ];

  // Vertical snaps (adjust Y)
  const vCandidates: { target: number; source: number; type: SnapGuide['type'] }[] = [
    { target: pageCY, source: mCY, type: 'center' },
    { target: 0, source: movingY, type: 'edge' },
    { target: docHeight, source: mBottom, type: 'edge' },
    { target: SAFE_MARGIN, source: movingY, type: 'edge' },
    { target: docHeight - SAFE_MARGIN, source: mBottom, type: 'edge' },
  ];

  // Snap to other elements
  const others = allElements.filter((e) => e.id !== movingId && e.visible);
  for (const el of others) {
    const eCX = el.x + el.width / 2;
    const eCY = el.y + el.height / 2;
    const eRight = el.x + el.width;
    const eBottom = el.y + el.height;

    // Horizontal: left-to-left, right-to-right, center-to-center, left-to-right, right-to-left
    hCandidates.push(
      { target: el.x, source: movingX, type: 'element' },
      { target: eRight, source: mRight, type: 'element' },
      { target: eCX, source: mCX, type: 'element' },
      { target: eRight, source: movingX, type: 'element' },
      { target: el.x, source: mRight, type: 'element' },
    );

    // Vertical: top-to-top, bottom-to-bottom, center-to-center, top-to-bottom, bottom-to-top
    vCandidates.push(
      { target: el.y, source: movingY, type: 'element' },
      { target: eBottom, source: mBottom, type: 'element' },
      { target: eCY, source: mCY, type: 'element' },
      { target: eBottom, source: movingY, type: 'element' },
      { target: el.y, source: mBottom, type: 'element' },
    );
  }

  // Find best horizontal snap
  let bestHDist = SNAP_THRESHOLD + 1;
  let bestHSnap: typeof hCandidates[0] | null = null;
  for (const c of hCandidates) {
    const dist = Math.abs(c.target - c.source);
    if (dist < bestHDist) {
      bestHDist = dist;
      bestHSnap = c;
    }
  }
  if (bestHSnap && bestHDist <= SNAP_THRESHOLD) {
    snapX = movingX + (bestHSnap.target - bestHSnap.source);
    guides.push({ orientation: 'vertical', position: bestHSnap.target, type: bestHSnap.type });
  }

  // Find best vertical snap
  let bestVDist = SNAP_THRESHOLD + 1;
  let bestVSnap: typeof vCandidates[0] | null = null;
  for (const c of vCandidates) {
    const dist = Math.abs(c.target - c.source);
    if (dist < bestVDist) {
      bestVDist = dist;
      bestVSnap = c;
    }
  }
  if (bestVSnap && bestVDist <= SNAP_THRESHOLD) {
    snapY = movingY + (bestVSnap.target - bestVSnap.source);
    guides.push({ orientation: 'horizontal', position: bestVSnap.target, type: bestVSnap.type });
  }

  return { x: snapX, y: snapY, guides };
}
