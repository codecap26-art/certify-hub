'use client';

import React from 'react';
import { Layers, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff, Trash2, Copy } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

export const LayersPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { elements } = state.document;
  const { selectedIds } = state.selection;

  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Layers
        </h3>
        <span className="text-[10px] text-slate-400 font-medium">{elements.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.map((elem, idx) => {
          const isSelected = selectedIds.includes(elem.id);
          return (
            <div
              key={elem.id}
              onClick={() => dispatch({ type: 'SELECT', id: elem.id })}
              className={`p-2 rounded-lg border flex items-center justify-between transition cursor-pointer text-xs ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 font-semibold text-slate-900 shadow-2xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 max-w-[120px]">
                <span className="text-[9px] font-mono text-slate-400">#{sorted.length - idx}</span>
                <span className="truncate">{elem.name || elem.type}</span>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'REORDER_LAYER', id: elem.id, direction: 'up' });
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
                    dispatch({ type: 'REORDER_LAYER', id: elem.id, direction: 'down' });
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
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: elem.id,
                      attrs: { visible: !elem.visible },
                      label: elem.visible ? 'Hide element' : 'Show element',
                    });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title={elem.visible ? 'Hide' : 'Show'}
                >
                  {elem.visible ? <Eye className="w-3 h-3 text-slate-600" /> : <EyeOff className="w-3 h-3 text-rose-500" />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: elem.id,
                      attrs: { locked: !elem.locked },
                      label: elem.locked ? 'Unlock element' : 'Lock element',
                    });
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title={elem.locked ? 'Unlock' : 'Lock'}
                >
                  {elem.locked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>
          );
        })}

        {elements.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-6">No elements on canvas yet.</div>
        )}
      </div>
    </div>
  );
};
