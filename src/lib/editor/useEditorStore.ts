// ============================================================================
// Editor Store — centralized state management for the certificate editor
// Combines document, selection, history, viewport, clipboard, panels, and save
// ============================================================================

'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import {
  CertificateDocument,
  DocumentElement,
  DynamicBindingKey,
  ShapeVariant,
  CornerOrnamentStyle,
  BackgroundGradient,
  BackgroundPattern,
  VersionSnapshot,
  getMaxZ,
  createTextElement,
  createDynamicTextElement,
  createShapeElement,
  createImageElement,
  createLogoElement,
  createSignatureElement,
  createQrElement,
  createBorderElement,
  createCertificateCodeElement,
  createDecorativeShapePreset,
  createCornerOrnamentSet,
  SAMPLE_DATA,
} from './documentModel';
import {
  SelectionState,
  INITIAL_SELECTION,
  clickSelect,
  shiftClickSelect,
  selectAll as selectAllFn,
  clearSelection,
  setHovered,
  startTextEditing,
  stopTextEditing,
  marqueeSelect as marqueeSelectFn,
} from './selectionModel';
import {
  CommandHistoryState,
  createHistory,
  pushCommand,
  coalesceCommand,
  undo as undoHistory,
  redo as redoHistory,
  canUndo as canUndoFn,
  canRedo as canRedoFn,
} from './commandHistory';
import {
  ViewportState,
  INITIAL_VIEWPORT,
  zoomIn as zoomInFn,
  zoomOut as zoomOutFn,
  zoomTo100 as zoomTo100Fn,
  zoomToFit as zoomToFitFn,
  wheelZoom as wheelZoomFn,
  pan as panFn,
} from './coordinateSystem';
import { SnapGuide } from './snappingEngine';

// ---------------------------------------------------------------------------
// Tool Rail Panel IDs
// ---------------------------------------------------------------------------
export type ToolPanelId =
  | 'templates'
  | 'elements'
  | 'text'
  | 'dynamic'
  | 'brand'
  | 'uploads'
  | 'tools'
  | 'projects'
  | 'background'
  | 'layers'
  | null;

export type SaveStatus = 'Saved' | 'Saving...' | 'Unsaved changes' | 'Save failed';

// ---------------------------------------------------------------------------
// Full Editor State
// ---------------------------------------------------------------------------
export interface EditorState {
  document: CertificateDocument;
  selection: SelectionState;
  history: CommandHistoryState;
  viewport: ViewportState;
  clipboard: DocumentElement[];
  activePanel: ToolPanelId;
  isPanelOpen: boolean;
  isPreviewMode: boolean;
  showFieldNames: boolean; // false = show sample data
  saveStatus: SaveStatus;
  snapGuides: SnapGuide[];
  snappingEnabled: boolean;
  showRulers: boolean;
  showGrid: boolean;
  showSafeArea: boolean;
  showBleedArea: boolean;
  safeMarginPx: number;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
export type EditorAction =
  | { type: 'SET_CANVAS_DIMENSIONS'; width: number; height: number; orientation?: 'landscape' | 'portrait' }
  | { type: 'SET_DOCUMENT'; doc: CertificateDocument }
  | { type: 'UPDATE_ELEMENT'; id: string; attrs: Partial<DocumentElement>; coalesce?: boolean; label?: string }
  | { type: 'ADD_ELEMENT'; element: DocumentElement }
  | { type: 'ADD_ELEMENTS'; elements: DocumentElement[] }
  | { type: 'DELETE_ELEMENTS'; ids: string[] }
  | { type: 'REORDER_LAYER'; id: string; direction: 'up' | 'down' | 'top' | 'bottom' }
  | { type: 'REORDER_LAYER_TO_INDEX'; id: string; toIndex: number }
  | { type: 'RENAME_ELEMENT'; id: string; name: string }
  | { type: 'SET_BACKGROUND_COLOR'; color: string }
  | { type: 'SET_BACKGROUND_IMAGE'; dataUrl: string }
  | { type: 'SET_BACKGROUND_OPACITY'; opacity: number }
  | { type: 'SET_BACKGROUND_GRADIENT'; gradient?: BackgroundGradient }
  | { type: 'SET_BACKGROUND_PATTERN'; pattern?: BackgroundPattern }
  | { type: 'REMOVE_BACKGROUND_IMAGE' }
  | { type: 'LOCK_BACKGROUND'; locked: boolean }
  | { type: 'SET_NAME'; name: string }
  | { type: 'GROUP_ELEMENTS'; ids: string[] }
  | { type: 'UNGROUP'; groupId: string }
  | { type: 'DUPLICATE_ELEMENTS'; ids: string[] }
  | { type: 'REPLACE_COLOR_GLOBAL'; targetColor: string; replacementColor: string }
  | { type: 'APPLY_CORNER_ORNAMENTS'; style: CornerOrnamentStyle; color?: string }
  | { type: 'ADD_CUSTOM_FIELD'; key: string; label: string; sampleValue: string }
  | { type: 'REMOVE_CUSTOM_FIELD'; key: string }
  | { type: 'SAVE_VERSION_SNAPSHOT'; label: string }
  | { type: 'RESTORE_VERSION_SNAPSHOT'; snapshotId: string }
  // Selection
  | { type: 'SELECT'; id: string }
  | { type: 'SHIFT_SELECT'; id: string }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'MARQUEE_SELECT'; rect: { x: number; y: number; width: number; height: number }; append: boolean }
  | { type: 'SET_HOVERED'; id: string | null }
  | { type: 'START_TEXT_EDIT'; id: string }
  | { type: 'STOP_TEXT_EDIT' }
  // History
  | { type: 'UNDO' }
  | { type: 'REDO' }
  // Viewport
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'ZOOM_100' }
  | { type: 'ZOOM_FIT'; containerWidth: number; containerHeight: number }
  | { type: 'WHEEL_ZOOM'; delta: number; pointerX: number; pointerY: number }
  | { type: 'PAN'; dx: number; dy: number }
  | { type: 'SET_VIEWPORT'; viewport: ViewportState }
  // Clipboard
  | { type: 'COPY' }
  | { type: 'CUT' }
  | { type: 'PASTE' }
  // Panels
  | { type: 'SET_PANEL'; panel: ToolPanelId }
  | { type: 'TOGGLE_PANEL' }
  // Modes & Guides
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'TOGGLE_FIELD_NAMES' }
  | { type: 'SET_SAVE_STATUS'; status: SaveStatus }
  | { type: 'SET_SNAP_GUIDES'; guides: SnapGuide[] }
  | { type: 'TOGGLE_SNAPPING' }
  | { type: 'TOGGLE_RULERS' }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SAFE_AREA' }
  | { type: 'TOGGLE_BLEED_AREA' }
  | { type: 'SET_SAFE_MARGIN'; margin: number }
  // Alignment & Distribution
  | { type: 'ALIGN'; alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'; relativeTo?: 'canvas' | 'selection' | 'safe-area' }
  | { type: 'DISTRIBUTE'; direction: 'horizontal' | 'vertical' };

// ---------------------------------------------------------------------------
// Helper: apply element update and push to history
// ---------------------------------------------------------------------------
function applyElementUpdate(
  state: EditorState,
  id: string,
  attrs: Partial<DocumentElement>,
  coalesce: boolean,
  label: string,
): EditorState {
  const before = state.document;
  const elements = state.document.elements.map((el) =>
    el.id === id ? { ...el, ...attrs } : el,
  );
  const after: CertificateDocument = {
    ...state.document,
    elements,
    updatedAt: new Date().toISOString(),
  };

  const history = coalesce
    ? coalesceCommand(state.history, label, before, after)
    : pushCommand(state.history, label, before, after);

  return { ...state, document: after, history, saveStatus: 'Unsaved changes' };
}

function applyDocChange(
  state: EditorState,
  label: string,
  after: CertificateDocument,
): EditorState {
  const history = pushCommand(state.history, label, state.document, after);
  return { ...state, document: after, history, saveStatus: 'Unsaved changes' };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return {
        ...state,
        document: action.doc,
        history: createHistory(action.doc),
        selection: INITIAL_SELECTION,
        saveStatus: 'Saved',
      };

    case 'UPDATE_ELEMENT':
      return applyElementUpdate(
        state,
        action.id,
        action.attrs,
        action.coalesce ?? false,
        action.label || 'Update element',
      );

    case 'ADD_ELEMENT': {
      const after = {
        ...state.document,
        elements: [...state.document.elements, action.element],
        updatedAt: new Date().toISOString(),
      };
      return {
        ...applyDocChange(state, `Add ${action.element.name}`, after),
        selection: clickSelect(state.selection, action.element.id),
      };
    }

    case 'ADD_ELEMENTS': {
      const after = {
        ...state.document,
        elements: [...state.document.elements, ...action.elements],
        updatedAt: new Date().toISOString(),
      };
      return {
        ...applyDocChange(state, `Add ${action.elements.length} elements`, after),
        selection: {
          ...state.selection,
          selectedIds: action.elements.map((e) => e.id),
          primaryId: action.elements.length > 0 ? action.elements[action.elements.length - 1].id : null,
        },
      };
    }

    case 'SET_CANVAS_DIMENSIONS': {
      const after = {
        ...state.document,
        width: action.width,
        height: action.height,
        orientation: action.orientation || (action.width >= action.height ? 'landscape' : 'portrait'),
        updatedAt: new Date().toISOString(),
      };
      return applyDocChange(state, 'Change canvas dimensions', after);
    }

    case 'DELETE_ELEMENTS': {
      const after = {
        ...state.document,
        elements: state.document.elements.filter((e) => !action.ids.includes(e.id) || e.locked),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...applyDocChange(state, 'Delete elements', after),
        selection: clearSelection(state.selection),
      };
    }

    case 'REORDER_LAYER': {
      const sorted = [...state.document.elements].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((e) => e.id === action.id);
      if (idx < 0) return state;

      let swapIdx: number;
      if (action.direction === 'up') swapIdx = Math.min(sorted.length - 1, idx + 1);
      else if (action.direction === 'down') swapIdx = Math.max(0, idx - 1);
      else if (action.direction === 'top') swapIdx = sorted.length - 1;
      else swapIdx = 0;

      if (swapIdx === idx) return state;

      if (action.direction === 'top' || action.direction === 'bottom') {
        const [removed] = sorted.splice(idx, 1);
        sorted.splice(swapIdx, 0, removed);
        sorted.forEach((el, i) => (el.zIndex = i));
      } else {
        const tempZ = sorted[idx].zIndex;
        sorted[idx].zIndex = sorted[swapIdx].zIndex;
        sorted[swapIdx].zIndex = tempZ;
      }

      const after = { ...state.document, elements: sorted, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Reorder layer', after);
    }

    case 'REORDER_LAYER_TO_INDEX': {
      const sorted = [...state.document.elements].sort((a, b) => a.zIndex - b.zIndex);
      const fromIdx = sorted.findIndex((e) => e.id === action.id);
      if (fromIdx < 0) return state;
      const [removed] = sorted.splice(fromIdx, 1);
      const clampedIdx = Math.max(0, Math.min(sorted.length, action.toIndex));
      sorted.splice(clampedIdx, 0, removed);
      sorted.forEach((el, i) => (el.zIndex = i));
      const after = { ...state.document, elements: sorted, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Reorder layer', after);
    }

    case 'RENAME_ELEMENT': {
      return applyElementUpdate(state, action.id, { name: action.name }, false, 'Rename element');
    }

    case 'SET_BACKGROUND_COLOR': {
      const after = { ...state.document, backgroundColor: action.color, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Change background color', after);
    }

    case 'SET_BACKGROUND_IMAGE': {
      const after = { ...state.document, backgroundDataUrl: action.dataUrl, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Set background image', after);
    }

    case 'SET_BACKGROUND_OPACITY': {
      const after = { ...state.document, backgroundOpacity: action.opacity, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Change background opacity', after);
    }

    case 'SET_BACKGROUND_GRADIENT': {
      const after = { ...state.document, backgroundGradient: action.gradient, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Change background gradient', after);
    }

    case 'SET_BACKGROUND_PATTERN': {
      const after = { ...state.document, backgroundPattern: action.pattern, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Change background pattern', after);
    }

    case 'REMOVE_BACKGROUND_IMAGE': {
      const after = { ...state.document, backgroundDataUrl: undefined, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Remove background image', after);
    }

    case 'LOCK_BACKGROUND': {
      return { ...state, document: { ...state.document, backgroundLocked: action.locked } };
    }

    case 'SET_NAME':
      return {
        ...state,
        document: { ...state.document, name: action.name },
        saveStatus: 'Unsaved changes',
      };

    case 'GROUP_ELEMENTS': {
      if (action.ids.length < 2) return state;
      const groupId = `group-${Date.now()}`;
      const elements = state.document.elements.map((el) =>
        action.ids.includes(el.id) ? { ...el, groupId } : el,
      );
      const after = { ...state.document, elements, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Group elements', after);
    }

    case 'UNGROUP': {
      const elements = state.document.elements.map((el) =>
        el.groupId === action.groupId ? { ...el, groupId: undefined } : el,
      );
      const after = { ...state.document, elements, updatedAt: new Date().toISOString() };
      return applyDocChange(state, 'Ungroup', after);
    }

    case 'DUPLICATE_ELEMENTS': {
      const maxZ = getMaxZ(state.document.elements);
      const newElements: DocumentElement[] = [];
      action.ids.forEach((id, i) => {
        const original = state.document.elements.find((e) => e.id === id);
        if (!original) return;
        newElements.push({
          ...structuredClone(original),
          id: `el-dup-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          name: `${original.name} Copy`,
          x: original.x + 20,
          y: original.y + 20,
          zIndex: maxZ + 1 + i,
          groupId: undefined,
        });
      });
      const after = {
        ...state.document,
        elements: [...state.document.elements, ...newElements],
        updatedAt: new Date().toISOString(),
      };
      const newState = applyDocChange(state, 'Duplicate', after);
      return {
        ...newState,
        selection: {
          ...newState.selection,
          selectedIds: newElements.map((e) => e.id),
          primaryId: newElements.length > 0 ? newElements[newElements.length - 1].id : null,
        },
      };
    }

    case 'REPLACE_COLOR_GLOBAL': {
      const { targetColor, replacementColor } = action;
      if (!targetColor || !replacementColor || targetColor === replacementColor) return state;

      const normTarget = targetColor.toLowerCase();
      const elements = state.document.elements.map((el) => {
        const cloned = structuredClone(el);
        if (cloned.textStyle && cloned.textStyle.fill && cloned.textStyle.fill.toLowerCase() === normTarget) {
          cloned.textStyle.fill = replacementColor;
        }
        if (cloned.shapeStyle) {
          if (cloned.shapeStyle.fill && cloned.shapeStyle.fill.toLowerCase() === normTarget) {
            cloned.shapeStyle.fill = replacementColor;
          }
          if (cloned.shapeStyle.stroke && cloned.shapeStyle.stroke.toLowerCase() === normTarget) {
            cloned.shapeStyle.stroke = replacementColor;
          }
        }
        if (cloned.borderStyle && cloned.borderStyle.color && cloned.borderStyle.color.toLowerCase() === normTarget) {
          cloned.borderStyle.color = replacementColor;
        }
        return cloned;
      });

      let bgColor = state.document.backgroundColor;
      if (bgColor && bgColor.toLowerCase() === normTarget) {
        bgColor = replacementColor;
      }

      const after = {
        ...state.document,
        backgroundColor: bgColor,
        elements,
        updatedAt: new Date().toISOString(),
      };
      return applyDocChange(state, `Replace color ${targetColor} → ${replacementColor}`, after);
    }

    case 'APPLY_CORNER_ORNAMENTS': {
      const ornaments = createCornerOrnamentSet(
        action.style,
        state.document.width,
        state.document.height,
        getMaxZ(state.document.elements),
        action.color || '#D97706',
      );
      const after = {
        ...state.document,
        elements: [...state.document.elements, ...ornaments],
        updatedAt: new Date().toISOString(),
      };
      return applyDocChange(state, `Add ${action.style} corner ornaments`, after);
    }

    case 'ADD_CUSTOM_FIELD': {
      const existing = state.document.customFields || [];
      const updated = [...existing.filter((f) => f.key !== action.key), { key: action.key, label: action.label, sampleValue: action.sampleValue }];
      const after = { ...state.document, customFields: updated, updatedAt: new Date().toISOString() };
      return applyDocChange(state, `Add custom field ${action.key}`, after);
    }

    case 'REMOVE_CUSTOM_FIELD': {
      const existing = state.document.customFields || [];
      const updated = existing.filter((f) => f.key !== action.key);
      const after = { ...state.document, customFields: updated, updatedAt: new Date().toISOString() };
      return applyDocChange(state, `Remove custom field ${action.key}`, after);
    }

    case 'SAVE_VERSION_SNAPSHOT': {
      const newSnapshot: VersionSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: Date.now(),
        label: action.label || `Version ${new Date().toLocaleTimeString()}`,
        document: structuredClone(state.document),
      };
      const versionHistory = [...(state.document.versionHistory || []), newSnapshot].slice(-20);
      const after = { ...state.document, versionHistory };
      return { ...state, document: after };
    }

    case 'RESTORE_VERSION_SNAPSHOT': {
      const snapshot = state.document.versionHistory?.find((v) => v.id === action.snapshotId);
      if (!snapshot) return state;
      const after = { ...structuredClone(snapshot.document), updatedAt: new Date().toISOString() };
      return applyDocChange(state, `Restore ${snapshot.label}`, after);
    }

    // --- Selection ---
    case 'SELECT':
      return { ...state, selection: clickSelect(state.selection, action.id) };
    case 'SHIFT_SELECT':
      return { ...state, selection: shiftClickSelect(state.selection, action.id) };
    case 'SELECT_ALL':
      return { ...state, selection: selectAllFn(state.document.elements) };
    case 'CLEAR_SELECTION':
      return { ...state, selection: clearSelection(state.selection) };
    case 'MARQUEE_SELECT':
      return { ...state, selection: marqueeSelectFn(state.document.elements, action.rect, action.append, state.selection) };
    case 'SET_HOVERED':
      return { ...state, selection: setHovered(state.selection, action.id) };
    case 'START_TEXT_EDIT':
      return { ...state, selection: startTextEditing(state.selection, action.id) };
    case 'STOP_TEXT_EDIT':
      return { ...state, selection: stopTextEditing(state.selection) };

    // --- History ---
    case 'UNDO': {
      const result = undoHistory(state.history);
      if (!result) return state;
      return { ...state, document: result.document, history: result.newHistory, saveStatus: 'Unsaved changes' };
    }
    case 'REDO': {
      const result = redoHistory(state.history);
      if (!result) return state;
      return { ...state, document: result.document, history: result.newHistory, saveStatus: 'Unsaved changes' };
    }

    // --- Viewport ---
    case 'ZOOM_IN':
      return { ...state, viewport: zoomInFn(state.viewport) };
    case 'ZOOM_OUT':
      return { ...state, viewport: zoomOutFn(state.viewport) };
    case 'ZOOM_100':
      return { ...state, viewport: zoomTo100Fn(state.viewport) };
    case 'ZOOM_FIT':
      return {
        ...state,
        viewport: zoomToFitFn(
          state.document.width,
          state.document.height,
          action.containerWidth,
          action.containerHeight,
        ),
      };
    case 'WHEEL_ZOOM':
      return { ...state, viewport: wheelZoomFn(state.viewport, action.delta, action.pointerX, action.pointerY) };
    case 'PAN':
      return { ...state, viewport: panFn(state.viewport, action.dx, action.dy) };
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport };

    // --- Clipboard ---
    case 'COPY': {
      const copied = state.document.elements.filter((e) => state.selection.selectedIds.includes(e.id));
      return { ...state, clipboard: copied.map((e) => structuredClone(e)) };
    }
    case 'CUT': {
      const cut = state.document.elements.filter((e) => state.selection.selectedIds.includes(e.id));
      const remaining = state.document.elements.filter((e) => !state.selection.selectedIds.includes(e.id));
      const after = { ...state.document, elements: remaining, updatedAt: new Date().toISOString() };
      return {
        ...applyDocChange(state, 'Cut', after),
        clipboard: cut.map((e) => structuredClone(e)),
        selection: clearSelection(state.selection),
      };
    }
    case 'PASTE': {
      if (state.clipboard.length === 0) return state;
      const maxZ = getMaxZ(state.document.elements);
      const pasted = state.clipboard.map((e, i) => ({
        ...structuredClone(e),
        id: `el-paste-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        x: e.x + 20,
        y: e.y + 20,
        zIndex: maxZ + 1 + i,
        groupId: undefined,
      }));
      const after = {
        ...state.document,
        elements: [...state.document.elements, ...pasted],
        updatedAt: new Date().toISOString(),
      };
      const newState = applyDocChange(state, 'Paste', after);
      return {
        ...newState,
        selection: {
          ...newState.selection,
          selectedIds: pasted.map((e) => e.id),
          primaryId: pasted.length > 0 ? pasted[pasted.length - 1].id : null,
        },
      };
    }

    // --- Panels ---
    case 'SET_PANEL':
      if (action.panel === state.activePanel && state.isPanelOpen) {
        return { ...state, isPanelOpen: false, activePanel: null };
      }
      return { ...state, activePanel: action.panel, isPanelOpen: action.panel !== null };
    case 'TOGGLE_PANEL':
      return { ...state, isPanelOpen: !state.isPanelOpen };

    // --- Modes & Guides ---
    case 'TOGGLE_PREVIEW':
      return { ...state, isPreviewMode: !state.isPreviewMode };
    case 'TOGGLE_FIELD_NAMES':
      return { ...state, showFieldNames: !state.showFieldNames };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.status };
    case 'SET_SNAP_GUIDES':
      return { ...state, snapGuides: action.guides };
    case 'TOGGLE_SNAPPING':
      return { ...state, snappingEnabled: !state.snappingEnabled };
    case 'TOGGLE_RULERS':
      return { ...state, showRulers: !state.showRulers };
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };
    case 'TOGGLE_SAFE_AREA':
      return { ...state, showSafeArea: !state.showSafeArea };
    case 'TOGGLE_BLEED_AREA':
      return { ...state, showBleedArea: !state.showBleedArea };
    case 'SET_SAFE_MARGIN':
      return { ...state, safeMarginPx: action.margin };

    // --- Alignment ---
    case 'ALIGN': {
      const ids = state.selection.selectedIds;
      if (ids.length === 0) return state;
      const selected = state.document.elements.filter((e) => ids.includes(e.id));
      const doc = state.document;
      const relativeTo = action.relativeTo || (ids.length === 1 ? 'canvas' : 'selection');

      let elements = [...doc.elements];
      let refX = 0;
      let refY = 0;
      let refW = doc.width;
      let refH = doc.height;

      if (relativeTo === 'safe-area') {
        const margin = state.safeMarginPx || 40;
        refX = margin;
        refY = margin;
        refW = doc.width - margin * 2;
        refH = doc.height - margin * 2;
      } else if (relativeTo === 'selection' && ids.length > 1) {
        let bMinX = Infinity, bMinY = Infinity, bMaxX = -Infinity, bMaxY = -Infinity;
        for (const el of selected) {
          bMinX = Math.min(bMinX, el.x);
          bMinY = Math.min(bMinY, el.y);
          bMaxX = Math.max(bMaxX, el.x + el.width);
          bMaxY = Math.max(bMaxY, el.y + el.height);
        }
        refX = bMinX;
        refY = bMinY;
        refW = bMaxX - bMinX;
        refH = bMaxY - bMinY;
      }

      elements = elements.map((el) => {
        if (!ids.includes(el.id)) return el;
        let { x, y } = el;
        switch (action.alignment) {
          case 'left': x = refX; break;
          case 'center': x = refX + (refW - el.width) / 2; break;
          case 'right': x = refX + refW - el.width; break;
          case 'top': y = refY; break;
          case 'middle': y = refY + (refH - el.height) / 2; break;
          case 'bottom': y = refY + refH - el.height; break;
        }
        return { ...el, x, y };
      });

      const after = { ...doc, elements, updatedAt: new Date().toISOString() };
      return applyDocChange(state, `Align ${action.alignment}`, after);
    }

    case 'DISTRIBUTE': {
      const ids = state.selection.selectedIds;
      if (ids.length < 3) return state;
      const selected = state.document.elements.filter((e) => ids.includes(e.id));
      const sorted = [...selected].sort((a, b) =>
        action.direction === 'horizontal' ? a.x - b.x : a.y - b.y,
      );

      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalGap =
        action.direction === 'horizontal'
          ? last.x + last.width - first.x - sorted.reduce((s, e) => s + e.width, 0)
          : last.y + last.height - first.y - sorted.reduce((s, e) => s + e.height, 0);
      const gap = totalGap / (sorted.length - 1);

      let cursor = action.direction === 'horizontal' ? first.x + first.width + gap : first.y + first.height + gap;
      const updates = new Map<string, { x?: number; y?: number }>();
      for (let i = 1; i < sorted.length - 1; i++) {
        if (action.direction === 'horizontal') {
          updates.set(sorted[i].id, { x: cursor });
          cursor += sorted[i].width + gap;
        } else {
          updates.set(sorted[i].id, { y: cursor });
          cursor += sorted[i].height + gap;
        }
      }

      const elements = state.document.elements.map((el) => {
        const upd = updates.get(el.id);
        return upd ? { ...el, ...upd } : el;
      });
      const after = { ...state.document, elements, updatedAt: new Date().toISOString() };
      return applyDocChange(state, `Distribute ${action.direction}`, after);
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context & Provider
// ---------------------------------------------------------------------------
function createInitialState(doc: CertificateDocument): EditorState {
  let lastPanel: ToolPanelId = 'elements';
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('certifyhub:editor:lastPanel');
    if (saved) lastPanel = saved as ToolPanelId;
  }

  return {
    document: doc,
    selection: INITIAL_SELECTION,
    history: createHistory(doc),
    viewport: INITIAL_VIEWPORT,
    clipboard: [],
    activePanel: lastPanel,
    isPanelOpen: true,
    isPreviewMode: false,
    showFieldNames: false,
    saveStatus: 'Saved',
    snapGuides: [],
    snappingEnabled: true,
    showRulers: true,
    showGrid: false,
    showSafeArea: true,
    showBleedArea: false,
    safeMarginPx: 40,
  };
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Centralized Element Operations
  addElement: (element: DocumentElement) => void;
  addElements: (elements: DocumentElement[]) => void;
  updateElement: (id: string, attrs: Partial<DocumentElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  rotateElement: (id: string, rotation: number) => void;
  selectElement: (id: string) => void;
  lockElement: (id: string) => void;
  unlockElement: (id: string) => void;
  hideElement: (id: string) => void;
  showElement: (id: string) => void;

  // Convenience action creators
  addText: (text: string, isHeading: boolean, presetStyle?: Partial<DocumentElement['textStyle']>) => void;
  addDynamicField: (key: string, customLabel?: string, customSample?: string) => void;
  addShape: (shapeType: ShapeVariant, isMask?: boolean) => void;
  addShapePreset: (presetType: 'divider' | 'double-divider' | 'corner-ornament' | 'decorative-circle' | 'star-accent' | 'seal-placeholder' | 'ribbon-badge' | 'gold-medal') => void;
  addCornerOrnaments: (style: CornerOrnamentStyle, color?: string) => void;
  addImage: (dataUrl: string, name: string) => void;
  addLogo: (dataUrl: string) => void;
  addSignature: (dataUrl: string, name?: string, designation?: string) => void;
  addQrCode: () => void;
  addBorder: (borderType?: DocumentElement['borderStyle'] extends infer B ? B extends { borderType: infer T } ? T : never : never) => void;
  addCertificateCode: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  save: () => Promise<void>;
  createVersionSnapshot: (label?: string) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  initialDocument,
  onSave,
  children,
}: {
  initialDocument: CertificateDocument;
  onSave: (doc: CertificateDocument) => Promise<void>;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(editorReducer, initialDocument, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist last panel selection
  useEffect(() => {
    if (state.activePanel) {
      localStorage.setItem('certifyhub:editor:lastPanel', state.activePanel);
    }
  }, [state.activePanel]);

  // Local crash recovery auto-saving
  useEffect(() => {
    if (typeof window !== 'undefined' && state.document.id) {
      try {
        localStorage.setItem(`certifyhub:v1:draft_${state.document.id}`, JSON.stringify(state.document));
      } catch {
        // storage quota fallback
      }
    }
  }, [state.document]);

  // Autosave (debounced 1.5s after edits pause)
  useEffect(() => {
    if (state.saveStatus !== 'Unsaved changes') return;
    const timer = setTimeout(async () => {
      dispatch({ type: 'SET_SAVE_STATUS', status: 'Saving...' });
      try {
        await onSave(stateRef.current.document);
        dispatch({ type: 'SET_SAVE_STATUS', status: 'Saved' });
      } catch {
        dispatch({ type: 'SET_SAVE_STATUS', status: 'Save failed' });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [state.saveStatus, state.document, onSave]);

  // Unsaved changes protection
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (stateRef.current.saveStatus === 'Unsaved changes' || stateRef.current.saveStatus === 'Saving...') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const doc = state.document;

  const addText = useCallback(
    (text: string, isHeading: boolean, presetStyle?: Partial<DocumentElement['textStyle']>) => {
      const el = createTextElement(text, isHeading, doc.width, doc.height, getMaxZ(doc.elements), presetStyle);
      dispatch({ type: 'ADD_ELEMENT', element: el });
    },
    [doc.width, doc.height, doc.elements],
  );

  const addDynamicField = useCallback(
    (key: string, customLabel?: string, customSample?: string) => {
      const el = createDynamicTextElement(key, doc.width, doc.height, getMaxZ(doc.elements), customLabel, customSample);
      dispatch({ type: 'ADD_ELEMENT', element: el });
    },
    [doc.width, doc.height, doc.elements],
  );

  const addShape = useCallback(
    (shapeType: ShapeVariant, isMask = false) => {
      const el = createShapeElement(shapeType, doc.width, doc.height, getMaxZ(doc.elements), isMask);
      dispatch({ type: 'ADD_ELEMENT', element: el });
    },
    [doc.width, doc.height, doc.elements],
  );

  const addShapePreset = useCallback(
    (presetType: 'divider' | 'double-divider' | 'corner-ornament' | 'decorative-circle' | 'star-accent' | 'seal-placeholder' | 'ribbon-badge' | 'gold-medal') => {
      const el = createDecorativeShapePreset(presetType, doc.width, doc.height, getMaxZ(doc.elements));
      dispatch({ type: 'ADD_ELEMENT', element: el });
    },
    [doc.width, doc.height, doc.elements],
  );

  const addCornerOrnaments = useCallback(
    (style: CornerOrnamentStyle, color?: string) => {
      dispatch({ type: 'APPLY_CORNER_ORNAMENTS', style, color });
    },
    [],
  );

  const addImage = useCallback(
    (dataUrl: string, name: string) => {
      const el = createImageElement(dataUrl, name, doc.width, doc.height, getMaxZ(doc.elements));
      dispatch({ type: 'ADD_ELEMENT', element: el });
    },
    [doc.width, doc.height, doc.elements],
  );

  const addLogo = useCallback(
    (dataUrl: string) => {
      const el = createLogoElement(dataUrl, doc.width, doc.height, getMaxZ(doc.elements));
      dispatch({ type: 'ADD_ELEMENT', element: el });
    },
    [doc.width, doc.height, doc.elements],
  );

  const addSignature = useCallback(
    (dataUrl: string, name?: string, designation?: string) => {
      const el = createSignatureElement(dataUrl, doc.width, doc.height, getMaxZ(doc.elements), name, designation);
      dispatch({ type: 'ADD_ELEMENT', element: el });
    },
    [doc.width, doc.height, doc.elements],
  );

  const addQrCode = useCallback(() => {
    const el = createQrElement(doc.width, doc.height, getMaxZ(doc.elements));
    dispatch({ type: 'ADD_ELEMENT', element: el });
  }, [doc.width, doc.height, doc.elements]);

  const addBorder = useCallback((borderType: DocumentElement['borderStyle'] extends infer B ? B extends { borderType: infer T } ? T : never : never = 'double') => {
    const el = createBorderElement(doc.width, doc.height, getMaxZ(doc.elements), borderType);
    dispatch({ type: 'ADD_ELEMENT', element: el });
  }, [doc.width, doc.height, doc.elements]);

  const addCertificateCode = useCallback(() => {
    const el = createCertificateCodeElement(doc.width, doc.height, getMaxZ(doc.elements));
    dispatch({ type: 'ADD_ELEMENT', element: el });
  }, [doc.width, doc.height, doc.elements]);

  const deleteSelected = useCallback(() => {
    if (state.selection.selectedIds.length > 0) {
      dispatch({ type: 'DELETE_ELEMENTS', ids: state.selection.selectedIds });
    }
  }, [state.selection.selectedIds]);

  const duplicateSelected = useCallback(() => {
    if (state.selection.selectedIds.length > 0) {
      dispatch({ type: 'DUPLICATE_ELEMENTS', ids: state.selection.selectedIds });
    }
  }, [state.selection.selectedIds]);

  const addElement = useCallback((element: DocumentElement) => {
    dispatch({ type: 'ADD_ELEMENT', element });
  }, []);

  const addElements = useCallback((elements: DocumentElement[]) => {
    dispatch({ type: 'ADD_ELEMENTS', elements });
  }, []);

  const updateElement = useCallback((id: string, attrs: Partial<DocumentElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs });
  }, []);

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENTS', ids: [id] });
  }, []);

  const duplicateElement = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_ELEMENTS', ids: [id] });
  }, []);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { x, y }, coalesce: true, label: 'Move element' });
  }, []);

  const resizeElement = useCallback((id: string, width: number, height: number) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { width, height }, label: 'Resize element' });
  }, []);

  const rotateElement = useCallback((id: string, rotation: number) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { rotation }, label: 'Rotate element' });
  }, []);

  const selectElement = useCallback((id: string) => {
    dispatch({ type: 'SELECT', id });
  }, []);

  const lockElement = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { locked: true }, label: 'Lock element' });
  }, []);

  const unlockElement = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { locked: false }, label: 'Unlock element' });
  }, []);

  const hideElement = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { visible: false }, label: 'Hide element' });
  }, []);

  const showElement = useCallback((id: string) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { visible: true }, label: 'Show element' });
  }, []);

  const save = useCallback(async () => {
    dispatch({ type: 'SET_SAVE_STATUS', status: 'Saving...' });
    try {
      await onSave(stateRef.current.document);
      dispatch({ type: 'SET_SAVE_STATUS', status: 'Saved' });
    } catch {
      dispatch({ type: 'SET_SAVE_STATUS', status: 'Save failed' });
    }
  }, [onSave]);

  const createVersionSnapshot = useCallback((label?: string) => {
    dispatch({ type: 'SAVE_VERSION_SNAPSHOT', label: label || `Snapshot ${new Date().toLocaleTimeString()}` });
  }, []);

  const value: EditorContextValue = {
    state,
    dispatch,
    addElement,
    addElements,
    updateElement,
    deleteElement,
    duplicateElement,
    moveElement,
    resizeElement,
    rotateElement,
    selectElement,
    lockElement,
    unlockElement,
    hideElement,
    showElement,
    addText,
    addDynamicField,
    addShape,
    addShapePreset,
    addCornerOrnaments,
    addImage,
    addLogo,
    addSignature,
    addQrCode,
    addBorder,
    addCertificateCode,
    deleteSelected,
    duplicateSelected,
    save,
    createVersionSnapshot,
  };

  return React.createElement(EditorContext.Provider, { value }, children);
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}

// Re-export useful functions
export { canUndoFn as canUndo, canRedoFn as canRedo, SAMPLE_DATA };
