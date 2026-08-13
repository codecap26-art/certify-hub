'use client';

import React from 'react';
import { Type, Heading1, Heading2, AlignLeft, BookOpen, User, FileSignature, Code } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

interface TextPreset {
  label: string;
  icon: React.ElementType;
  text: string;
  isHeading: boolean;
}

const QUICK_ADD: TextPreset[] = [
  { label: 'Certificate Title', icon: Heading1, text: 'CERTIFICATE OF ACHIEVEMENT', isHeading: true },
  { label: 'Heading', icon: Heading1, text: 'Add a Heading', isHeading: true },
  { label: 'Subheading', icon: Heading2, text: 'Add a Subheading', isHeading: false },
  { label: 'Body Text', icon: AlignLeft, text: 'Add body text paragraph...', isHeading: false },
  { label: 'Certifying Clause', icon: BookOpen, text: 'This is to certify that', isHeading: false },
  { label: 'Recipient Line', icon: User, text: '{{ Recipient Name }}', isHeading: true },
  { label: 'Signature Label', icon: FileSignature, text: 'Authorized Signatory', isHeading: false },
  { label: 'Code Text', icon: Code, text: 'Certificate No: ABC-2026-0001', isHeading: false },
];

const STYLE_PRESETS = [
  { name: 'Academic', font: 'Georgia', weight: 'bold', size: 24, color: '#1E293B' },
  { name: 'Elegant', font: 'Times New Roman', weight: 'normal', size: 22, color: '#44403C' },
  { name: 'Modern', font: 'Helvetica', weight: 'bold', size: 26, color: '#0F172A' },
  { name: 'Corporate', font: 'Arial', weight: 'bold', size: 20, color: '#1E40AF' },
  { name: 'Minimal', font: 'Helvetica', weight: 'normal', size: 18, color: '#64748B' },
  { name: 'Traditional', font: 'Times New Roman', weight: 'bold', size: 28, color: '#7C2D12' },
];

export const TextPanel: React.FC = () => {
  const { addText } = useEditor();

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900">Text</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Add static text elements to the canvas.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Quick Add */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Add</h4>
          <div className="space-y-1.5">
            {QUICK_ADD.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.label}
                  onClick={() => addText(preset.text, preset.isHeading)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50/50 transition group flex items-center gap-2.5"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  <div>
                    <span className={`block text-xs text-slate-800 group-hover:text-blue-700 ${preset.isHeading ? 'font-bold' : 'font-medium'}`}>
                      {preset.label}
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-0.5 truncate">{preset.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Presets */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Style Presets</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => addText(preset.name, true)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center hover:border-blue-300 hover:bg-blue-50/30 transition"
              >
                <span
                  className="block text-sm truncate"
                  style={{
                    fontFamily: preset.font,
                    fontWeight: preset.weight,
                    color: preset.color,
                  }}
                >
                  {preset.name}
                </span>
                <span className="block text-[8px] text-slate-400 mt-1">{preset.font} · {preset.size}px</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
