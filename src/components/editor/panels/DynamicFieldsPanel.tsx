'use client';

import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Eye, Tag, Image as ImageIcon, FileSignature, QrCode } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { DYNAMIC_BINDING_OPTIONS, DynamicBindingKey } from '@/lib/editor/documentModel';

type ViewMode = 'fields' | 'sample';

export const DynamicFieldsPanel: React.FC = () => {
  const { addDynamicField, addQrCode, addLogo, addSignature, dispatch, state } = useEditor();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(state.showFieldNames ? 'fields' : 'sample');

  const filtered = useMemo(() => {
    if (!search.trim()) return DYNAMIC_BINDING_OPTIONS;
    const q = search.toLowerCase();
    return DYNAMIC_BINDING_OPTIONS.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.key.toLowerCase().includes(q) || opt.category.toLowerCase().includes(q),
    );
  }, [search]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const opt of filtered) {
      const list = map.get(opt.category) || [];
      list.push(opt);
      map.set(opt.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Dynamic Fields
        </h3>
        <p className="text-[10px] text-slate-500">
          Placeholders replaced per-recipient during batch generation.
        </p>

        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fields..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            aria-label="Search dynamic fields"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex mt-2 bg-slate-100 rounded-lg p-0.5 text-[10px] font-semibold">
          <button
            onClick={() => {
              setViewMode('fields');
              dispatch({ type: 'TOGGLE_FIELD_NAMES' });
            }}
            className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1 ${
              viewMode === 'fields' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Tag className="w-3 h-3" /> Field Names
          </button>
          <button
            onClick={() => {
              setViewMode('sample');
              dispatch({ type: 'TOGGLE_FIELD_NAMES' });
            }}
            className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1 ${
              viewMode === 'sample' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Eye className="w-3 h-3" /> Sample Data
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Special elements */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Special Elements</h4>
          <div className="space-y-1.5">
            <button
              onClick={() => addQrCode()}
              className="w-full p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-left hover:bg-teal-100 transition flex items-center gap-2 group"
            >
              <QrCode className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-teal-800">Verification QR Code</span>
                <span className="block text-[9px] text-teal-600">Unique per certificate</span>
              </div>
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => addLogo(reader.result as string);
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left hover:bg-blue-50/50 hover:border-blue-300 transition flex items-center gap-2 group"
            >
              <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
              <div>
                <span className="block text-xs font-semibold text-slate-700 group-hover:text-blue-700">Organization Logo</span>
                <span className="block text-[9px] text-slate-400">Upload logo image</span>
              </div>
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => addSignature(reader.result as string);
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left hover:bg-blue-50/50 hover:border-blue-300 transition flex items-center gap-2 group"
            >
              <FileSignature className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
              <div>
                <span className="block text-xs font-semibold text-slate-700 group-hover:text-blue-700">Signature Image</span>
                <span className="block text-[9px] text-slate-400">Upload signature</span>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic binding fields grouped by category */}
        {Array.from(grouped.entries()).map(([category, options]) => (
          <div key={category}>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{category}</h4>
            <div className="space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => addDynamicField(opt.key)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-700">
                      {opt.label}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {opt.category}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {viewMode === 'fields' ? opt.key : opt.sampleValue}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
