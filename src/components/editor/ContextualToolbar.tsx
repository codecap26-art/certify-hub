'use client';

import React from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

const FONT_FAMILIES = ['Helvetica', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];

export const ContextualToolbar: React.FC = () => {
  const { state, dispatch, duplicateSelected, deleteSelected } = useEditor();
  const { elements } = state.document;
  const { selectedIds } = state.selection;

  if (selectedIds.length === 0) return null;

  const isMulti = selectedIds.length > 1;
  const primaryElement = elements.find((e) => e.id === selectedIds[selectedIds.length - 1]);
  if (!primaryElement) return null;

  const isText = primaryElement.type === 'text' || primaryElement.type === 'dynamic-text';
  const isShape = primaryElement.type === 'shape';

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-lg px-2 py-1 flex items-center gap-1.5 z-40 text-xs select-none">
      {/* Multi-selection controls */}
      {isMulti ? (
        <>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {selectedIds.length} items
          </span>

          <div className="h-4 w-px bg-slate-200" />

          {/* Alignment buttons */}
          <button
            onClick={() => dispatch({ type: 'ALIGN', alignment: 'left' })}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
            title="Align Left"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'ALIGN', alignment: 'center' })}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
            title="Align Center"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'ALIGN', alignment: 'right' })}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
            title="Align Right"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'ALIGN', alignment: 'top' })}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
            title="Align Top"
          >
            <AlignStartHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'ALIGN', alignment: 'middle' })}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
            title="Align Middle"
          >
            <AlignCenterHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'ALIGN', alignment: 'bottom' })}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
            title="Align Bottom"
          >
            <AlignEndHorizontal className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <button
            onClick={() => dispatch({ type: 'GROUP_ELEMENTS', ids: selectedIds })}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px]"
          >
            Group
          </button>
        </>
      ) : (
        <>
          {/* Single element text controls */}
          {isText && primaryElement.textStyle && (
            <>
              <select
                value={primaryElement.textStyle.fontFamily}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { textStyle: { ...primaryElement.textStyle!, fontFamily: e.target.value } },
                    label: 'Change font family',
                  })
                }
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={8}
                max={120}
                value={primaryElement.textStyle.fontSize}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { textStyle: { ...primaryElement.textStyle!, fontSize: parseInt(e.target.value, 10) || 12 } },
                    label: 'Change font size',
                  })
                }
                className="w-12 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-xs text-slate-800 font-mono text-center"
              />

              <button
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: {
                      textStyle: {
                        ...primaryElement.textStyle!,
                        fontWeight: primaryElement.textStyle!.fontWeight === 'bold' ? 'normal' : 'bold',
                      },
                    },
                    label: 'Toggle bold',
                  })
                }
                className={`p-1 rounded ${
                  primaryElement.textStyle.fontWeight === 'bold' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'
                }`}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: {
                      textStyle: {
                        ...primaryElement.textStyle!,
                        fontStyle: primaryElement.textStyle!.fontStyle === 'italic' ? 'normal' : 'italic',
                      },
                    },
                    label: 'Toggle italic',
                  })
                }
                className={`p-1 rounded ${
                  primaryElement.textStyle.fontStyle === 'italic' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                }`}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <input
                type="color"
                value={primaryElement.textStyle.fill}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { textStyle: { ...primaryElement.textStyle!, fill: e.target.value } },
                    label: 'Change text color',
                  })
                }
                className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                title="Text Color"
              />

              <div className="h-4 w-px bg-slate-200" />
            </>
          )}

          {/* Shape fill control */}
          {isShape && primaryElement.shapeStyle && (
            <>
              <input
                type="color"
                value={primaryElement.shapeStyle.fill === 'transparent' ? '#FFFFFF' : primaryElement.shapeStyle.fill}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { shapeStyle: { ...primaryElement.shapeStyle!, fill: e.target.value } },
                    label: 'Change fill color',
                  })
                }
                className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                title="Fill Color"
              />
              <div className="h-4 w-px bg-slate-200" />
            </>
          )}
        </>
      )}

      {/* Common actions */}
      <button
        onClick={() =>
          dispatch({
            type: 'UPDATE_ELEMENT',
            id: primaryElement.id,
            attrs: { locked: !primaryElement.locked },
            label: primaryElement.locked ? 'Unlock element' : 'Lock element',
          })
        }
        className="p-1 hover:bg-slate-100 rounded text-slate-600"
        title={primaryElement.locked ? 'Unlock' : 'Lock'}
      >
        {primaryElement.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>

      <button
        onClick={() => duplicateSelected()}
        className="p-1 hover:bg-slate-100 rounded text-slate-600"
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => deleteSelected()}
        className="p-1 hover:bg-rose-50 rounded text-rose-600"
        title="Delete (Delete)"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
