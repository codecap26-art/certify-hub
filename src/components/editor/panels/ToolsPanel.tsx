'use client';

import React, { useState } from 'react';
import {
  Wrench,
  QrCode,
  ShieldCheck,
  Crop,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

export const ToolsPanel: React.FC = () => {
  const { addQrCode, addShape, dispatch, state } = useEditor();
  const [qualityResults, setQualityResults] = useState<Array<{ type: 'error' | 'warning' | 'pass'; text: string }> | null>(null);

  const runQualityCheck = () => {
    const results: Array<{ type: 'error' | 'warning' | 'pass'; text: string }> = [];
    const { elements, backgroundDataUrl, backgroundColor } = state.document;

    // Check recipient name binding
    const hasRecipientName = elements.some((e) => e.dynamicBinding === '{{recipient.name}}');
    if (hasRecipientName) {
      results.push({ type: 'pass', text: 'Recipient Name binding present.' });
    } else {
      results.push({ type: 'error', text: 'Missing Recipient Name field ({{recipient.name}}).' });
    }

    // Check QR code
    const hasQr = elements.some((e) => e.type === 'qr');
    if (hasQr) {
      results.push({ type: 'pass', text: 'Verification QR code included.' });
    } else {
      results.push({ type: 'warning', text: 'No verification QR code found. Recommended for authenticity.' });
    }

    // Check background
    if (backgroundDataUrl || backgroundColor !== '#FFFFFF') {
      results.push({ type: 'pass', text: 'Custom background configured.' });
    } else {
      results.push({ type: 'warning', text: 'Canvas is solid white with no background image.' });
    }

    // Check element overflow
    const overflow = elements.some(
      (e) => e.x < 0 || e.y < 0 || e.x + e.width > state.document.width || e.y + e.height > state.document.height,
    );
    if (overflow) {
      results.push({ type: 'warning', text: 'Some elements extend beyond document printable bounds.' });
    } else {
      results.push({ type: 'pass', text: 'All elements within document boundaries.' });
    }

    setQualityResults(results);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-blue-600" />
          Utility Tools
        </h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Specialized editor helpers and validation.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Verification & Audit Tool */}
        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-blue-600" />
            Quality & Print Auditor
          </h4>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Scan your certificate design for missing fields, overflow, and print readiness before batch generation.
          </p>
          <button
            onClick={runQualityCheck}
            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Run Quality Audit
          </button>

          {qualityResults && (
            <div className="mt-3 space-y-1.5 bg-white border border-blue-100 rounded-lg p-2.5">
              {qualityResults.map((res, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px]">
                  {res.type === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                  {res.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                  {res.type === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
                  <span
                    className={
                      res.type === 'pass'
                        ? 'text-slate-700'
                        : res.type === 'warning'
                        ? 'text-amber-800 font-medium'
                        : 'text-rose-800 font-bold'
                    }
                  >
                    {res.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text Masking Box */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-slate-800">Text Masking</h4>
          <p className="text-[10px] text-slate-500">
            Overlay solid rectangles to cover sample text on imported pre-printed certificates.
          </p>
          <button
            onClick={() => addShape('rectangle', true)}
            className="w-full p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            Add White Masking Box
          </button>
        </div>

        {/* Dynamic Field Preview Switcher */}
        <div className="space-y-1.5 border-t border-slate-100 pt-3">
          <h4 className="text-xs font-bold text-slate-800">Dynamic Display</h4>
          <p className="text-[10px] text-slate-500">Toggle between placeholder keys and sample recipient data.</p>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FIELD_NAMES' })}
            className="w-full p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            {state.showFieldNames ? 'Switch to Sample Data' : 'Switch to Field Keys'}
          </button>
        </div>

        {/* QR Code */}
        <div className="space-y-1.5 border-t border-slate-100 pt-3">
          <h4 className="text-xs font-bold text-slate-800">Verification Token</h4>
          <button
            onClick={() => addQrCode()}
            className="w-full p-2 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg text-xs font-bold text-teal-800 flex items-center justify-center gap-1.5 transition"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-600" />
            Add Verification QR Code
          </button>
        </div>
      </div>
    </div>
  );
};
