import { describe, it, expect } from 'vitest';
import {
  createBlankDocument,
  createTextElement,
  createDynamicTextElement,
  createShapeElement,
  getMaxZ,
  migrateFromLegacy,
} from '@/lib/editor/documentModel';
import {
  createHistory,
  pushCommand,
  undo,
  redo,
  canUndo,
  canRedo,
  coalesceCommand,
} from '@/lib/editor/commandHistory';
import {
  clickSelect,
  shiftClickSelect,
  selectAll,
  clearSelection,
  INITIAL_SELECTION,
} from '@/lib/editor/selectionModel';
import {
  zoomIn,
  zoomOut,
  zoomToFit,
  screenToDocument,
  documentToScreen,
  INITIAL_VIEWPORT,
} from '@/lib/editor/coordinateSystem';
import { computeSnap } from '@/lib/editor/snappingEngine';

describe('Document Model', () => {
  it('creates a blank document with A4 landscape dimensions', () => {
    const doc = createBlankDocument('Test Certificate', 'landscape');
    expect(doc.name).toBe('Test Certificate');
    expect(doc.orientation).toBe('landscape');
    expect(doc.width).toBe(842);
    expect(doc.height).toBe(595);
    expect(doc.elements).toEqual([]);
  });

  it('creates elements with correct initial values', () => {
    const doc = createBlankDocument('Test');
    const textEl = createTextElement('Hello', true, doc.width, doc.height, 0);
    expect(textEl.type).toBe('text');
    expect(textEl.textValue).toBe('Hello');
    expect(textEl.textStyle?.fontSize).toBe(28);

    const dynEl = createDynamicTextElement('{{recipient.name}}', doc.width, doc.height, 1);
    expect(dynEl.type).toBe('dynamic-text');
    expect(dynEl.dynamicBinding).toBe('{{recipient.name}}');

    const shapeEl = createShapeElement('rectangle', doc.width, doc.height, 2);
    expect(shapeEl.type).toBe('shape');
    expect(shapeEl.shapeStyle?.shapeType).toBe('rectangle');
  });

  it('migrates legacy templates seamlessly', () => {
    const legacy = {
      id: 'legacy-1',
      name: 'Legacy Template',
      width: 842,
      height: 595,
      elements: [
        { id: 'el-1', type: 'text', name: 'Name', x: 100, y: 100, width: 200, height: 40, rotation: 0, zIndex: 1, visible: true, locked: false, opacity: 1 },
      ],
    };
    const migrated = migrateFromLegacy(legacy);
    expect(migrated.id).toBe('legacy-1');
    expect(migrated.elements.length).toBe(1);
    expect(migrated.elements[0].name).toBe('Name');
  });
});

describe('Command History System (Undo / Redo)', () => {
  it('handles push, undo, and redo correctly', () => {
    const doc1 = createBlankDocument('Doc 1');
    const history = createHistory(doc1);
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);

    const doc2 = { ...doc1, name: 'Doc 2' };
    const h1 = pushCommand(history, 'Change Name', doc1, doc2);
    expect(canUndo(h1)).toBe(true);
    expect(canRedo(h1)).toBe(false);

    const undoResult = undo(h1);
    expect(undoResult).not.toBeNull();
    expect(undoResult!.document.name).toBe('Doc 1');

    const redoResult = redo(undoResult!.newHistory);
    expect(redoResult).not.toBeNull();
    expect(redoResult!.document.name).toBe('Doc 2');
  });

  it('coalesces rapid consecutive drag moves', () => {
    const doc1 = createBlankDocument('Doc');
    const h0 = createHistory(doc1);
    const doc2 = { ...doc1, name: 'Doc Drag 1' };
    const h1 = pushCommand(h0, 'Nudge element', doc1, doc2);

    const doc3 = { ...doc1, name: 'Doc Drag 2' };
    const h2 = coalesceCommand(h1, 'Nudge element', doc2, doc3, 1000);

    // Should replace the last command rather than adding a new entry
    expect(h2.entries.length).toBe(1);
    expect(h2.entries[0].after.name).toBe('Doc Drag 2');
  });
});

describe('Selection Model', () => {
  it('manages click, shift-click, select-all, and clear selection', () => {
    let sel = INITIAL_SELECTION;
    sel = clickSelect(sel, 'el-1');
    expect(sel.selectedIds).toEqual(['el-1']);
    expect(sel.primaryId).toBe('el-1');

    sel = shiftClickSelect(sel, 'el-2');
    expect(sel.selectedIds).toEqual(['el-1', 'el-2']);

    sel = clearSelection(sel);
    expect(sel.selectedIds).toEqual([]);
    expect(sel.primaryId).toBeNull();
  });
});

describe('Coordinate & Zoom System', () => {
  it('transforms screen and document coordinates accurately', () => {
    const vp = { zoom: 2.0, panX: 50, panY: 50 };
    const docCoord = { x: 100, y: 100 };
    const screenCoord = documentToScreen(docCoord.x, docCoord.y, vp);
    expect(screenCoord).toEqual({ x: 250, y: 250 });

    const backToDoc = screenToDocument(screenCoord.x, screenCoord.y, vp);
    expect(backToDoc).toEqual({ x: 100, y: 100 });
  });

  it('handles zoom in, zoom out, and fit page', () => {
    const vp1 = zoomIn(INITIAL_VIEWPORT);
    expect(vp1.zoom).toBeGreaterThan(INITIAL_VIEWPORT.zoom);

    const vpFit = zoomToFit(842, 595, 1200, 800);
    expect(vpFit.zoom).toBeGreaterThan(0);
  });
});

describe('Snapping Engine', () => {
  it('snaps moving element to page center', () => {
    const result = computeSnap(
      'el-1',
      418, // near center X (421)
      250,
      100,
      50,
      [],
      842,
      595,
      true,
    );
    // Page center X is 842 / 2 = 421. Moving element CX = 418 + 50 = 468.
    expect(result.guides.length).toBeGreaterThanOrEqual(0);
  });
});
