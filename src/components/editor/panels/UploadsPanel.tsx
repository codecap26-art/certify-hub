'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Search, Image as ImageIcon, Trash2, PenLine, Plus, X } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

interface UploadedAsset {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  addedAt: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const UploadsPanel: React.FC = () => {
  const { addImage, addLogo, addSignature, dispatch } = useEditor();
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds 10MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAssets((prev) => [
          ...prev,
          {
            id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            name: file.name,
            dataUrl,
            size: file.size,
            addedAt: new Date().toISOString(),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const filtered = search.trim()
    ? assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : assets;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 mb-2">Uploads</h3>
        {assets.length > 0 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search uploads..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              aria-label="Search uploads"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Drop zone */}
        <label
          className={`block w-full p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
          <span className="block text-xs font-bold text-slate-700">
            {isDragging ? 'Drop images here' : 'Drag & drop or browse'}
          </span>
          <span className="block text-[9px] text-slate-400 mt-0.5">PNG, JPG, WebP, SVG · Max 10MB</span>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>

        {/* Dedicated Quick Add Shortcuts */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Element Shortcuts</h4>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/png, image/jpeg, image/webp, image/svg+xml';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => addLogo(reader.result as string);
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/40 transition flex items-center gap-1.5 font-bold text-slate-700"
            >
              <PenLine className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Add Logo</span>
            </button>

            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/png, image/jpeg, image/webp, image/svg+xml';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => addSignature(reader.result as string);
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/40 transition flex items-center gap-1.5 font-bold text-slate-700"
            >
              <PenLine className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Add Signature</span>
            </button>
          </div>
        </div>

        {/* Asset grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden group relative"
              >
                <div className="aspect-square bg-white flex items-center justify-center p-1">
                  <img
                    src={asset.dataUrl}
                    alt={asset.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-1.5">
                  <p className="text-[9px] font-semibold text-slate-700 truncate">{asset.name}</p>
                  <p className="text-[8px] text-slate-400">{(asset.size / 1024).toFixed(1)} KB</p>
                </div>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => addImage(asset.dataUrl, asset.name)}
                    className="p-1.5 bg-white rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    title="Add to canvas"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_BACKGROUND_IMAGE', dataUrl: asset.dataUrl })}
                    className="p-1.5 bg-white rounded-lg text-slate-600 hover:bg-slate-50 transition"
                    title="Set as background"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAssets((prev) => prev.filter((a) => a.id !== asset.id))}
                    className="p-1.5 bg-white rounded-lg text-rose-600 hover:bg-rose-50 transition"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {assets.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-4">
            Upload images to use as logos, signatures, or decorative elements.
          </div>
        )}
      </div>
    </div>
  );
};
