'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Building2, Upload, Plus, Trash2, Check, RefreshCw, FileSignature } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { BrandSettings, DEFAULT_BRAND } from '@/lib/editor/documentModel';
import { SignatoryManager } from '@/components/studio/SignatoryManager';
import { LogoPartnerManager } from '@/components/studio/LogoPartnerManager';

const STORAGE_KEY = 'certifyhub:brand_settings';

export const BrandPanel: React.FC = () => {
  const { addLogo, addSignature, dispatch } = useEditor();
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [savedNotice, setSavedNotice] = useState(false);
  const [view, setView] = useState<'brand' | 'signatories' | 'logos'>('brand');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setBrand(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse brand settings:', e);
        }
      }
    }
  }, []);

  const saveBrand = (updated: BrandSettings) => {
    setBrand(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const applyBrandColors = () => {
    // Apply brand primary color to text or background if desired
    dispatch({ type: 'SET_BACKGROUND_COLOR', color: '#FFFFFF' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              Brand & Identity Kit
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Configure colors, fonts, signatories & logos.</p>
          </div>
          {savedNotice && (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Saved
            </span>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold text-slate-600">
          <button
            onClick={() => setView('brand')}
            className={`flex-1 py-1 rounded-md transition ${view === 'brand' ? 'bg-white text-blue-600 shadow-2xs font-bold' : ''}`}
          >
            Palette & Fonts
          </button>
          <button
            onClick={() => setView('signatories')}
            className={`flex-1 py-1 rounded-md transition ${view === 'signatories' ? 'bg-white text-blue-600 shadow-2xs font-bold' : ''}`}
          >
            Signatories (1-6)
          </button>
          <button
            onClick={() => setView('logos')}
            className={`flex-1 py-1 rounded-md transition ${view === 'logos' ? 'bg-white text-blue-600 shadow-2xs font-bold' : ''}`}
          >
            Logo Library
          </button>
        </div>
      </div>

      {view === 'signatories' && (
        <div className="p-2">
          <SignatoryManager />
        </div>
      )}

      {view === 'logos' && (
        <div className="p-2">
          <LogoPartnerManager />
        </div>
      )}

      {view === 'brand' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Organization Name */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Organization Name
          </label>
          <input
            type="text"
            value={brand.organizationName}
            onChange={(e) => saveBrand({ ...brand, organizationName: e.target.value })}
            placeholder="e.g. Acme Corporation"
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Brand Colors */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Brand Palette
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="block text-[9px] text-slate-500 mb-1">Primary</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={brand.primaryColor}
                  onChange={(e) => saveBrand({ ...brand, primaryColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                />
                <input
                  type="text"
                  value={brand.primaryColor}
                  onChange={(e) => saveBrand({ ...brand, primaryColor: e.target.value })}
                  className="w-full text-[9px] font-mono bg-slate-50 border border-slate-200 rounded px-1 py-1 text-slate-700"
                />
              </div>
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 mb-1">Secondary</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={brand.secondaryColor}
                  onChange={(e) => saveBrand({ ...brand, secondaryColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                />
                <input
                  type="text"
                  value={brand.secondaryColor}
                  onChange={(e) => saveBrand({ ...brand, secondaryColor: e.target.value })}
                  className="w-full text-[9px] font-mono bg-slate-50 border border-slate-200 rounded px-1 py-1 text-slate-700"
                />
              </div>
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 mb-1">Accent</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={brand.accentColor}
                  onChange={(e) => saveBrand({ ...brand, accentColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5 shrink-0"
                />
                <input
                  type="text"
                  value={brand.accentColor}
                  onChange={(e) => saveBrand({ ...brand, accentColor: e.target.value })}
                  className="w-full text-[9px] font-mono bg-slate-50 border border-slate-200 rounded px-1 py-1 text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Fonts */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            Typography
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[9px] text-slate-500 mb-1">Heading Font</span>
              <select
                value={brand.headingFont}
                onChange={(e) => saveBrand({ ...brand, headingFont: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
              >
                <option value="Georgia">Georgia</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
              </select>
            </div>
            <div>
              <span className="block text-[9px] text-slate-500 mb-1">Body Font</span>
              <select
                value={brand.bodyFont}
                onChange={(e) => saveBrand({ ...brand, bodyFont: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
              >
                <option value="Helvetica">Helvetica</option>
                <option value="Arial">Arial</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logo Asset */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Official Brand Logo
          </label>
          {brand.logoDataUrl ? (
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={brand.logoDataUrl} alt="Logo" className="w-8 h-8 object-contain bg-white rounded p-0.5 border" />
                <span className="text-xs font-semibold text-slate-700">Logo saved</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => addLogo(brand.logoDataUrl!)}
                  className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-bold"
                >
                  Add to Canvas
                </button>
                <button
                  onClick={() => saveBrand({ ...brand, logoDataUrl: undefined })}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <label className="w-full p-3 bg-slate-50 border border-dashed border-slate-200 hover:border-blue-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition text-xs font-semibold text-slate-600">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => saveBrand({ ...brand, logoDataUrl: reader.result as string });
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Standard Wording */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Standard Wording
          </label>
          <textarea
            rows={2}
            value={brand.standardWording}
            onChange={(e) => saveBrand({ ...brand, standardWording: e.target.value })}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        </div>
      )}
    </div>
  );
};
