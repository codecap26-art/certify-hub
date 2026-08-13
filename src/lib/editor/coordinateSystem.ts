// ============================================================================
// Coordinate & Zoom System
// Maintains logical document coordinates independently from screen size.
// Zooming does not change stored element positions.
// ============================================================================

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export const INITIAL_VIEWPORT: ViewportState = {
  zoom: 0.85,
  panX: 0,
  panY: 0,
};

export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 3.0;
export const ZOOM_STEP = 0.1;

// ---------------------------------------------------------------------------
// Coordinate transforms
// ---------------------------------------------------------------------------

/** Convert screen (pixel) coordinates to logical document coordinates. */
export function screenToDocument(
  screenX: number,
  screenY: number,
  viewport: ViewportState,
): { x: number; y: number } {
  return {
    x: (screenX - viewport.panX) / viewport.zoom,
    y: (screenY - viewport.panY) / viewport.zoom,
  };
}

/** Convert document coordinates to screen (pixel) coordinates. */
export function documentToScreen(
  docX: number,
  docY: number,
  viewport: ViewportState,
): { x: number; y: number } {
  return {
    x: docX * viewport.zoom + viewport.panX,
    y: docY * viewport.zoom + viewport.panY,
  };
}

// ---------------------------------------------------------------------------
// Zoom operations
// ---------------------------------------------------------------------------

export function zoomIn(viewport: ViewportState): ViewportState {
  return { ...viewport, zoom: Math.min(MAX_ZOOM, viewport.zoom + ZOOM_STEP) };
}

export function zoomOut(viewport: ViewportState): ViewportState {
  return { ...viewport, zoom: Math.max(MIN_ZOOM, viewport.zoom - ZOOM_STEP) };
}

export function zoomTo100(viewport: ViewportState): ViewportState {
  return { ...viewport, zoom: 1.0 };
}

/** Fit the document into the given container dimensions. */
export function zoomToFit(
  docWidth: number,
  docHeight: number,
  containerWidth: number,
  containerHeight: number,
): ViewportState {
  const padding = 60;
  const scaleX = (containerWidth - padding * 2) / docWidth;
  const scaleY = (containerHeight - padding * 2) / docHeight;
  const zoom = Math.min(scaleX, scaleY, MAX_ZOOM);

  const panX = (containerWidth - docWidth * zoom) / 2;
  const panY = (containerHeight - docHeight * zoom) / 2;

  return { zoom, panX, panY };
}

/** Mouse-wheel zoom centered at the pointer position. */
export function wheelZoom(
  viewport: ViewportState,
  delta: number,
  pointerScreenX: number,
  pointerScreenY: number,
): ViewportState {
  const direction = delta > 0 ? -1 : 1;
  const factor = 1 + ZOOM_STEP * direction;
  const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.zoom * factor));

  // Keep the point under the pointer stationary
  const scale = newZoom / viewport.zoom;
  const newPanX = pointerScreenX - (pointerScreenX - viewport.panX) * scale;
  const newPanY = pointerScreenY - (pointerScreenY - viewport.panY) * scale;

  return { zoom: newZoom, panX: newPanX, panY: newPanY };
}

/** Pan by a screen-space delta. */
export function pan(viewport: ViewportState, dx: number, dy: number): ViewportState {
  return { ...viewport, panX: viewport.panX + dx, panY: viewport.panY + dy };
}

/** Reset viewport to initial state. */
export function resetView(): ViewportState {
  return { ...INITIAL_VIEWPORT };
}
