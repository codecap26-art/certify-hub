'use client';

import React from 'react';
import Link from 'next/link';
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Save,
  Download,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface Props {
  templateName: string;
  onNameChange: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
  onDownloadTestPdf: () => void;
  onUseInGenerator?: () => void;
  onExit: () => void;
  saveStatus?: 'Saving...' | 'Saved' | 'Unsaved changes' | 'Save failed';
  isSaving?: boolean;
}

export const EditorToolbar: React.FC<Props> = ({
  templateName,
  onNameChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isPreviewMode,
  onTogglePreview,
  onSave,
  onDownloadTestPdf,
  onUseInGenerator,
  onExit,
  saveStatus = 'Saved',
  isSaving,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-slate-800 shadow-xs z-30">
      {/* Left: Back / Exit & Template Name & Save Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
          title="Back to Certificate Studio"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200" />

        <input
          type="text"
          value={templateName}
          onChange={(e) => onNameChange(e.target.value)}
          className="font-bold text-sm text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-blue-500 border border-transparent rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-xs"
          placeholder="Template Name..."
        />

        {/* Save Status Badge */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            saveStatus === 'Saved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : saveStatus === 'Saving...'
              ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
              : saveStatus === 'Unsaved changes'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          aria-live="polite"
        >
          {saveStatus}
        </span>
      </div>

      {/* Center: History Undo/Redo & Zoom Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-30 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-30 transition"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200" />

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs text-slate-700 px-2 min-w-[48px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onZoomReset}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Actions: Preview, Test PDF, Use in Generator, Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            isPreviewMode
              ? 'bg-teal-50 text-teal-700 border-teal-200 font-bold'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-teal-600" />
          <span>{isPreviewMode ? 'Editing Mode' : 'Preview Data'}</span>
        </button>

        <button
          onClick={onDownloadTestPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Test PDF</span>
        </button>

        {onUseInGenerator && (
          <button
            onClick={onUseInGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition shadow-xs"
            title="Save and use this design in Certificate Generator"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Use in Generator</span>
          </button>
        )}

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Design'}</span>
        </button>
      </div>
    </header>
  );
};
