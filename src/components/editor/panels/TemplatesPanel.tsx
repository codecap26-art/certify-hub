'use client';

import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, Grid3x3, Import } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { templateRepository } from '@/lib/storage/templateRepository';

type TabId = 'all' | 'built-in' | 'imported' | 'custom' | 'recent';

export const TemplatesPanel: React.FC = () => {
  const { dispatch } = useEditor();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; category: string; thumbnailDataUrl?: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    const all = templateRepository.getAll();
    setTemplates(all.map((t) => ({ id: t.id, name: t.name, category: t.category, thumbnailDataUrl: t.thumbnailDataUrl })));
    setLoaded(true);
  }, []);

  const filtered = useMemo(() => {
    let list = templates;
    if (activeTab !== 'all' && activeTab !== 'recent') {
      const catMap: Record<string, string> = { 'built-in': 'Built-in', imported: 'Imported', custom: 'Custom' };
      list = list.filter((t) => t.category === catMap[activeTab]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [templates, activeTab, search]);

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All', icon: Grid3x3 },
    { id: 'built-in', label: 'Built-in', icon: Star },
    { id: 'imported', label: 'Imported', icon: Import },
    { id: 'custom', label: 'Custom', icon: Star },
    { id: 'recent', label: 'Recent', icon: Clock },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 mb-2">Templates</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            aria-label="Search templates"
          />
        </div>
      </div>

      <div className="flex border-b border-slate-100 px-2 text-[10px] font-semibold text-slate-500">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-2 transition border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!loaded ? (
          <div className="text-center text-xs text-slate-400 py-6">Loading templates...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-6">
            {search ? 'No templates match your search.' : 'No templates found.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={async () => {
                  const full = await templateRepository.getById(t.id);
                  if (full) {
                    // Apply template as background and elements
                    dispatch({ type: 'SET_DOCUMENT', doc: full as unknown as import('@/lib/editor/documentModel').CertificateDocument });
                  }
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 hover:border-blue-300 hover:bg-blue-50/30 transition text-left group"
              >
                <div className="w-full aspect-[4/3] bg-white rounded border border-slate-100 mb-1.5 flex items-center justify-center overflow-hidden">
                  {t.thumbnailDataUrl ? (
                    <img src={t.thumbnailDataUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-slate-300 font-semibold">Preview</span>
                  )}
                </div>
                <p className="text-[10px] font-semibold text-slate-700 truncate group-hover:text-blue-700">
                  {t.name}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">{t.category}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
