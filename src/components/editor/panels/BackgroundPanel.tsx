'use client';

import React from 'react';
import { Palette, Upload, Trash2, Lock, Unlock, Image as ImageIcon } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

const PRESET_COLORS = [
  '#FFFFFF',
  '#F8FAFC',
  '#F1F5F9',
  '#FEF2F2',
  '#FFFBEB',
  '#F0FDF4',
  '#EFF6FF',
  '#FAF5FF',
  '#0F172A',
  '#1E293B',
];

export const BackgroundPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { document: doc } = state;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({ type: 'SET_BACKGROUND_IMAGE', dataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-1">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          Canvas Background
        </h3>
        <p className="text-[10px] text-slate-500">Configure canvas solid fill or background image.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Background Image Upload */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Background Image
          </label>

          {doc.backgroundDataUrl ? (
            <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
              <div className="aspect-[4/3] bg-white rounded border overflow-hidden relative">
                <img src={doc.backgroundDataUrl} alt="Background" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => dispatch({ type: 'LOCK_BACKGROUND', locked: !doc.backgroundLocked })}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-slate-900"
                >
                  {doc.backgroundLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-600" /> Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" /> Unlocked
                    </>
                  )}
                </button>

                <button
                  onClick={() => dispatch({ type: 'REMOVE_BACKGROUND_IMAGE' })}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="w-full p-4 bg-slate-50 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition text-xs font-semibold text-slate-700">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Certificate Image
              <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Solid Background Color */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Solid Fill Color
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={doc.backgroundColor}
              onChange={(e) => dispatch({ type: 'SET_BACKGROUND_COLOR', color: e.target.value })}
              className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={doc.backgroundColor}
              onChange={(e) => dispatch({ type: 'SET_BACKGROUND_COLOR', color: e.target.value })}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono"
            />
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => dispatch({ type: 'SET_BACKGROUND_COLOR', color })}
                className="w-full aspect-square rounded-md border border-slate-200 hover:scale-105 transition shadow-2xs"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
