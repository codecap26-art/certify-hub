'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Z', label: 'Undo previous action' },
    { key: 'Ctrl + Y / Ctrl + Shift + Z', label: 'Redo action' },
    { key: 'Ctrl + C', label: 'Copy selected element(s)' },
    { key: 'Ctrl + X', label: 'Cut selected element(s)' },
    { key: 'Ctrl + V', label: 'Paste element(s)' },
    { key: 'Ctrl + D', label: 'Duplicate selected element(s)' },
    { key: 'Delete / Backspace', label: 'Delete selected element(s)' },
    { key: 'Shift + Click', label: 'Select multiple elements' },
    { key: 'Double Click Text', label: 'Edit text inline on canvas' },
    { key: 'Arrow Keys', label: 'Nudge element by 1px' },
    { key: 'Shift + Arrow Keys', label: 'Nudge element by 10px' },
    { key: 'Ctrl + Wheel', label: 'Zoom canvas in / out' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-500">Speed up your certificate design workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <span className="text-slate-700 font-medium">{sc.label}</span>
              <kbd className="px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs font-mono font-bold text-[11px] text-slate-800">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
