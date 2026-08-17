'use client';

import React from 'react';
import { Type, Sparkles, Award, FileText, Calendar, ShieldCheck, PenTool } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

export const TextPanel: React.FC = () => {
  const { addText, addDynamicField } = useEditor();

  const presets = [
    {
      title: 'Certificate Title',
      subtitle: 'Official Header',
      text: 'CERTIFICATE OF ACHIEVEMENT',
      icon: Award,
      isHeading: true,
      style: {
        fontFamily: 'Cinzel',
        fontSize: 28,
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        letterSpacing: 2,
        fill: '#1E3A8A',
      },
    },
    {
      title: 'Recipient Name',
      subtitle: 'Auto-Fit Dynamic Field',
      isDynamic: true,
      dynamicKey: '{{recipient.name}}',
      icon: Sparkles,
      style: {
        fontFamily: 'Playfair Display',
        fontSize: 32,
        fontWeight: 'bold',
        autoFit: true,
        minFontSize: 16,
        maxFontSize: 42,
        fill: '#0F172A',
      },
    },
    {
      title: 'Presentation Statement',
      subtitle: 'Formal Award Wording',
      text: 'THIS IS PROUDLY PRESENTED TO',
      icon: FileText,
      isHeading: false,
      style: {
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase' as const,
        letterSpacing: 3,
        fill: '#64748B',
      },
    },
    {
      title: 'Achievement & Reason',
      subtitle: 'Course or Award Description',
      text: 'for outstanding performance and successful completion of the requirements for',
      icon: Award,
      isHeading: false,
      style: {
        fontFamily: 'Georgia',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 1.4,
        fill: '#334155',
      },
    },
    {
      title: 'Date & Location',
      subtitle: 'Event Metadata Block',
      text: 'Given this 12th day of March, 2026 at Technology Auditorium',
      icon: Calendar,
      isHeading: false,
      style: {
        fontFamily: 'Inter',
        fontSize: 11,
        fill: '#64748B',
      },
    },
    {
      title: 'Signatory Block',
      subtitle: 'Convener / Authority Line',
      text: 'Dr. V. Ramanathan\nPrincipal & Dean of Engineering',
      icon: PenTool,
      isHeading: false,
      style: {
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 1.3,
        fill: '#0F172A',
      },
    },
    {
      title: 'Certificate ID & Verification',
      subtitle: 'Unique Security Token',
      text: 'CERT-2026-REACT-0842 · verify at certifyhub.app',
      icon: ShieldCheck,
      isHeading: false,
      style: {
        fontFamily: 'Inter',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
        fill: '#94A3B8',
      },
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 mb-1">Typography & Text Presets</h3>
        <p className="text-[11px] text-slate-500">
          Click any preset to insert formatted typography onto the canvas.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Standard Text Blocks */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Standard Blocks
          </h4>
          <button
            onClick={() => addText('Add Heading Text', true)}
            className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition font-bold text-base text-slate-900 flex items-center justify-between"
          >
            <span>Add Heading</span>
            <span className="text-[10px] text-slate-400 font-normal">Cinzel 28px</span>
          </button>

          <button
            onClick={() => addText('Add Subheading Text', false, { fontSize: 18, fontWeight: '600' })}
            className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition font-semibold text-sm text-slate-800 flex items-center justify-between"
          >
            <span>Add Subheading</span>
            <span className="text-[10px] text-slate-400 font-normal">Inter 18px</span>
          </button>

          <button
            onClick={() => addText('Add body paragraph text to describe the award or certificate details.', false)}
            className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition text-xs text-slate-600 flex items-center justify-between"
          >
            <span>Add Body Text</span>
            <span className="text-[10px] text-slate-400 font-normal">Inter 14px</span>
          </button>
        </div>

        {/* Certificate Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Certificate Presets
          </h4>

          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.title}
                onClick={() => {
                  if (preset.isDynamic && preset.dynamicKey) {
                    addDynamicField(preset.dynamicKey);
                  } else {
                    addText(preset.text || preset.title, !!preset.isHeading, preset.style);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-300 shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-800 group-hover:text-blue-900">{preset.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{preset.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
