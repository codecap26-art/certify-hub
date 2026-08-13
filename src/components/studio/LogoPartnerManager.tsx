// ============================================================================
// Logo & Partner Manager Component
// Categorized logo library (Main Org, Secondary Inst, Department, Organizer, Sponsor, Partner, Accreditation)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Upload, Trash2, Plus, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { LogoRecord, LogoCategory, logoRepository } from '@/lib/storage/logoRepository';

const CATEGORIES: LogoCategory[] = [
  'Main Organization',
  'Secondary Institution',
  'Department',
  'Organizer',
  'Sponsor',
  'Partner',
  'Accreditation',
];

export const LogoPartnerManager: React.FC = () => {
  const [logos, setLogos] = useState<LogoRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LogoCategory | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<LogoRecord | null>(null);

  const loadLogos = () => {
    setLogos(logoRepository.getAll());
  };

  useEffect(() => {
    loadLogos();
  }, []);

  const handleSave = async (logo: LogoRecord) => {
    await logoRepository.save(logo);
    loadLogos();
    setIsModalOpen(false);
    setEditingLogo(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this logo asset?')) {
      await logoRepository.delete(id);
      loadLogos();
    }
  };

  const filtered = selectedCategory === 'ALL'
    ? logos
    : logos.filter((l) => l.category === selectedCategory);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Logo & Partner Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization, partner, sponsor, and accreditation logos.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLogo({
              id: `logo-${Date.now()}`,
              name: '',
              category: 'Main Organization',
              aspectRatio: 1,
              permissionConfirmed: false,
              createdAt: new Date().toISOString(),
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Add Logo Asset
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-100 gap-1 text-[11px] font-semibold text-slate-500 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg border transition ${selectedCategory === 'ALL' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-transparent'}`}
        >
          All ({logos.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = logos.filter((l) => l.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border transition shrink-0 ${selectedCategory === cat ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-transparent'}`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Logo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((logo) => (
          <div key={logo.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 relative group">
            <div className="h-20 bg-white border border-slate-100 rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
              {logo.dataUrl ? (
                <img src={logo.dataUrl} alt={logo.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[9px] text-slate-400 font-mono">No Image</span>
              )}
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 truncate">{logo.name}</p>
              <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 block truncate mt-0.5">
                {logo.category}
              </span>
            </div>

            <button
              onClick={() => handleDelete(logo.id)}
              className="absolute top-2 right-2 p-1 bg-white border border-slate-200 rounded text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No logos stored for this category yet. Click Add Logo Asset above.
          </div>
        )}
      </div>

      {/* Upload / Edit Modal */}
      {isModalOpen && editingLogo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add Logo Asset</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Asset Name</label>
                <input
                  type="text"
                  value={editingLogo.name}
                  onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })}
                  placeholder="e.g. NAAC Accreditation Logo"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={editingLogo.category}
                  onChange={(e) => setEditingLogo({ ...editingLogo, category: e.target.value as LogoCategory })}
                  className="w-full border rounded-lg p-2 bg-slate-50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Logo Image File</label>
                <label className="p-4 border border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-blue-50">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Upload PNG / SVG / JPG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setEditingLogo({ ...editingLogo, dataUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
                {editingLogo.dataUrl && (
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Image loaded successfully</span>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800 text-[11px] bg-slate-50 p-2.5 rounded-lg border">
                <input
                  type="checkbox"
                  checked={editingLogo.permissionConfirmed}
                  onChange={(e) => setEditingLogo({ ...editingLogo, permissionConfirmed: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span>I confirm that I have permission to use this organizational logo.</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
              <button
                onClick={() => handleSave(editingLogo)}
                disabled={!editingLogo.name || !editingLogo.permissionConfirmed || !editingLogo.dataUrl}
                className="px-4 py-2 bg-blue-600 disabled:opacity-40 text-white rounded-lg font-bold"
              >
                Save Logo Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
