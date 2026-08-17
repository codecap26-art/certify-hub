'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Pencil,
  Check,
  X,
  Type,
  Square,
  Circle,
  Image,
  FileSignature,
  Award,
  QrCode,
  Minus,
  GripVertical,
  Search,
  Group,
  Ungroup,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { DocumentElement } from '@/lib/editor/documentModel';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getElementIcon(elem: DocumentElement): React.ReactNode {
  switch (elem.type) {
    case 'text':
    case 'dynamic-text':
    case 'certificate-code':
      return <Type className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    case 'shape':
      switch (elem.shapeStyle?.shapeType) {
        case 'circle':
        case 'ellipse':
          return <Circle className="w-3.5 h-3.5 text-violet-500 shrink-0" />;
        case 'line':
        case 'arrow':
          return <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
        default:
          return <Square className="w-3.5 h-3.5 text-violet-500 shrink-0" />;
      }
    case 'image':
      return <Image className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    case 'logo':
      return <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    case 'signature':
      return <FileSignature className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    case 'qr':
      return <QrCode className="w-3.5 h-3.5 text-teal-500 shrink-0" />;
    case 'border':
      return <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    default:
      return <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  }
}

// ---------------------------------------------------------------------------
// Layer Row
// ---------------------------------------------------------------------------
interface LayerRowProps {
  elem: DocumentElement;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  index: number;
  totalCount: number;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent, id: string, fromIndex: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, toIndex: number) => void;
  onDragEnd: () => void;
  isDragTarget: boolean;
}

const LayerRow: React.FC<LayerRowProps> = ({
  elem,
  isSelected,
  index,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragTarget,
}) => {
  const { dispatch } = useEditor();
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(elem.name || elem.type);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameValue(elem.name || elem.type);
  }, [elem.name, elem.type]);

  const commitRename = useCallback(() => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== elem.name) {
      dispatch({ type: 'RENAME_ELEMENT', id: elem.id, name: trimmed });
    }
    setRenaming(false);
  }, [nameValue, elem.name, elem.id, dispatch]);

  const cancelRename = useCallback(() => {
    setNameValue(elem.name || elem.type);
    setRenaming(false);
  }, [elem.name, elem.type]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, elem.id, index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(e, index); }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition cursor-pointer select-none text-xs group ${
        isSelected
          ? 'bg-blue-50 border-blue-300 shadow-xs text-blue-900'
          : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700'
      } ${isDragTarget ? 'border-t-2 border-t-blue-500' : ''} ${!elem.visible ? 'opacity-50' : ''}`}
    >
      {/* Drag handle */}
      <div
        className="cursor-grab text-slate-300 hover:text-slate-500 shrink-0"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Icon */}
      {getElementIcon(elem)}

      {/* Name / Rename Input */}
      <div className="flex-1 min-w-0 flex items-center gap-1">
        {renaming ? (
          <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') cancelRename();
              }}
              className="w-full text-xs font-semibold px-1 py-0.5 border border-blue-400 rounded bg-white text-slate-900 focus:outline-none"
              autoFocus
            />
            <button onClick={commitRename} className="text-emerald-600 hover:text-emerald-700">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={cancelRename} className="text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <span
            className="truncate font-semibold text-xs"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setRenaming(true);
            }}
          >
            {elem.name || elem.type}
          </span>
        )}
      </div>

      {/* Group indicator */}
      {elem.groupId && (
        <span className="text-[9px] font-mono text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
          GRP
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'UPDATE_ELEMENT', id: elem.id, attrs: { visible: !elem.visible } });
          }}
          className="p-1 hover:bg-slate-200 rounded text-slate-500"
          title={elem.visible ? 'Hide' : 'Show'}
        >
          {elem.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-rose-500" />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'UPDATE_ELEMENT', id: elem.id, attrs: { locked: !elem.locked } });
          }}
          className="p-1 hover:bg-slate-200 rounded text-slate-500"
          title={elem.locked ? 'Unlock' : 'Lock'}
        >
          {elem.locked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Layers Panel
// ---------------------------------------------------------------------------
export const LayersPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { elements } = state.document;
  const { selectedIds } = state.selection;
  const [search, setSearch] = useState('');

  // Sorted descending (highest zIndex at top)
  const sorted = useMemo(() => {
    let list = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q));
    }
    return list;
  }, [elements, search]);

  const dragId = useRef<string | null>(null);
  const dragFromIndex = useRef<number | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string, fromIndex: number) => {
    dragId.current = id;
    dragFromIndex.current = fromIndex;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragTargetIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragId.current === null || dragFromIndex.current === null) return;
    if (dragFromIndex.current === toIndex) {
      setDragTargetIndex(null);
      return;
    }

    const totalItems = sorted.length;
    const fromAscending = totalItems - 1 - dragFromIndex.current;
    const toAscending = totalItems - 1 - toIndex;

    dispatch({ type: 'REORDER_LAYER_TO_INDEX', id: dragId.current, toIndex: toAscending });
    dragId.current = null;
    dragFromIndex.current = null;
    setDragTargetIndex(null);
  }, [sorted.length, dispatch]);

  const handleDragEnd = useCallback(() => {
    dragId.current = null;
    dragFromIndex.current = null;
    setDragTargetIndex(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and multi-select actions */}
      <div className="p-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Layers Panel</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">{elements.length} elements</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search layers..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Layer list */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-1"
        onDragOver={(e) => e.preventDefault()}
      >
        {sorted.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-8">
            <Layers className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p>No layers match search.</p>
          </div>
        ) : (
          sorted.map((elem, idx) => (
            <LayerRow
              key={elem.id}
              elem={elem}
              isSelected={selectedIds.includes(elem.id)}
              isFirst={idx === 0}
              isLast={idx === sorted.length - 1}
              index={idx}
              totalCount={sorted.length}
              onSelect={() => dispatch({ type: 'SELECT', id: elem.id })}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragTarget={dragTargetIndex === idx}
            />
          ))
        )}
      </div>

      {/* Footer controls when selection active */}
      {selectedIds.length > 0 && (
        <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 text-[11px]">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-1">
            {selectedIds.length > 1 && (
              <button
                onClick={() => dispatch({ type: 'GROUP_ELEMENTS', ids: selectedIds })}
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
              >
                <Group className="w-3 h-3" /> Group
              </button>
            )}
            <button
              onClick={() => dispatch({ type: 'DELETE_ELEMENTS', ids: selectedIds })}
              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
