'use client';

import React, { useState } from 'react';
import { Sparkles, X, Layers, ArrowRight, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { CustomTemplate, Orientation } from '@/types/template';
import { LocalSmartDesignProvider, SmartDesignOptions } from '@/lib/template/smartDesignProvider';
import { templateRepository } from '@/lib/storage/templateRepository';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOpenEditor: (template: CustomTemplate) => void;
}

export const SmartDesignModal: React.FC<Props> = ({ isOpen, onClose, onSuccessOpenEditor }) => {
  const [purpose, setPurpose] = useState('React 19 & Next.js Development Workshop');
  const [style, setStyle] = useState<SmartDesignOptions['style']>('Academic');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [primaryColor, setPrimaryColor] = useState('#0F172A');
  const [secondaryColor, setSecondaryColor] = useState('#2563EB');
  const [signatoriesCount, setSignatoriesCount] = useState<1 | 2>(1);
  const [hasQrCode, setHasQrCode] = useState<boolean>(true);

  const [generatedVariations, setGeneratedVariations] = useState<CustomTemplate[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateLayouts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    const provider = new LocalSmartDesignProvider();
    const layouts = await provider.generateLayouts({
      purpose,
      style,
      orientation,
      primaryColor,
      secondaryColor,
      organizationType: 'College / University',
      signatoriesCount,
      hasLogo: true,
      hasQrCode,
    });

    setGeneratedVariations(layouts);
    setIsGenerating(false);
  };

  const handleSelectVariation = async (tmpl: CustomTemplate) => {
    await templateRepository.save(tmpl);
    onSuccessOpenEditor(tmpl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-3xl w-full space-y-6 shadow-xl max-h-[90vh] overflow-y-auto text-slate-800 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">Smart Design Assistant</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Frontend Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Automated layout rules generator for certificate templates</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 16 AI Limitation Disclaimer */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-600 space-y-1">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Frontend Rule-Based Generator Architecture:</span>
          </p>
          <p className="text-[11px] leading-relaxed">
            This assistant parses options locally using deterministic design rules. Real generative AI requires a secure backend API key. The <code className="font-mono text-blue-700">TemplateDesignProvider</code> abstraction allows easy connection to remote AI endpoints later.
          </p>
        </div>

        {!generatedVariations ? (
          <form onSubmit={handleGenerateLayouts} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="purpose-input">
                Certificate Purpose / Event Title *
              </label>
              <input
                id="purpose-input"
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold text-slate-900 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Design Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as SmartDesignOptions['style'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                >
                  <option value="Academic">Academic (Traditional Borders)</option>
                  <option value="Modern">Modern (Clean Banners)</option>
                  <option value="Minimal">Minimal (Subtle Typographic)</option>
                  <option value="Corporate">Corporate (Professional)</option>
                  <option value="Elegant">Elegant (Golden Accents)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Canvas Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
                >
                  <option value="landscape">A4 Landscape (Standard)</option>
                  <option value="portrait">A4 Portrait</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t border-slate-100 pt-3">
              <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasQrCode}
                  onChange={(e) => setHasQrCode(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Include Verification QR Code</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Signatories:</span>
                <button
                  type="button"
                  onClick={() => setSignatoriesCount(1)}
                  className={`px-3 py-1 rounded-lg font-bold border ${
                    signatoriesCount === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  1 Signatory
                </button>
                <button
                  type="button"
                  onClick={() => setSignatoriesCount(2)}
                  className={`px-3 py-1 rounded-lg font-bold border ${
                    signatoriesCount === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  2 Signatories
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-xs transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Layouts...' : 'Generate 3 Template Variations'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Select Layout Variation to Edit</h4>
              <button
                onClick={() => setGeneratedVariations(null)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                ← Back to Options
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedVariations.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectVariation(tmpl)}
                  className="bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md p-4 rounded-2xl cursor-pointer transition space-y-3"
                >
                  <div className="h-32 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 text-center">
                    <p className="font-bold text-xs text-slate-800">{tmpl.name}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{tmpl.name}</h5>
                    <p className="text-[10px] text-slate-500">{tmpl.elements.length} layout elements</p>
                  </div>
                  <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-lg border border-blue-200 flex items-center justify-center gap-1">
                    <span>Use & Open Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
