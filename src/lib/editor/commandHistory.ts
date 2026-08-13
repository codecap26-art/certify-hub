// ============================================================================
// Command History — undo/redo system with drag coalescing
// ============================================================================

import { CertificateDocument } from './documentModel';

/** A snapshot-based command storing before and after document states. */
export interface HistoryEntry {
  label: string;
  before: CertificateDocument;
  after: CertificateDocument;
  timestamp: number;
}

export interface CommandHistoryState {
  entries: HistoryEntry[];
  cursor: number; // index of the current entry (-1 = initial state)
  initialState: CertificateDocument;
}

const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Create empty history
// ---------------------------------------------------------------------------
export function createHistory(initialDoc: CertificateDocument): CommandHistoryState {
  return {
    entries: [],
    cursor: -1,
    initialState: structuredClone(initialDoc),
  };
}

// ---------------------------------------------------------------------------
// Push a new command (discards any redo stack beyond cursor)
// ---------------------------------------------------------------------------
export function pushCommand(
  history: CommandHistoryState,
  label: string,
  before: CertificateDocument,
  after: CertificateDocument,
): CommandHistoryState {
  // Discard any entries after cursor
  const trimmed = history.entries.slice(0, history.cursor + 1);

  const entry: HistoryEntry = {
    label,
    before: structuredClone(before),
    after: structuredClone(after),
    timestamp: Date.now(),
  };

  trimmed.push(entry);

  // Enforce max history limit
  while (trimmed.length > MAX_HISTORY) {
    trimmed.shift();
  }

  return {
    ...history,
    entries: trimmed,
    cursor: trimmed.length - 1,
  };
}

// ---------------------------------------------------------------------------
// Undo — returns the document to restore, or null if nothing to undo
// ---------------------------------------------------------------------------
export function undo(history: CommandHistoryState): {
  newHistory: CommandHistoryState;
  document: CertificateDocument;
} | null {
  if (history.cursor < 0) return null;

  const entry = history.entries[history.cursor];
  return {
    newHistory: { ...history, cursor: history.cursor - 1 },
    document: structuredClone(entry.before),
  };
}

// ---------------------------------------------------------------------------
// Redo — returns the document to apply, or null if nothing to redo
// ---------------------------------------------------------------------------
export function redo(history: CommandHistoryState): {
  newHistory: CommandHistoryState;
  document: CertificateDocument;
} | null {
  if (history.cursor >= history.entries.length - 1) return null;

  const entry = history.entries[history.cursor + 1];
  return {
    newHistory: { ...history, cursor: history.cursor + 1 },
    document: structuredClone(entry.after),
  };
}

// ---------------------------------------------------------------------------
// Can undo / can redo
// ---------------------------------------------------------------------------
export function canUndo(history: CommandHistoryState): boolean {
  return history.cursor >= 0;
}

export function canRedo(history: CommandHistoryState): boolean {
  return history.cursor < history.entries.length - 1;
}

// ---------------------------------------------------------------------------
// Drag coalescing: replace the last command if it has the same label
// and was within a short time window (for continuous drags)
// ---------------------------------------------------------------------------
export function coalesceCommand(
  history: CommandHistoryState,
  label: string,
  before: CertificateDocument,
  after: CertificateDocument,
  windowMs = 300,
): CommandHistoryState {
  if (
    history.cursor >= 0 &&
    history.entries[history.cursor].label === label &&
    Date.now() - history.entries[history.cursor].timestamp < windowMs
  ) {
    // Replace the last entry's `after` state, keep its `before`
    const updated = [...history.entries];
    updated[history.cursor] = {
      ...updated[history.cursor],
      after: structuredClone(after),
      timestamp: Date.now(),
    };
    return { ...history, entries: updated };
  }

  // Otherwise push as new command
  return pushCommand(history, label, before, after);
}
