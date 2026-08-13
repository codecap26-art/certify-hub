'use client';

import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Folder, FileText, Trash2, Copy, HardDrive } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { templateRepository } from '@/lib/storage/templateRepository';
import { CertificateDocument } from '@/lib/editor/documentModel';

export const ProjectsPanel: React.FC = () => {
  const { dispatch } = useEditor();
  const [designs, setDesigns] = useState<Array<{ id: string; name: string; category: string; updatedAt: string }>>([]);

  useEffect(() => {
    const list = templateRepository.getAll();
    setDesigns(list.map((d) => ({ id: d.id, name: d.name, category: d.category, updatedAt: d.updatedAt })));
  }, []);

  const loadDesign = async (id: string) => {
    const doc = await templateRepository.getById(id);
    if (doc) {
      dispatch({ type: 'SET_DOCUMENT', doc: doc as unknown as CertificateDocument });
    }
  };

  const duplicateDesign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = await templateRepository.duplicate(id);
    if (dup) {
      setDesigns((prev) => [...prev, { id: dup.id, name: dup.name, category: dup.category, updatedAt: dup.updatedAt }]);
    }
  };

  const deleteDesign = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this design?')) {
      await templateRepository.delete(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 mb-1">
          <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
          Projects & Saved Designs
        </h3>
        <p className="text-[10px] text-slate-500">Access saved templates and custom creations.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Local Storage Notice */}
        <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-[10px] text-amber-800 flex items-start gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>Designs are saved locally in your browser storage (IndexedDB).</span>
        </div>

        <div className="space-y-1.5">
          {designs.map((d) => (
            <div
              key={d.id}
              onClick={() => loadDesign(d.id)}
              className="p-2.5 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 rounded-lg flex items-center justify-between cursor-pointer transition group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">{d.name}</p>
                  <p className="text-[9px] text-slate-400">{d.category} · {new Date(d.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => duplicateDesign(d.id, e)}
                  className="p-1 hover:bg-white rounded text-slate-500 hover:text-blue-600"
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => deleteDesign(d.id, e)}
                  className="p-1 hover:bg-white rounded text-slate-500 hover:text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {designs.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-6">
              No saved designs yet. Click Save in the top toolbar to store current design.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
