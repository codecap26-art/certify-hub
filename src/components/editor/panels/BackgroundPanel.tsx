'use client';

import React, { useState } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Upload,
  Frame,
  Layers,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { BackgroundGradient, BackgroundPatternType } from '@/lib/editor/documentModel';

export const BackgroundPanel: React.FC = () => {
  const { state, dispatch, addBorder } = useEditor();
  const { document: doc } = state;
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'image' | 'border'>('solid');

  const solidPresets = [
    { name: 'Pure White', color: '#FFFFFF' },
    { name: 'Warm Cream', color: '#FFFDF9' },
    { name: 'Ivory Soft', color: '#FDFBF7' },
    { name: 'Parchment', color: '#FAF7F0' },
    { name: 'Slate Light', color: '#F8FAFC' },
    { name: 'Ice Blue', color: '#F0F9FF' },
    { name: 'Emerald Soft', color: '#F0FDF4' },
    { name: 'Midnight Navy', color: '#0F172A' },
    { name: 'Deep Royal', color: '#1E1B4B' },
  ];

  const gradientPresets: Array<{ name: string; gradient: BackgroundGradient }> = [
    {
      name: 'Luxury Gold & Cream',
      gradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { offset: 0, color: '#FFFDF5' },
          { offset: 0.5, color: '#FEF3C7' },
          { offset: 1, color: '#FFFBEB' },
        ],
      },
    },
    {
      name: 'Executive Midnight',
      gradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { offset: 0, color: '#0F172A' },
          { offset: 1, color: '#1E293B' },
        ],
      },
    },
    {
      name: 'Academic Indigo',
      gradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { offset: 0, color: '#EFF6FF' },
          { offset: 1, color: '#DBEAFE' },
        ],
      },
    },
    {
      name: 'Emerald Corporate',
      gradient: {
        type: 'linear',
        angle: 135,
        stops: [
          { offset: 0, color: '#F0FDF4' },
          { offset: 1, color: '#DCFCE7' },
        ],
      },
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      dispatch({ type: 'SET_BACKGROUND_IMAGE', dataUrl: result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 mb-2">Background & Borders</h3>
        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('solid')}
            className={`py-1 rounded-lg transition ${activeTab === 'solid' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Solid
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`py-1 rounded-lg transition ${activeTab === 'gradient' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Gradient
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`py-1 rounded-lg transition ${activeTab === 'image' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Image
          </button>
          <button
            onClick={() => setActiveTab('border')}
            className={`py-1 rounded-lg transition ${activeTab === 'border' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Borders
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* ── 1. SOLID BACKGROUND ── */}
        {activeTab === 'solid' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Custom Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={doc.backgroundColor || '#FFFFFF'}
                  onChange={(e) => {
                    dispatch({ type: 'SET_BACKGROUND_GRADIENT', gradient: undefined });
                    dispatch({ type: 'SET_BACKGROUND_COLOR', color: e.target.value });
                  }}
                  className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={doc.backgroundColor || '#FFFFFF'}
                  onChange={(e) => {
                    dispatch({ type: 'SET_BACKGROUND_GRADIENT', gradient: undefined });
                    dispatch({ type: 'SET_BACKGROUND_COLOR', color: e.target.value });
                  }}
                  className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Certificate Paper Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {solidPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      dispatch({ type: 'SET_BACKGROUND_GRADIENT', gradient: undefined });
                      dispatch({ type: 'SET_BACKGROUND_COLOR', color: preset.color });
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                      doc.backgroundColor === preset.color && !doc.backgroundGradient
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: preset.color }}
                  >
                    <span
                      className={`text-[10px] font-bold ${
                        preset.color === '#0F172A' || preset.color === '#1E1B4B' ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. GRADIENT BACKGROUND ── */}
        {activeTab === 'gradient' && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Luxury Certificate Gradients
            </span>

            <div className="space-y-2">
              {gradientPresets.map((gp) => (
                <button
                  key={gp.name}
                  onClick={() => dispatch({ type: 'SET_BACKGROUND_GRADIENT', gradient: gp.gradient })}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-400 text-left transition flex items-center justify-between group shadow-xs"
                  style={{
                    background: `linear-gradient(${gp.gradient.angle}deg, ${gp.gradient.stops.map((s) => s.color).join(', ')})`,
                  }}
                >
                  <span className="font-bold text-xs text-slate-800 bg-white/80 px-2 py-0.5 rounded-lg backdrop-blur-xs">
                    {gp.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. IMAGE BACKGROUND ── */}
        {activeTab === 'image' && (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 bg-slate-50 hover:bg-blue-50/30 transition cursor-pointer text-center">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="font-bold text-xs text-slate-800">Upload Background Image</span>
              <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or SVG (Up to 5MB)</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {doc.backgroundDataUrl && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">Image Opacity</span>
                  <span className="font-mono text-[10px] text-slate-500">{Math.round((doc.backgroundOpacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={doc.backgroundOpacity ?? 1}
                  onChange={(e) => dispatch({ type: 'SET_BACKGROUND_OPACITY', opacity: Number(e.target.value) })}
                  className="w-full"
                />
                <button
                  onClick={() => dispatch({ type: 'REMOVE_BACKGROUND_IMAGE' })}
                  className="w-full py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl font-semibold transition"
                >
                  Remove Background Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── 4. BORDER BUILDER ── */}
        {activeTab === 'border' && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click Border Inserts
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addBorder('double')}
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-8 border-2 border-double border-blue-600 rounded-sm mb-1.5" />
                <span className="font-bold text-xs text-slate-800 group-hover:text-blue-900">Double Border</span>
              </button>

              <button
                onClick={() => addBorder('solid')}
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-8 border-2 border-slate-700 rounded-sm mb-1.5" />
                <span className="font-bold text-xs text-slate-800 group-hover:text-blue-900">Classic Single</span>
              </button>

              <button
                onClick={() => addBorder('dashed')}
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-8 border-2 border-dashed border-amber-600 rounded-sm mb-1.5" />
                <span className="font-bold text-xs text-slate-800 group-hover:text-blue-900">Modern Dashed</span>
              </button>

              <button
                onClick={() => addBorder('ornate')}
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-8 border-2 border-blue-800 p-0.5 rounded-sm mb-1.5">
                  <div className="w-full h-full border border-amber-500" />
                </div>
                <span className="font-bold text-xs text-slate-800 group-hover:text-blue-900">Ornate Luxury</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
