// ============================================================================
// Selection Model — tracks what's selected on the canvas
// ============================================================================

import { DocumentElement } from './documentModel';

export interface SelectionState {
  selectedIds: string[];
  primaryId: string | null;
  hoveredId: string | null;
  editingTextId: string | null;
  lockedSelection: boolean;
}

export const INITIAL_SELECTION: SelectionState = {
  selectedIds: [],
  primaryId: null,
  hoveredId: null,
  editingTextId: null,
  lockedSelection: false,
};

// ---------------------------------------------------------------------------
// Selection Actions
// ---------------------------------------------------------------------------

/** Click-select a single element (replaces current selection). */
export function clickSelect(state: SelectionState, id: string): SelectionState {
  return { ...state, selectedIds: [id], primaryId: id, editingTextId: null };
}

/** Shift-click to toggle an element in/out of multi-selection. */
export function shiftClickSelect(state: SelectionState, id: string): SelectionState {
  const isAlreadySelected = state.selectedIds.includes(id);
  let newIds: string[];
  if (isAlreadySelected) {
    newIds = state.selectedIds.filter((sid) => sid !== id);
  } else {
    newIds = [...state.selectedIds, id];
  }
  return {
    ...state,
    selectedIds: newIds,
    primaryId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
    editingTextId: null,
  };
}

/** Marquee (drag-box) selection: select all elements within a rectangle. */
export function marqueeSelect(
  elements: DocumentElement[],
  rect: { x: number; y: number; width: number; height: number },
  append: boolean,
  currentState: SelectionState,
): SelectionState {
  const rx2 = rect.x + rect.width;
  const ry2 = rect.y + rect.height;
  const minX = Math.min(rect.x, rx2);
  const maxX = Math.max(rect.x, rx2);
  const minY = Math.min(rect.y, ry2);
  const maxY = Math.max(rect.y, ry2);

  const hitIds = elements
    .filter((el) => {
      if (!el.visible || el.locked) return false;
      return el.x < maxX && el.x + el.width > minX && el.y < maxY && el.y + el.height > minY;
    })
    .map((el) => el.id);

  const newIds = append ? [...new Set([...currentState.selectedIds, ...hitIds])] : hitIds;

  return {
    ...currentState,
    selectedIds: newIds,
    primaryId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
    editingTextId: null,
  };
}

/** Select all visible, unlocked elements. */
export function selectAll(elements: DocumentElement[]): SelectionState {
  const ids = elements.filter((e) => e.visible && !e.locked).map((e) => e.id);
  return {
    selectedIds: ids,
    primaryId: ids.length > 0 ? ids[ids.length - 1] : null,
    hoveredId: null,
    editingTextId: null,
    lockedSelection: false,
  };
}

/** Clear all selection. */
export function clearSelection(state: SelectionState): SelectionState {
  return { ...state, selectedIds: [], primaryId: null, editingTextId: null };
}

/** Set hovered element (for hover outlines). */
export function setHovered(state: SelectionState, id: string | null): SelectionState {
  return { ...state, hoveredId: id };
}

/** Enter inline text editing mode. */
export function startTextEditing(state: SelectionState, id: string): SelectionState {
  return { ...state, editingTextId: id, selectedIds: [id], primaryId: id };
}

/** Exit inline text editing. */
export function stopTextEditing(state: SelectionState): SelectionState {
  return { ...state, editingTextId: null };
}

// ---------------------------------------------------------------------------
// Multi-selection bounding box
// ---------------------------------------------------------------------------
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getMultiSelectionBounds(
  elements: DocumentElement[],
  selectedIds: string[],
): BoundingBox | null {
  const selected = elements.filter((e) => selectedIds.includes(e.id));
  if (selected.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of selected) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
