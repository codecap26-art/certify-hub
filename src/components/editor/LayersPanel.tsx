'use client';

import React from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
} from 'lucide-react';
import { TemplateElement } from '@/types/template';

interface Props {
  elements: TemplateElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onToggleLock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const LayersPanel: React.FC<Props> = ({
  elements,
  selectedId,
  onSelect,
  onReorder,
  onToggleLock,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}) => {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="w-56 bg-white border-l border-slate-200 flex flex-col text-slate-800 text-xs shadow-xs z-20">
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between font-bold text-slate-900">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Canvas Layers</span>
        </div>
        <span className="text-[10px] font-normal text-slate-500">{elements.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.map((elem, idx) => {
          const isSelected = elem.id === selectedId;
          return (
            <div
              key={elem.id}
              onClick={() => onSelect(elem.id)}
              className={`p-2 rounded-lg border flex items-center justify-between transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 font-semibold text-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 truncate max-w-[110px]">
                <span className="text-[10px] font-mono text-slate-400">#{sorted.length - idx}</span>
                <span className="truncate">{elem.name || elem.type}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(elem.id, 'up');
                  }}
                  disabled={idx === 0}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  title="Bring Forward"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(elem.id, 'down');
                  }}
                  disabled={idx === sorted.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  title="Send Backward"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(elem.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  {elem.visible ? <Eye className="w-3 h-3 text-slate-600" /> : <EyeOff className="w-3 h-3 text-rose-500" />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLock(elem.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  {elem.locked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
