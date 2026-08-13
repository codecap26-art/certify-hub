// ============================================================================
// Signatory Manager Component — Local storage of 1 to 6 signatories
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { FileSignature, Plus, Trash2, Edit3, ShieldAlert, CheckCircle2, ArrowUp, ArrowDown, Upload, X } from 'lucide-react';
import { SignatoryRecord, signatoryRepository } from '@/lib/storage/signatoryRepository';

export const SignatoryManager: React.FC = () => {
  const [signatories, setSignatories] = useState<SignatoryRecord[]>([]);
  const [editingSig, setEditingSig] = useState<SignatoryRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    const list = signatoryRepository.getAll();
    setSignatories(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (sig: SignatoryRecord) => {
    await signatoryRepository.save(sig);
    loadData();
    setIsModalOpen(false);
    setEditingSig(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this signatory record?')) {
      await signatoryRepository.delete(id);
      loadData();
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
    loadData();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-blue-600" />
            Signatory Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain authorized signatories (1 to 6) for institutional certificates.
          </p>
        </div>
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
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Add Signatory ({signatories.length}/6)
        </button>
      </div>

      {/* Sensitive Asset Disclaimer */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Signatures are sensitive organizational assets. In this frontend-only version, signature images are stored exclusively in your local browser storage (IndexedDB).
        </span>
      </div>

      {/* Signatory Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signatories.map((sig, i) => (
          <div key={sig.id} className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Column #{i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(i, 'up')}
                  disabled={i === 0}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  title="Move Left"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(i, 'down')}
                  disabled={i === signatories.length - 1}
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                  title="Move Right"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setEditingSig(sig); setIsModalOpen(true); }}
                  className="p-1 text-slate-400 hover:text-blue-600"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(sig.id)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <p className="font-bold text-xs text-slate-900">{sig.name || 'Unnamed Signatory'}</p>
              <p className="text-[11px] text-slate-600">{sig.designation}</p>
              {sig.department && <p className="text-[10px] text-slate-400">{sig.department}</p>}
            </div>

            {sig.signatureDataUrl ? (
              <div className="h-10 bg-white border border-slate-200 rounded p-1 flex items-center justify-center">
                <img src={sig.signatureDataUrl} alt="Signature" className="max-h-full object-contain" />
              </div>
            ) : (
              <div className="h-10 bg-slate-100 border border-dashed rounded flex items-center justify-center text-[10px] text-slate-400">
                No signature image
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && editingSig && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Signatory Configuration</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingSig.name}
                  onChange={(e) => setEditingSig({ ...editingSig, name: e.target.value })}
                  placeholder="e.g. Dr. R. Sundaram"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={editingSig.designation}
                  onChange={(e) => setEditingSig({ ...editingSig, designation: e.target.value })}
                  placeholder="e.g. Principal & Dean of Academics"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Signature Image</label>
                <label className="p-3 border border-dashed rounded-lg flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Upload Signature PNG</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setEditingSig({ ...editingSig, signatureDataUrl: reader.result as string });
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
                {editingSig.signatureDataUrl && (
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Signature loaded</span>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800 text-[11px] bg-slate-50 p-2.5 rounded-lg border">
                <input
                  type="checkbox"
                  checked={editingSig.permissionConfirmed}
                  onChange={(e) => setEditingSig({ ...editingSig, permissionConfirmed: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600"
                />
                <span>I confirm that I have explicit authorization to use this signature graphic on official certificates.</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold">Cancel</button>
              <button
                onClick={() => handleSave(editingSig)}
                disabled={!editingSig.name || !editingSig.permissionConfirmed}
                className="px-4 py-2 bg-blue-600 disabled:opacity-40 text-white rounded-lg font-bold"
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
