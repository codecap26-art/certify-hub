'use client';

import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { DYNAMIC_BINDING_OPTIONS, DynamicBindingKey } from '@/lib/editor/documentModel';

const FONT_FAMILIES = [
  'Helvetica',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
];

export const PropertiesPanel: React.FC = () => {
  const { state, dispatch, duplicateSelected, deleteSelected } = useEditor();
  const { elements } = state.document;
  const { selectedIds } = state.selection;

  const selectedElement = elements.find((e) => e.id === selectedIds[selectedIds.length - 1]) || null;

  if (!selectedElement) {
    return (
      <aside className="w-64 bg-white border-l border-slate-200 p-4 text-xs text-slate-500 flex flex-col items-center justify-center text-center space-y-2 z-20 shrink-0 select-none">
        <p className="font-semibold text-slate-700">No Element Selected</p>
        <p className="text-[11px] leading-relaxed">
          Click any element on the canvas to inspect and modify font formatting, colors, alignment, and dynamic bindings.
        </p>
      </aside>
    );
  }

  const { id, type, x, y, width, height, rotation, opacity, textStyle, shapeStyle, qrStyle } = selectedElement;

  const updateAttrs = (attrs: Partial<typeof selectedElement>, label = 'Update property') => {
    dispatch({ type: 'UPDATE_ELEMENT', id, attrs, label });
  };

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col text-slate-800 shadow-xs z-20 overflow-y-auto shrink-0 select-none">
      {/* Header with Quick Actions */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <span className="font-bold text-xs text-slate-900 truncate max-w-[120px]">
          {selectedElement.name || selectedElement.type}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => updateAttrs({ visible: !selectedElement.visible })}
            className="p-1.5 rounded hover:bg-white text-slate-600 transition"
            title={selectedElement.visible ? 'Hide Element' : 'Show Element'}
          >
            {selectedElement.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
          </button>

          <button
            onClick={() => updateAttrs({ locked: !selectedElement.locked })}
            className="p-1.5 rounded hover:bg-white text-slate-600 transition"
            title={selectedElement.locked ? 'Unlock Element' : 'Lock Element'}
          >
            {selectedElement.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => duplicateSelected()}
            className="p-1.5 rounded hover:bg-white text-slate-600 transition"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => deleteSelected()}
            className="p-1.5 rounded hover:bg-rose-50 text-rose-600 transition"
            title="Delete (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Dynamic Binding Selector for Text */}
        {(type === 'text' || type === 'dynamic-text') && (
          <div className="space-y-2 bg-blue-50 border border-blue-200 p-3 rounded-xl">
            <label className="block text-[11px] font-bold text-blue-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Dynamic Field Binding</span>
            </label>
            <select
              value={selectedElement.dynamicBinding || ''}
              onChange={(e) => {
                const bindingKey = (e.target.value as DynamicBindingKey) || undefined;
                updateAttrs(
                  {
                    type: bindingKey ? 'dynamic-text' : 'text',
                    dynamicBinding: bindingKey,
                  },
                  'Change field binding',
                );
              }}
              className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Static Text (No Dynamic Binding)</option>
              {DYNAMIC_BINDING_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.key})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Text Properties */}
        {(type === 'text' || type === 'dynamic-text') && textStyle && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Text Content</label>
              <textarea
                rows={2}
                value={selectedElement.textValue || ''}
                onChange={(e) => updateAttrs({ textValue: e.target.value }, 'Edit text content')}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                placeholder="Enter text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Font Family</label>
                <select
                  value={textStyle.fontFamily}
                  onChange={(e) => updateAttrs({ textStyle: { ...textStyle, fontFamily: e.target.value } }, 'Change font')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Font Size (px)</label>
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={textStyle.fontSize}
                  onChange={(e) =>
                    updateAttrs(
                      { textStyle: { ...textStyle, fontSize: parseInt(e.target.value, 10) || 12 } },
                      'Change font size',
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Styling Toggles & Alignment */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() =>
                    updateAttrs({
                      textStyle: {
                        ...textStyle,
                        fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold',
                      },
                    })
                  }
                  className={`p-1.5 rounded transition ${
                    textStyle.fontWeight === 'bold' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600'
                  }`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    updateAttrs({
                      textStyle: {
                        ...textStyle,
                        fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic',
                      },
                    })
                  }
                  className={`p-1.5 rounded transition ${
                    textStyle.fontStyle === 'italic' ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600'
                  }`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                {(['left', 'center', 'right'] as const).map((align) => {
                  const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={align}
                      onClick={() => updateAttrs({ textStyle: { ...textStyle, align } })}
                      className={`p-1.5 rounded transition ${
                        textStyle.align === align ? 'bg-white text-blue-600 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textStyle.fill}
                  onChange={(e) => updateAttrs({ textStyle: { ...textStyle, fill: e.target.value } })}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={textStyle.fill}
                  onChange={(e) => updateAttrs({ textStyle: { ...textStyle, fill: e.target.value } })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Shape Properties */}
        {type === 'shape' && shapeStyle && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fill Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={shapeStyle.fill === 'transparent' ? '#FFFFFF' : shapeStyle.fill}
                  onChange={(e) => updateAttrs({ shapeStyle: { ...shapeStyle, fill: e.target.value } })}
                  className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <button
                  onClick={() => updateAttrs({ shapeStyle: { ...shapeStyle, fill: 'transparent' } })}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Transparent
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Border Color & Width</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="color"
                  value={shapeStyle.stroke === 'transparent' ? '#000000' : shapeStyle.stroke}
                  onChange={(e) => updateAttrs({ shapeStyle: { ...shapeStyle, stroke: e.target.value } })}
                  className="w-full h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={shapeStyle.strokeWidth}
                  onChange={(e) =>
                    updateAttrs({
                      shapeStyle: { ...shapeStyle, strokeWidth: parseInt(e.target.value, 10) || 0 },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* QR Code Properties */}
        {type === 'qr' && qrStyle && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Foreground Color</label>
              <input
                type="color"
                value={qrStyle.fgColor}
                onChange={(e) => updateAttrs({ qrStyle: { ...qrStyle, fgColor: e.target.value } })}
                className="w-full h-8 rounded border border-slate-200 cursor-pointer p-0.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="display-code-lbl"
                checked={qrStyle.displayCodeLabel}
                onChange={(e) => updateAttrs({ qrStyle: { ...qrStyle, displayCodeLabel: e.target.checked } })}
                className="rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="display-code-lbl" className="font-semibold text-slate-700">
                Display Code Label Below QR
              </label>
            </div>
          </div>
        )}

        {/* Common Geometry & Opacity */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <h4 className="font-bold text-slate-800 text-xs">Transform & Position</h4>

          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">X Position</label>
              <input
                type="number"
                value={Math.round(x)}
                onChange={(e) => updateAttrs({ x: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Y Position</label>
              <input
                type="number"
                value={Math.round(y)}
                onChange={(e) => updateAttrs({ y: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Width</label>
              <input
                type="number"
                value={Math.round(width)}
                onChange={(e) => updateAttrs({ width: parseInt(e.target.value, 10) || 10 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase">Height</label>
              <input
                type="number"
                value={Math.round(height)}
                onChange={(e) => updateAttrs({ height: parseInt(e.target.value, 10) || 10 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Opacity ({Math.round(opacity * 100)}%)
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => updateAttrs({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
