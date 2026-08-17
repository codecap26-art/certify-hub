// ============================================================================
// Signatory Manager Component — Reusable Signatory Authority Profiles (1 to 6)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSignature,
  Plus,
  Trash2,
  Edit3,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { SignatoryRecord, signatoryRepository } from '@/lib/storage/signatoryRepository';
import { useEditor } from '@/lib/editor/useEditorStore';

export const SignatoryManager: React.FC = () => {
  const { state, dispatch, addSignature, addText } = useEditor();
  const [signatories, setSignatories] = useState<SignatoryRecord[]>([]);
  const [editingSig, setEditingSig] = useState<SignatoryRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insertedNotice, setInsertedNotice] = useState<string | null>(null);

  const loadData = async () => {
    const list = signatoryRepository.getAll();
    const resolvedList = await Promise.all(
      list.map(async (sig) => {
        const fullSig = await signatoryRepository.getById(sig.id);
        return fullSig || sig;
      })
    );
    setSignatories(resolvedList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (sig: SignatoryRecord) => {
    await signatoryRepository.save(sig);
    await loadData();
    setIsModalOpen(false);
    setEditingSig(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this signatory record?')) {
      await signatoryRepository.delete(id);
      await loadData();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const updated = [...signatories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const ids = updated.map((s) => s.id);
    await signatoryRepository.reorder(ids);
    await loadData();
  };

  const handleAddToCanvas = (sig: SignatoryRecord, index: number) => {
    if (sig.signatureDataUrl) {
      addSignature(sig.signatureDataUrl, sig.name, sig.designation);
    } else {
      addText(`${sig.name}\n${sig.designation}`, false, {
        fontSize: 12,
        fontWeight: 'bold',
        align: 'center',
        fill: '#0F172A',
      });
    }
    setInsertedNotice(`Column #${index + 1} added`);
    setTimeout(() => setInsertedNotice(null), 2000);
  };

  const handleInsertAllSignatories = () => {
    if (signatories.length === 0) return;
    const docWidth = state.document.width;
    const docHeight = state.document.height;
    const count = signatories.length;
    const usableWidth = docWidth * 0.8;
    const startX = docWidth * 0.1;
    const spacing = count > 1 ? usableWidth / (count - 1) : 0;
    const baseY = docHeight - 110;

    signatories.forEach((sig, i) => {
      const posX = count === 1 ? docWidth / 2 - 70 : startX + i * spacing - 70;
      if (sig.signatureDataUrl) {
        addSignature(sig.signatureDataUrl, sig.name, sig.designation);
      } else {
        addText(`${sig.name}\n${sig.designation}`, false, {
          fontSize: 11,
          fontWeight: 'bold',
          align: 'center',
          fill: '#0F172A',
        });
      }
    });

    setInsertedNotice(`All ${count} signatories placed`);
    setTimeout(() => setInsertedNotice(null), 2000);
  };

  return (
    <div className="space-y-3.5 select-none">
      {/* Header Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-blue-600" />
              Signatories
            </h3>
            <p className="text-[10px] text-slate-500">1 to 6 institutional authority profiles</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {signatories.length}/6
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setEditingSig({
                id: `sig-${Date.now()}`,
                name: '',
                designation: '',
                department: '',
                organization: '',
                titlePrefix: '',
                isActive: true,
                order: signatories.length + 1,
                permissionConfirmed: false,
              });
              setIsModalOpen(true);
            }}
            disabled={signatories.length >= 6}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-[11px] rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Profile
          </button>

          <button
            onClick={handleInsertAllSignatories}
            disabled={signatories.length === 0}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-200 transition cursor-pointer"
            title="Place all signatories across certificate bottom"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Insert All
          </button>
        </div>

        {insertedNotice && (
          <div className="flex items-center justify-center gap-1.5 p-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            {insertedNotice}
          </div>
        )}
      </div>

      {/* Sensitive Asset Disclaimer */}
      <div className="p-2 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 text-[10px] flex items-start gap-1.5 leading-snug">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span>Stored locally in browser IndexedDB with explicit authorization.</span>
      </div>

      {/* Signatory Cards List — 1 Column Full Width per Card */}
      <div className="flex flex-col gap-2.5">
        {signatories.map((sig, i) => (
          <div
            key={sig.id}
            className="border border-slate-200 hover:border-slate-300 rounded-xl p-3 bg-slate-50/70 hover:bg-slate-50 transition shadow-2xs flex flex-col gap-2 relative group"
          >
            {/* Card Top Row: Column Tag + Action Controls */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded border border-blue-200">
                Column #{i + 1}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleMove(i, 'up')}
                  disabled={i === 0}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded disabled:opacity-20 transition"
                  title="Move Left / Earlier"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMove(i, 'down')}
                  disabled={i === signatories.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded disabled:opacity-20 transition"
                  title="Move Right / Later"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setEditingSig(sig);
                    setIsModalOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(sig.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="min-w-0">
              <p className="font-bold text-xs text-slate-900 truncate">{sig.name || 'Unnamed Signatory'}</p>
              <p className="text-[11px] text-slate-600 font-medium truncate">{sig.designation}</p>
              {sig.department && (
                <p className="text-[10px] text-slate-400 truncate">{sig.department}</p>
              )}
            </div>

            {/* Signature Graphic & Add Button */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
              {sig.signatureDataUrl ? (
                <div className="h-8 w-20 bg-white border border-slate-200 rounded px-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={sig.signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 italic">No signature image</span>
              )}

              <button
                onClick={() => handleAddToCanvas(sig, i)}
                className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0"
                title="Insert onto Certificate"
              >
                <Plus className="w-3 h-3" /> Add to Canvas
              </button>
            </div>
          </div>
        ))}

        {signatories.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed rounded-xl p-4">
            No signatories configured. Click &quot;Add Profile&quot; above to create one.
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingSig && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-blue-600" />
                Signatory Profile
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
                <label className="block font-semibold text-[11px] text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editingSig.name}
                  onChange={(e) => setEditingSig({ ...editingSig, name: e.target.value })}
                  placeholder="e.g. Dr. R. Sundaram"
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-[11px] text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  value={editingSig.designation}
                  onChange={(e) => setEditingSig({ ...editingSig, designation: e.target.value })}
                  placeholder="e.g. Principal & Dean of Academics"
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[11px] text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingSig.department || ''}
                    onChange={(e) => setEditingSig({ ...editingSig, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[11px] text-slate-700 mb-1">Organization</label>
                  <input
                    type="text"
                    value={editingSig.organization || ''}
                    onChange={(e) => setEditingSig({ ...editingSig, organization: e.target.value })}
                    placeholder="e.g. ABC College"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[11px] text-slate-700 mb-1">Signature Image</label>
                <label className="p-3 border border-dashed border-slate-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600">Upload Signature PNG / JPG</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () =>
                        setEditingSig({ ...editingSig, signatureDataUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
                {editingSig.signatureDataUrl && (
                  <div className="mt-1.5 flex items-center justify-between p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={editingSig.signatureDataUrl}
                        alt="Signature"
                        className="h-6 w-16 object-contain bg-white rounded border"
                      />
                      <span className="text-[10px] font-bold text-emerald-700">Signature Loaded</span>
                    </div>
                    <button
                      onClick={() => setEditingSig({ ...editingSig, signatureDataUrl: undefined })}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-bold px-1.5"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer font-medium text-slate-700 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={editingSig.permissionConfirmed}
                  onChange={(e) =>
                    setEditingSig({ ...editingSig, permissionConfirmed: e.target.checked })
                  }
                  className="mt-0.5 rounded text-blue-600"
                />
                <span>I confirm that I have authorized permission to use this signature asset on official certificates.</span>
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
                onClick={() => handleSave(editingSig)}
                disabled={!editingSig.name || !editingSig.permissionConfirmed}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg font-bold text-xs shadow-2xs transition"
              >
                Save Signatory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
