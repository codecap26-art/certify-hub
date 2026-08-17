'use client';

import React, { useEffect, useRef } from 'react';
import {
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  Copy,
  Scissors,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Group,
  Ungroup,
  Layers,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const CanvasContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const { state, dispatch, duplicateSelected, deleteSelected } = useEditor();
  const { selectedIds } = state.selection;
  const menuRef = useRef<HTMLDivElement>(null);

  const isMulti = selectedIds.length > 1;
  const primaryElem = state.document.elements.find((e) => e.id === selectedIds[selectedIds.length - 1]);
  const isLocked = primaryElem?.locked;
  const isVisible = primaryElem?.visible;
  const hasGroup = isMulti || Boolean(primaryElem?.groupId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Clamp within viewport
  const style: React.CSSProperties = {
    top: Math.min(y, window.innerHeight - 340),
    left: Math.min(x, window.innerWidth - 220),
  };

  const handleAction = (actionFn: () => void) => {
    actionFn();
    onClose();
  };

  if (selectedIds.length === 0) {
    return (
      <div
        ref={menuRef}
        style={style}
        className="fixed z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs text-slate-700 select-none animate-fade-in"
      >
        <button
          onClick={() => handleAction(() => dispatch({ type: 'SELECT_ALL' }))}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-500" /> Select All
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
        </button>
        <button
          onClick={() => handleAction(() => dispatch({ type: 'PASTE' }))}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition"
        >
          <span className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-slate-500" /> Paste
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed z-50 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 text-xs text-slate-700 select-none space-y-0.5 animate-fade-in divide-y divide-slate-100"
    >
      {/* Group 1: Clipboard & Duplicate */}
      <div className="py-1">
        <button
          onClick={() => handleAction(() => duplicateSelected())}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition"
        >
          <span className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-slate-500" /> Duplicate
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+D</span>
        </button>
        <button
          onClick={() => handleAction(() => dispatch({ type: 'COPY' }))}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition"
        >
          <span className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
        </button>
        <button
          onClick={() => handleAction(() => dispatch({ type: 'CUT' }))}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition"
        >
          <span className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-slate-500" /> Cut
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Ctrl+X</span>
        </button>
      </div>

      {/* Group 2: Layer Arrangement */}
      <div className="py-1">
        {primaryElem && (
          <>
            <button
              onClick={() => handleAction(() => dispatch({ type: 'REORDER_LAYER', id: primaryElem.id, direction: 'top' }))}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 transition"
            >
              <ChevronsUp className="w-3.5 h-3.5 text-slate-500" /> Bring to Front
            </button>
            <button
              onClick={() => handleAction(() => dispatch({ type: 'REORDER_LAYER', id: primaryElem.id, direction: 'up' }))}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 transition"
            >
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> Bring Forward
            </button>
            <button
              onClick={() => handleAction(() => dispatch({ type: 'REORDER_LAYER', id: primaryElem.id, direction: 'down' }))}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 transition"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> Send Backward
            </button>
            <button
              onClick={() => handleAction(() => dispatch({ type: 'REORDER_LAYER', id: primaryElem.id, direction: 'bottom' }))}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 transition"
            >
              <ChevronsDown className="w-3.5 h-3.5 text-slate-500" /> Send to Back
            </button>
          </>
        )}
      </div>

      {/* Group 3: Grouping / Align */}
      <div className="py-1">
        {isMulti ? (
          <button
            onClick={() => handleAction(() => dispatch({ type: 'GROUP_ELEMENTS', ids: selectedIds }))}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition font-semibold text-blue-600"
          >
            <span className="flex items-center gap-2">
              <Group className="w-3.5 h-3.5" /> Group Selection
            </span>
            <span className="text-[10px] text-blue-500 font-mono">Ctrl+G</span>
          </button>
        ) : primaryElem?.groupId ? (
          <button
            onClick={() => handleAction(() => dispatch({ type: 'UNGROUP', groupId: primaryElem.groupId! }))}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition font-semibold text-amber-600"
          >
            <span className="flex items-center gap-2">
              <Ungroup className="w-3.5 h-3.5" /> Ungroup
            </span>
            <span className="text-[10px] text-amber-500 font-mono">Ctrl+Shift+G</span>
          </button>
        ) : null}

        <button
          onClick={() => handleAction(() => dispatch({ type: 'ALIGN', alignment: 'center', relativeTo: 'canvas' }))}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 transition"
        >
          <AlignCenter className="w-3.5 h-3.5 text-slate-500" /> Center on Canvas
        </button>
      </div>

      {/* Group 4: Visibility, Lock & Delete */}
      <div className="py-1">
        {primaryElem && (
          <>
            <button
              onClick={() => handleAction(() => dispatch({ type: 'UPDATE_ELEMENT', id: primaryElem.id, attrs: { locked: !isLocked } }))}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 transition"
            >
              {isLocked ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isLocked ? 'Unlock Element' : 'Lock Element'}</span>
            </button>
            <button
              onClick={() => handleAction(() => dispatch({ type: 'UPDATE_ELEMENT', id: primaryElem.id, attrs: { visible: !isVisible } }))}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 transition"
            >
              {isVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isVisible ? 'Hide Element' : 'Show Element'}</span>
            </button>
          </>
        )}
        <button
          onClick={() => handleAction(() => deleteSelected())}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-rose-50 text-rose-600 transition font-semibold"
        >
          <span className="flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </span>
          <span className="text-[10px] text-rose-400 font-mono">Del</span>
        </button>
      </div>
    </div>
  );
};
