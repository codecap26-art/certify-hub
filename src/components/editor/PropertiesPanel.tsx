'use client';

import React, { useMemo, useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Link as LinkIcon,
  Unlink,
  Layers,
  Palette,
  Sliders,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { DYNAMIC_BINDING_OPTIONS, ImageMaskVariant } from '@/lib/editor/documentModel';
import { FontPicker } from './FontPicker';

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch, duplicateSelected, deleteSelected } = useEditor();
  const { elements } = state.document;
  const { selectedIds } = state.selection;

  const [replaceColorTarget, setReplaceColorTarget] = useState<string | null>(null);
  const [replaceColorNew, setReplaceColorNew] = useState<string>('#2563EB');

  const selectedElement = elements.find((e) => e.id === selectedIds[selectedIds.length - 1]) || null;

  // Auto-extract all colors used across the certificate document
  const documentColors = useMemo(() => {
    const set = new Set<string>();
    if (state.document.backgroundColor && state.document.backgroundColor !== 'transparent') {
      set.add(state.document.backgroundColor);
    }
    for (const el of elements) {
      if (el.textStyle?.fill && el.textStyle.fill !== 'transparent') set.add(el.textStyle.fill);
      if (el.shapeStyle?.fill && el.shapeStyle.fill !== 'transparent') set.add(el.shapeStyle.fill);
      if (el.shapeStyle?.stroke && el.shapeStyle.stroke !== 'transparent') set.add(el.shapeStyle.stroke);
      if (el.borderStyle?.color && el.borderStyle.color !== 'transparent') set.add(el.borderStyle.color);
    }
    return Array.from(set);
  }, [elements, state.document.backgroundColor]);

  if (!selectedElement) {
    return (
      <aside className="w-72 bg-white border-l border-slate-200 p-6 text-xs text-slate-500 flex flex-col items-center justify-center text-center space-y-3 z-20 shrink-0 select-none">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
          <Layers className="w-6 h-6" />
        </div>
        <p className="font-bold text-slate-800 text-sm">No Element Selected</p>
        <p className="text-xs leading-relaxed text-slate-500 max-w-[200px]">
          Click any text, shape, image, or border on the canvas to inspect and edit its properties.
        </p>
      </aside>
    );
  }

  const { id, type, x, y, width, height, rotation, opacity, textStyle, shapeStyle, imageStyle, qrStyle, borderStyle, aspectRatioLocked } = selectedElement;

  const updateAttrs = (attrs: Partial<typeof selectedElement>, label = 'Update property') => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs, label });
  };

  // Combine built-in dynamic bindings with user-created custom fields
  const allDynamicOptions = [
    ...DYNAMIC_BINDING_OPTIONS,
    ...(state.document.customFields || []).map((f) => ({
      key: f.key,
      label: f.label,
      category: 'Custom' as const,
      sampleValue: f.sampleValue,
    })),
  ];

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col text-slate-800 shadow-xs z-20 overflow-y-auto shrink-0 select-none">
      {/* Header with Quick Actions */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-30">
        <span className="font-bold text-xs text-slate-900 truncate max-w-[130px]">
          {selectedElement.name || selectedElement.type}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => updateAttrs({ visible: !selectedElement.visible })}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
            title={selectedElement.visible ? 'Hide Element' : 'Show Element'}
          >
            {selectedElement.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
          </button>

          <button
            onClick={() => updateAttrs({ locked: !selectedElement.locked })}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
            title={selectedElement.locked ? 'Unlock Element' : 'Lock Element'}
          >
            {selectedElement.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => duplicateSelected()}
            className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => deleteSelected()}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition"
            title="Delete (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* ── 1. DYNAMIC FIELD BINDING ── */}
        {(type === 'text' || type === 'dynamic-text') && (
          <div className="space-y-2 bg-blue-50/70 border border-blue-200 p-3 rounded-2xl">
            <label className="block text-[11px] font-bold text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Dynamic Field Binding</span>
              </span>
            </label>
            <select
              value={selectedElement.dynamicBinding || ''}
              onChange={(e) => {
                const bindingKey = e.target.value || undefined;
                updateAttrs(
                  {
                    type: bindingKey ? 'dynamic-text' : 'text',
                    dynamicBinding: bindingKey,
                  },
                  'Change field binding',
                );
              }}
              className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="">Static Text (No Dynamic Binding)</option>
              {allDynamicOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.key})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── 2. TEXT CONTENT & AUTO-FIT ── */}
        {(type === 'text' || type === 'dynamic-text') && textStyle && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1 mb-2">
                Text Content
              </h4>
              <textarea
                rows={2}
                value={selectedElement.textValue || ''}
                onChange={(e) => updateAttrs({ textValue: e.target.value }, 'Edit text content')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                placeholder="Enter text..."
              />
            </div>

            {/* Auto-Fit Range Configuration */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Auto-Fit Text
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(textStyle.autoFit)}
                  onChange={(e) =>
                    updateAttrs(
                      { textStyle: { ...textStyle, autoFit: e.target.checked } },
                      'Toggle auto-fit',
                    )
                  }
                  className="rounded text-amber-600 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-amber-800 leading-tight">
                Automatically reduces font size to fit long participant names without overflowing.
              </p>

              {textStyle.autoFit && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600">Min Size</label>
                    <input
                      type="number"
                      min={8}
                      max={40}
                      value={textStyle.minFontSize || 14}
                      onChange={(e) =>
                        updateAttrs(
                          { textStyle: { ...textStyle, minFontSize: Number(e.target.value) || 12 } },
                          'Set min font size',
                        )
                      }
                      className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600">Max Size</label>
                    <input
                      type="number"
                      min={16}
                      max={120}
                      value={textStyle.maxFontSize || 48}
                      onChange={(e) =>
                        updateAttrs(
                          { textStyle: { ...textStyle, maxFontSize: Number(e.target.value) || 48 } },
                          'Set max font size',
                        )
                      }
                      className="w-full bg-white border border-amber-200 rounded-lg px-2 py-1 text-xs text-center font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Typography Formatting */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
              <h4 className="font-bold text-slate-900 text-xs">Typography</h4>

              {/* Font Family */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Font Family</label>
                <FontPicker
                  value={textStyle.fontFamily}
                  onChange={(fontFamily) =>
                    updateAttrs({ textStyle: { ...textStyle, fontFamily } }, 'Change font family')
                  }
                />
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Font Size</label>
                  <input
                    type="number"
                    min={8}
                    max={140}
                    value={textStyle.fontSize}
                    onChange={(e) =>
                      updateAttrs({ textStyle: { ...textStyle, fontSize: Number(e.target.value) || 16 } }, 'Change font size')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-center font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Weight</label>
                  <select
                    value={textStyle.fontWeight}
                    onChange={(e) =>
                      updateAttrs({ textStyle: { ...textStyle, fontWeight: e.target.value } }, 'Change font weight')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                  >
                    <option value="normal">Regular</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi Bold</option>
                    <option value="bold">Bold</option>
                    <option value="800">Extra Bold</option>
                  </select>
                </div>
              </div>

              {/* Letter Spacing & Line Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Letter Spacing</label>
                  <input
                    type="number"
                    step="0.5"
                    value={textStyle.letterSpacing || 0}
                    onChange={(e) =>
                      updateAttrs({ textStyle: { ...textStyle, letterSpacing: Number(e.target.value) || 0 } }, 'Change letter spacing')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Line Height</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.8}
                    max={3}
                    value={textStyle.lineHeight || 1.2}
                    onChange={(e) =>
                      updateAttrs({ textStyle: { ...textStyle, lineHeight: Number(e.target.value) || 1.2 } }, 'Change line height')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center font-mono"
                  />
                </div>
              </div>

              {/* Text Transform & Decorations */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transform</label>
                  <select
                    value={textStyle.textTransform || 'none'}
                    onChange={(e) =>
                      updateAttrs({ textStyle: { ...textStyle, textTransform: e.target.value as any } }, 'Change text transform')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                  >
                    <option value="none">As Typed</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize Words</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Decoration</label>
                  <select
                    value={textStyle.textDecoration || 'none'}
                    onChange={(e) =>
                      updateAttrs({ textStyle: { ...textStyle, textDecoration: e.target.value as any } }, 'Change text decoration')
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800"
                  >
                    <option value="none">None</option>
                    <option value="underline">Underline</option>
                    <option value="line-through">Strikethrough</option>
                  </select>
                </div>
              </div>

              {/* Text Shadow & Outline */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <span className="font-bold text-slate-800 text-[11px] block">Text Effects</span>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">Shadow Blur</span>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={textStyle.shadowBlur || 0}
                    onChange={(e) =>
                      updateAttrs({ textStyle: { ...textStyle, shadowBlur: Number(e.target.value), shadowColor: 'rgba(0,0,0,0.3)' } })
                    }
                    className="w-28"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. IMAGE & MASKS ── */}
        {type === 'image' && imageStyle && (
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <h4 className="font-bold text-slate-900 text-xs">Image Frames & Masks</h4>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mask Shape</label>
              <select
                value={imageStyle.maskShape || 'none'}
                onChange={(e) =>
                  updateAttrs({ imageStyle: { ...imageStyle, maskShape: e.target.value as ImageMaskVariant } }, 'Change image mask')
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="none">Original (No Mask)</option>
                <option value="circle">Circle Mask</option>
                <option value="rounded">Rounded Corner Frame</option>
                <option value="hexagon">Hexagon Frame</option>
                <option value="badge">Badge Frame (12 Points)</option>
              </select>
            </div>
          </div>
        )}

        {/* ── 4. SHAPE STYLING ── */}
        {type === 'shape' && shapeStyle && (
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <h4 className="font-bold text-slate-900 text-xs">Shape Appearance</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fill Color</label>
                <input
                  type="color"
                  value={shapeStyle.fill === 'transparent' ? '#FFFFFF' : shapeStyle.fill || '#1E40AF'}
                  onChange={(e) =>
                    updateAttrs({ shapeStyle: { ...shapeStyle, fill: e.target.value } }, 'Change shape fill')
                  }
                  className="w-full h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Stroke Color</label>
                <input
                  type="color"
                  value={shapeStyle.stroke === 'transparent' ? '#FFFFFF' : shapeStyle.stroke || '#1E3A8A'}
                  onChange={(e) =>
                    updateAttrs({ shapeStyle: { ...shapeStyle, stroke: e.target.value } }, 'Change shape stroke')
                  }
                  className="w-full h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Stroke Width</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={shapeStyle.strokeWidth || 0}
                  onChange={(e) =>
                    updateAttrs({ shapeStyle: { ...shapeStyle, strokeWidth: Number(e.target.value) || 0 } }, 'Change stroke width')
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Corner Radius</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={shapeStyle.cornerRadius || 0}
                  onChange={(e) =>
                    updateAttrs({ shapeStyle: { ...shapeStyle, cornerRadius: Number(e.target.value) || 0 } }, 'Change corner radius')
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 5. BORDER BUILDER ── */}
        {type === 'border' && borderStyle && (
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <h4 className="font-bold text-slate-900 text-xs">Certificate Border</h4>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Border Style</label>
              <select
                value={borderStyle.borderType}
                onChange={(e) =>
                  updateAttrs({ borderStyle: { ...borderStyle, borderType: e.target.value as any } }, 'Change border type')
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="solid">Single Solid</option>
                <option value="double">Double Inset Border</option>
                <option value="dashed">Dashed Modern</option>
                <option value="dotted">Dotted Academic</option>
                <option value="ornate">Ornate Luxury</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Color</label>
                <input
                  type="color"
                  value={borderStyle.color}
                  onChange={(e) =>
                    updateAttrs({ borderStyle: { ...borderStyle, color: e.target.value } }, 'Change border color')
                  }
                  className="w-full h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Thickness (px)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={borderStyle.width}
                  onChange={(e) =>
                    updateAttrs({ borderStyle: { ...borderStyle, width: Number(e.target.value) || 2 } }, 'Change border width')
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-center font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 6. POSITION & PRECISION NUMERIC COORDINATES ── */}
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs">Position & Dimensions</h4>
            <button
              onClick={() => updateAttrs({ aspectRatioLocked: !aspectRatioLocked }, 'Toggle aspect ratio lock')}
              className={`p-1 rounded-md text-[10px] flex items-center gap-1 border transition ${
                aspectRatioLocked ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title={aspectRatioLocked ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
            >
              {aspectRatioLocked ? <LinkIcon className="w-3 h-3 text-blue-600" /> : <Unlink className="w-3 h-3" />}
              <span>{aspectRatioLocked ? 'Locked' : 'Free'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono">
            <div>
              <label className="block text-[10px] font-sans font-semibold text-slate-500 mb-1">X (px)</label>
              <input
                type="number"
                value={x}
                onChange={(e) => updateAttrs({ x: Number(e.target.value) || 0 }, 'Change X coordinate')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-center font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold text-slate-500 mb-1">Y (px)</label>
              <input
                type="number"
                value={y}
                onChange={(e) => updateAttrs({ y: Number(e.target.value) || 0 }, 'Change Y coordinate')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-center font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold text-slate-500 mb-1">Width (W)</label>
              <input
                type="number"
                min={5}
                value={width}
                onChange={(e) => {
                  const newW = Number(e.target.value) || 10;
                  const ratio = width > 0 ? height / width : 1;
                  updateAttrs({
                    width: newW,
                    height: aspectRatioLocked ? Math.round(newW * ratio) : height,
                  }, 'Resize width');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-center font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold text-slate-500 mb-1">Height (H)</label>
              <input
                type="number"
                min={5}
                value={height}
                onChange={(e) => {
                  const newH = Number(e.target.value) || 10;
                  const ratio = height > 0 ? width / height : 1;
                  updateAttrs({
                    height: newH,
                    width: aspectRatioLocked ? Math.round(newH * ratio) : width,
                  }, 'Resize height');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-center font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold text-slate-500 mb-1">Rotation (°)</label>
              <input
                type="number"
                value={rotation}
                onChange={(e) => updateAttrs({ rotation: Number(e.target.value) || 0 }, 'Change rotation')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-center font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold text-slate-500 mb-1">Opacity (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={Math.round(opacity * 100)}
                onChange={(e) => updateAttrs({ opacity: (Number(e.target.value) || 100) / 100 }, 'Change opacity')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-center font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* ── 7. DOCUMENT PALETTE & GLOBAL COLOR REPLACE ── */}
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>Document Colors</span>
            </h4>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {documentColors.map((color) => (
              <button
                key={color}
                onClick={() => setReplaceColorTarget(color)}
                className={`w-6 h-6 rounded-full border border-slate-300 shadow-xs transition transform hover:scale-110 ${
                  replaceColorTarget === color ? 'ring-2 ring-blue-600 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                title={`Click to replace ${color} across entire certificate`}
              />
            ))}
          </div>

          {/* Color Replacer Dialog */}
          {replaceColorTarget && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <p className="text-[11px] font-semibold text-slate-700">
                Replace <span className="font-mono">{replaceColorTarget}</span> throughout certificate:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={replaceColorNew}
                  onChange={(e) => setReplaceColorNew(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <button
                  onClick={() => {
                    dispatch({
                      type: 'REPLACE_COLOR_GLOBAL',
                      targetColor: replaceColorTarget,
                      replacementColor: replaceColorNew,
                    });
                    setReplaceColorTarget(null);
                  }}
                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace All</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
