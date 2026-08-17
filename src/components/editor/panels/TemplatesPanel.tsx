'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Layers, Grid3x3, AlertCircle } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { templateRepository } from '@/lib/storage/templateRepository';
import { TemplateCategory } from '@/lib/editor/documentModel';

export const TemplatesPanel: React.FC = () => {
  const { dispatch } = useEditor();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; category: string; thumbnailDataUrl?: string }>>([]);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const all = templateRepository.getAll();
    setTemplates(all.map((t) => ({ id: t.id, name: t.name, category: t.category, thumbnailDataUrl: t.thumbnailDataUrl })));
  }, []);

  const categories = [
    'All',
    'Achievement',
    'Participation',
    'Completion',
    'Appreciation',
    'Academic',
    'Competition',
    'Workshop',
    'Custom',
  ];

  const filtered = useMemo(() => {
    let list = templates;
    if (activeCategory !== 'All') {
      list = list.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase() || (activeCategory === 'Custom' && t.category === 'Custom'));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return list;
  }, [templates, activeCategory, search]);

  const handleApplyTemplate = async (templateId: string) => {
    const full = await templateRepository.getById(templateId);
    if (full) {
      dispatch({ type: 'SET_DOCUMENT', doc: full as unknown as import('@/lib/editor/documentModel').CertificateDocument });
    }
    setPendingTemplateId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header & Search */}
      <div className="p-3 border-b border-slate-100 space-y-2">
        <h3 className="font-bold text-xs text-slate-900">Certificate Templates</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates (e.g. gold, academic, winner)..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto gap-1 p-2 border-b border-slate-100 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-8">
            <Layers className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p>No templates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setPendingTemplateId(t.id)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 hover:border-blue-400 hover:bg-blue-50/30 transition text-left group cursor-pointer"
              >
                <div className="w-full aspect-[4/3] bg-white rounded-lg border border-slate-200 mb-1.5 flex items-center justify-center overflow-hidden">
                  {t.thumbnailDataUrl ? (
                    <img src={t.thumbnailDataUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 text-center px-2">
                      {t.name}
                    </span>
                  )}
                </div>
                <p className="font-bold text-[11px] text-slate-800 truncate group-hover:text-blue-900">
                  {t.name}
                </p>
                <span className="text-[9px] text-slate-400 font-medium">{t.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Template Replacement Confirmation Modal */}
      {pendingTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Replace Current Certificate Design?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applying this template will replace the elements and background on your canvas. Any unsaved edits will be overwritten.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingTemplateId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyTemplate(pendingTemplateId)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
