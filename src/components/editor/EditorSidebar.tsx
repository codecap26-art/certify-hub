'use client';

import React, { useState } from 'react';
import {
  Type,
  Sparkles,
  Square,
  Circle as CircleIcon,
  Minus,
  Image as ImageIcon,
  QrCode,
  Building2,
  FileSignature,
  Upload,
  Layers,
  Palette,
  ShieldAlert,
} from 'lucide-react';
import { ElementType, DynamicBindingKey, DYNAMIC_BINDING_OPTIONS } from '@/types/template';

interface Props {
  onAddText: (text: string, isHeading?: boolean) => void;
  onAddDynamicField: (key: DynamicBindingKey) => void;
  onAddShape: (shapeType: 'rectangle' | 'circle' | 'line', isMask?: boolean) => void;
  onAddImage: (dataUrl: string, name: string) => void;
  onAddQrCode: () => void;
  onSetBackground: (dataUrl: string) => void;
  onSetBackgroundColor: (color: string) => void;
  backgroundColor: string;
}

type TabType = 'text' | 'dynamic' | 'shapes' | 'assets' | 'background';

export const EditorSidebar: React.FC<Props> = ({
  onAddText,
  onAddDynamicField,
  onAddShape,
  onAddImage,
  onAddQrCode,
  onSetBackground,
  onSetBackgroundColor,
  backgroundColor,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dynamic');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isBg = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      if (isBg) {
        onSetBackground(res);
      } else {
        onAddImage(res, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col text-slate-800 shadow-xs z-20">
      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 p-1 text-[11px] font-semibold text-slate-600">
        {[
          { id: 'dynamic', label: 'Dynamic', icon: Sparkles },
          { id: 'text', label: 'Text', icon: Type },
          { id: 'shapes', label: 'Shapes', icon: Square },
          { id: 'assets', label: 'Assets', icon: ImageIcon },
          { id: 'background', label: 'Canvas', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex flex-col items-center py-2 rounded-md transition ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mb-1" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* DYNAMIC FIELDS TAB */}
        {activeTab === 'dynamic' && (
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Dynamic Placeholder Bindings</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Place dynamic fields over the canvas. Values update automatically per recipient.
              </p>
            </div>

            <div className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
              {DYNAMIC_BINDING_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onAddDynamicField(opt.key)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-blue-700">
                      {opt.label}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {opt.category}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">{opt.key}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs">Add Static Text</h3>

            <button
              onClick={() => onAddText('Add a Heading', true)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/50 font-extrabold text-base text-slate-900 transition"
            >
              Add a Heading
            </button>

            <button
              onClick={() => onAddText('Add a Subheading', false)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/50 font-bold text-sm text-slate-800 transition"
            >
              Add a Subheading
            </button>

            <button
              onClick={() => onAddText('Add body text paragraph...', false)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/50 font-normal text-xs text-slate-600 transition"
            >
              Add Body Text
            </button>
          </div>
        )}

        {/* SHAPES & MASKING TAB */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs">Vector Shapes</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddShape('rectangle')}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1.5 hover:bg-slate-100 transition"
                >
                  <Square className="w-5 h-5 text-slate-700" />
                  <span className="text-[11px] font-semibold">Rectangle</span>
                </button>

                <button
                  onClick={() => onAddShape('circle')}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1.5 hover:bg-slate-100 transition"
                >
                  <CircleIcon className="w-5 h-5 text-slate-700" />
                  <span className="text-[11px] font-semibold">Circle</span>
                </button>

                <button
                  onClick={() => onAddShape('line')}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1.5 hover:bg-slate-100 transition col-span-2"
                >
                  <Minus className="w-5 h-5 text-slate-700" />
                  <span className="text-[11px] font-semibold">Divider Line</span>
                </button>
              </div>
            </div>

            {/* Masking Rectangle Tool */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-rose-600">
                <ShieldAlert className="w-4 h-4" />
                <span>Text Masking Tool</span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Add a masking rectangle over imported template images to cover pre-printed sample text.
              </p>
              <button
                onClick={() => onAddShape('rectangle', true)}
                className="w-full p-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5"
              >
                <Square className="w-4 h-4" />
                <span>Add White Masking Box</span>
              </button>
            </div>
          </div>
        )}

        {/* ASSETS & QR TAB */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Branding & QR Elements</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Place dynamic QR verification tokens or branding images.
              </p>
            </div>

            <button
              onClick={onAddQrCode}
              className="w-full p-3 bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 rounded-lg flex items-center justify-center gap-2 font-bold transition text-xs shadow-xs"
            >
              <QrCode className="w-4 h-4 text-teal-600" />
              <span>Add Verification QR Code</span>
            </button>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <label className="block text-xs font-semibold text-slate-700">Upload Custom Image</label>
              <label className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-100 cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Browse PNG / JPG</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleImageFileChange(e, false)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* CANVAS & BACKGROUND TAB */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Canvas Background</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload a blank certificate background or set solid fill.
              </p>
            </div>

            <label className="w-full p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-blue-400 cursor-pointer transition">
              <Upload className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Upload Background Image</span>
              <span className="text-[10px] text-slate-500">PNG, JPG, WebP (A4 Landscape / Portrait)</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => handleImageFileChange(e, true)}
                className="hidden"
              />
            </label>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <label className="block text-xs font-semibold text-slate-700">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => onSetBackgroundColor(e.target.value)}
                  className="w-9 h-9 rounded border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => onSetBackgroundColor(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
