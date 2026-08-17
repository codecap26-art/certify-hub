'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { CertificateDocument } from '@/lib/editor/documentModel';

interface Props {
  isOpen: boolean;
  draftDoc: CertificateDocument;
  onRestore: () => void;
  onDiscard: () => void;
}

export const LocalRecoveryModal: React.FC<Props> = ({ isOpen, draftDoc, onRestore, onDiscard }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Unsaved Work Detected</h3>
            <p className="text-xs text-slate-500">
              Last modified: {new Date(draftDoc.updatedAt || Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          We found an unsaved draft of &ldquo;<strong className="text-slate-800">{draftDoc.name}</strong>&rdquo; stored locally in your browser. Would you like to restore your progress?
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={onDiscard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard Draft</span>
          </button>

          <button
            onClick={onRestore}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
