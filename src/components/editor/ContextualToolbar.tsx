'use client';

import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
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
  Group,
  Ungroup,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { ImageMaskVariant } from '@/lib/editor/documentModel';
import { FontPicker } from './FontPicker';

export const ContextualToolbar: React.FC = () => {
  const { state, dispatch, duplicateSelected, deleteSelected } = useEditor();
  const { elements } = state.document;
  const { selectedIds } = state.selection;
  const [alignRelativeTo, setAlignRelativeTo] = useState<'canvas' | 'selection' | 'safe-area'>('canvas');

  if (selectedIds.length === 0) return null;

  const isMulti = selectedIds.length > 1;
  const primaryElement = elements.find((e) => e.id === selectedIds[selectedIds.length - 1]);
  if (!primaryElement) return null;

  const isText = primaryElement.type === 'text' || primaryElement.type === 'dynamic-text';
  const isShape = primaryElement.type === 'shape';
  const isImage = primaryElement.type === 'image' || primaryElement.type === 'logo';
  const isBorder = primaryElement.type === 'border';

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl px-2.5 py-1.5 flex items-center gap-2 z-40 text-xs select-none max-w-[95vw] overflow-x-auto">
      {/* ── Multi-selection controls ── */}
      {isMulti ? (
        <>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-xl border border-blue-200 text-[11px] shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>{selectedIds.length} elements selected</span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Align Reference Selector */}
          <select
            value={alignRelativeTo}
            onChange={(e) => setAlignRelativeTo(e.target.value as 'canvas' | 'selection' | 'safe-area')}
            className="text-[10px] font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            title="Alignment Target"
          >
            <option value="selection">Align to Selection</option>
            <option value="canvas">Align to Canvas</option>
            <option value="safe-area">Align to Safe Area</option>
          </select>

          {/* Alignment buttons */}
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => dispatch({ type: 'ALIGN', alignment: 'left', relativeTo: alignRelativeTo })}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Align Left"
            >
              <AlignStartVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'ALIGN', alignment: 'center', relativeTo: alignRelativeTo })}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Align Center"
            >
              <AlignCenterVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'ALIGN', alignment: 'right', relativeTo: alignRelativeTo })}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Align Right"
            >
              <AlignEndVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'ALIGN', alignment: 'top', relativeTo: alignRelativeTo })}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Align Top"
            >
              <AlignStartHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'ALIGN', alignment: 'middle', relativeTo: alignRelativeTo })}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Align Middle"
            >
              <AlignCenterHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dispatch({ type: 'ALIGN', alignment: 'bottom', relativeTo: alignRelativeTo })}
              className="p-1 hover:bg-white rounded text-slate-600 transition"
              title="Align Bottom"
            >
              <AlignEndHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Distribute buttons if >= 3 elements */}
          {selectedIds.length >= 3 && (
            <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => dispatch({ type: 'DISTRIBUTE', direction: 'horizontal' })}
                className="p-1 hover:bg-white rounded text-slate-600 transition"
                title="Distribute Horizontally"
              >
                <AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => dispatch({ type: 'DISTRIBUTE', direction: 'vertical' })}
                className="p-1 hover:bg-white rounded text-slate-600 transition"
                title="Distribute Vertically"
              >
                <AlignVerticalDistributeCenter className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-slate-200" />

          {/* Group */}
          <button
            onClick={() => dispatch({ type: 'GROUP_ELEMENTS', ids: selectedIds })}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition"
          >
            <Group className="w-3.5 h-3.5" />
            <span>Group</span>
          </button>
        </>
      ) : (
        <>
          {/* ── Single text controls ── */}
          {isText && primaryElement.textStyle && (
            <>
              <FontPicker
                value={primaryElement.textStyle.fontFamily}
                onChange={(fontFamily) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { textStyle: { ...primaryElement.textStyle!, fontFamily } },
                    label: 'Change font',
                  })
                }
              />

              {/* Font Size Input */}
              <input
                type="number"
                min={8}
                max={120}
                value={primaryElement.textStyle.fontSize}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { textStyle: { ...primaryElement.textStyle!, fontSize: Number(e.target.value) || 16 } },
                    label: 'Change font size',
                  })
                }
                className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-slate-800"
                title="Font Size (px)"
              />

              {/* Bold / Italic / Underline */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => {
                    const isBold = primaryElement.textStyle?.fontWeight === 'bold' || primaryElement.textStyle?.fontWeight === '700';
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { textStyle: { ...primaryElement.textStyle!, fontWeight: isBold ? 'normal' : 'bold' } },
                      label: 'Toggle bold',
                    });
                  }}
                  className={`p-1 rounded ${
                    primaryElement.textStyle.fontWeight === 'bold' || primaryElement.textStyle.fontWeight === '700'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    const isItalic = primaryElement.textStyle?.fontStyle === 'italic';
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { textStyle: { ...primaryElement.textStyle!, fontStyle: isItalic ? 'normal' : 'italic' } },
                      label: 'Toggle italic',
                    });
                  }}
                  className={`p-1 rounded ${
                    primaryElement.textStyle.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    const isUnderline = primaryElement.textStyle?.textDecoration === 'underline';
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { textStyle: { ...primaryElement.textStyle!, textDecoration: isUnderline ? 'none' : 'underline' } },
                      label: 'Toggle underline',
                    });
                  }}
                  className={`p-1 rounded ${
                    primaryElement.textStyle.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Align */}
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_ELEMENT',
                        id: primaryElement.id,
                        attrs: { textStyle: { ...primaryElement.textStyle!, align } },
                        label: `Align ${align}`,
                      })
                    }
                    className={`p-1 rounded ${
                      primaryElement.textStyle?.align === align ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'
                    }`}
                    title={`Align ${align}`}
                  >
                    {align === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : align === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              {/* Text Color Picker */}
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={primaryElement.textStyle.fill || '#0F172A'}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { textStyle: { ...primaryElement.textStyle!, fill: e.target.value } },
                      label: 'Change text color',
                    })
                  }
                  className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                  title="Text Color"
                />
              </div>

              {/* Auto-Fit Toggle */}
              <button
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { textStyle: { ...primaryElement.textStyle!, autoFit: !primaryElement.textStyle?.autoFit } },
                    label: 'Toggle auto-fit',
                  })
                }
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] border transition ${
                  primaryElement.textStyle.autoFit
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'
                }`}
                title="Auto-Fit balances long participant names automatically"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Auto-Fit</span>
              </button>
            </>
          )}

          {/* ── Single shape controls ── */}
          {isShape && primaryElement.shapeStyle && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Fill:</span>
                <input
                  type="color"
                  value={primaryElement.shapeStyle.fill === 'transparent' ? '#FFFFFF' : primaryElement.shapeStyle.fill || '#1E40AF'}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { shapeStyle: { ...primaryElement.shapeStyle!, fill: e.target.value } },
                      label: 'Change shape fill',
                    })
                  }
                  className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white"
                  title="Shape Fill"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Stroke:</span>
                <input
                  type="color"
                  value={primaryElement.shapeStyle.stroke === 'transparent' ? '#FFFFFF' : primaryElement.shapeStyle.stroke || '#1E3A8A'}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { shapeStyle: { ...primaryElement.shapeStyle!, stroke: e.target.value } },
                      label: 'Change shape stroke',
                    })
                  }
                  className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white"
                  title="Shape Stroke Color"
                />
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={primaryElement.shapeStyle.strokeWidth || 1}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { shapeStyle: { ...primaryElement.shapeStyle!, strokeWidth: Number(e.target.value) || 0 } },
                      label: 'Change stroke width',
                    })
                  }
                  className="w-12 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-center font-mono"
                  title="Stroke Width"
                />
              </div>
            </>
          )}

          {/* ── Single image controls ── */}
          {isImage && primaryElement.imageStyle && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">Mask:</span>
                <select
                  value={primaryElement.imageStyle.maskShape || 'none'}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_ELEMENT',
                      id: primaryElement.id,
                      attrs: { imageStyle: { ...primaryElement.imageStyle!, maskShape: e.target.value as ImageMaskVariant } },
                      label: 'Change image mask',
                    })
                  }
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="none">Original (No Mask)</option>
                  <option value="circle">Circle Mask</option>
                  <option value="rounded">Rounded Frame</option>
                  <option value="hexagon">Hexagon Frame</option>
                  <option value="badge">Badge Frame</option>
                </select>
              </div>

              <button
                onClick={() =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { imageStyle: { ...primaryElement.imageStyle!, flipH: !primaryElement.imageStyle?.flipH } },
                    label: 'Flip horizontal',
                  })
                }
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                  primaryElement.imageStyle.flipH ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Flip H
              </button>
            </>
          )}

          {/* ── Single border controls ── */}
          {isBorder && primaryElement.borderStyle && (
            <>
              <select
                value={primaryElement.borderStyle.borderType}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { borderStyle: { ...primaryElement.borderStyle!, borderType: e.target.value as any } },
                    label: 'Change border style',
                  })
                }
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
              >
                <option value="solid">Single Solid</option>
                <option value="double">Double Inset</option>
                <option value="dashed">Dashed Modern</option>
                <option value="dotted">Dotted Certificate</option>
                <option value="ornate">Ornate Luxury</option>
              </select>

              <input
                type="color"
                value={primaryElement.borderStyle.color}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    id: primaryElement.id,
                    attrs: { borderStyle: { ...primaryElement.borderStyle!, color: e.target.value } },
                    label: 'Change border color',
                  })
                }
                className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
            </>
          )}

          {/* Ungroup if grouped */}
          {primaryElement.groupId && (
            <button
              onClick={() => dispatch({ type: 'UNGROUP', groupId: primaryElement.groupId! })}
              className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition"
              title="Ungroup (Ctrl+Shift+G)"
            >
              <Ungroup className="w-3 h-3" />
              <span>Ungroup</span>
            </button>
          )}
        </>
      )}

      <div className="h-4 w-px bg-slate-200 shrink-0" />

      {/* Common Quick Actions: Duplicate, Lock, Delete */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => duplicateSelected()}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {!isMulti && primaryElement && (
          <button
            onClick={() =>
              dispatch({
                type: 'UPDATE_ELEMENT',
                id: primaryElement.id,
                attrs: { locked: !primaryElement.locked },
                label: 'Toggle lock',
              })
            }
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
            title={primaryElement.locked ? 'Unlock' : 'Lock'}
          >
            {primaryElement.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        )}

        <button
          onClick={() => deleteSelected()}
          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition"
          title="Delete (Delete)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
