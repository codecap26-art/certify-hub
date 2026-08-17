// ============================================================================
// Logo & Partner Manager Component
// Categorized logo library (Main Org, Secondary Inst, Department, Organizer, Sponsor, Partner, Accreditation)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Upload, Trash2, Plus, X, ShieldAlert, Check, Layers } from 'lucide-react';
import { LogoRecord, LogoCategory, logoRepository } from '@/lib/storage/logoRepository';
import { useEditor } from '@/lib/editor/useEditorStore';

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
  const { addLogo } = useEditor();
  const [logos, setLogos] = useState<LogoRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LogoCategory | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<LogoRecord | null>(null);
  const [insertedNotice, setInsertedNotice] = useState<string | null>(null);

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

  const handleAddLogoToCanvas = (logo: LogoRecord) => {
    if (logo.dataUrl) {
      addLogo(logo.dataUrl);
      setInsertedNotice(`"${logo.name}" added to canvas`);
      setTimeout(() => setInsertedNotice(null), 2000);
    }
  };

  const filtered =
    selectedCategory === 'ALL' ? logos : logos.filter((l) => l.category === selectedCategory);

  return (
    <div className="space-y-3.5 select-none">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Logo & Partner Library
            </h3>
            <p className="text-[10px] text-slate-500">Logos, sponsors & accreditation seals</p>
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
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Logo
          </button>
        </div>

        {insertedNotice && (
          <div className="flex items-center justify-center gap-1.5 p-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            {insertedNotice}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-100 gap-1 text-[10px] font-semibold text-slate-500 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-2 py-1 rounded-md border transition shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
              : 'border-transparent hover:bg-slate-50'
          }`}
        >
          All ({logos.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = logos.filter((l) => l.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded-md border transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                  : 'border-transparent hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Logo Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((logo) => (
          <div
            key={logo.id}
            className="border border-slate-200 hover:border-slate-300 rounded-xl p-2 bg-slate-50/70 hover:bg-slate-50 flex flex-col gap-1.5 relative group transition shadow-2xs"
          >
            <div className="h-16 bg-white border border-slate-100 rounded-lg p-1 flex items-center justify-center overflow-hidden">
              {logo.dataUrl ? (
                <img src={logo.dataUrl} alt={logo.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[9px] text-slate-400 font-mono">No Image</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[11px] text-slate-900 truncate">{logo.name}</p>
              <span className="text-[8px] font-bold text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200 block truncate mt-0.5">
                {logo.category}
              </span>
            </div>

            <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60">
              <button
                onClick={() => handleAddLogoToCanvas(logo)}
                disabled={!logo.dataUrl}
                className="flex-1 py-1 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 text-blue-700 rounded text-[9px] font-bold transition text-center"
              >
                + Add
              </button>
              <button
                onClick={() => handleDelete(logo.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-6 text-center text-xs text-slate-400 border border-dashed rounded-xl p-4">
            No logos stored for this category yet.
          </div>
        )}
      </div>

      {/* Upload / Edit Modal */}
      {isModalOpen && editingLogo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Add Logo Asset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block font-semibold text-[11px] text-slate-700 mb-1">Asset Name *</label>
                <input
                  type="text"
                  value={editingLogo.name}
                  onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })}
                  placeholder="e.g. NAAC Accreditation Logo"
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-[11px] text-slate-700 mb-1">Category *</label>
                <select
                  value={editingLogo.category}
                  onChange={(e) =>
                    setEditingLogo({ ...editingLogo, category: e.target.value as LogoCategory })
                  }
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-xs text-slate-800"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[11px] text-slate-700 mb-1">Logo Image File *</label>
                <label className="p-3 border border-dashed border-slate-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">Upload PNG / SVG / JPG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () =>
                        setEditingLogo({ ...editingLogo, dataUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
                {editingLogo.dataUrl && (
                  <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <img
                      src={editingLogo.dataUrl}
                      alt="Preview"
                      className="h-6 w-10 object-contain bg-white rounded border"
                    />
                    <span className="text-[10px] font-bold text-emerald-700">Image loaded</span>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer font-medium text-slate-700 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={editingLogo.permissionConfirmed}
                  onChange={(e) =>
                    setEditingLogo({ ...editingLogo, permissionConfirmed: e.target.checked })
                  }
                  className="mt-0.5 rounded text-blue-600"
                />
                <span>I confirm that I have permission to use this organizational logo.</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingLogo)}
                disabled={!editingLogo.name || !editingLogo.permissionConfirmed || !editingLogo.dataUrl}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-2xs transition"
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
