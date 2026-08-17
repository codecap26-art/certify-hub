'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Save,
  Download,
  Sparkles,
  Search,
  Printer,
  ChevronDown,
  Clock,
  Keyboard,
  FileText,
  Image as ImageIcon,
  Check,
  Building2,
  Layers,
} from 'lucide-react';
import { useEditor, canUndo, canRedo } from '@/lib/editor/useEditorStore';
import { CANVAS_PRESETS } from '@/lib/editor/documentModel';

interface Props {
  onExit: () => void;
  onDownloadTestPdf: () => void;
  onExportPng?: () => void;
  onExportJpg?: () => void;
  onUseInGenerator: () => void;
  onOpenPreview: () => void;
  onOpenCommandPalette?: () => void;
  onShowShortcuts?: () => void;
}

export const TopApplicationBar: React.FC<Props> = ({
  onExit,
  onDownloadTestPdf,
  onExportPng,
  onExportJpg,
  onUseInGenerator,
  onOpenPreview,
  onOpenCommandPalette,
  onShowShortcuts,
}) => {
  const { state, dispatch, save, createVersionSnapshot } = useEditor();
  const { document: doc, saveStatus, viewport } = state;

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportMenuOpen(false);
      if (printRef.current && !printRef.current.contains(e.target as Node)) setPrintMenuOpen(false);
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setHistoryMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-12 bg-white border-b border-slate-200 px-3 flex items-center justify-between text-slate-800 shadow-xs z-40 shrink-0 select-none">
      {/* ── Left: Back + Name + Save Status ── */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onExit}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1 text-[11px] font-semibold shrink-0"
          title="Return to Studio Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Studio</span>
        </button>

        <div className="h-4 w-px bg-slate-200 shrink-0" />

        {/* CertifyHub Wordmark */}
        <span className="text-[11px] font-black text-blue-600 tracking-tight shrink-0 hidden md:block">
          CertifyHub
        </span>

        {/* Design Title */}
        <input
          type="text"
          value={doc.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
          className="font-bold text-xs text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-blue-500 border border-transparent rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-0 max-w-[180px] truncate"
          placeholder="Design name..."
        />

        {/* Save Status Badge */}
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
            saveStatus === 'Saved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : saveStatus === 'Saving...'
              ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
              : saveStatus === 'Unsaved changes'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {saveStatus}
        </span>
      </div>

      {/* ── Center: History + Zoom + Command Palette Trigger ── */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={!canUndo(state.history)}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-25 transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={!canRedo(state.history)}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-25 transition"
            title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Command Palette Button */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold transition"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Quick Find</span>
            <kbd className="text-[9px] font-mono text-slate-400 bg-white px-1 py-0.2 rounded border border-slate-200">
              Ctrl+K
            </kbd>
          </button>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => dispatch({ type: 'ZOOM_OUT' })}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[10px] font-bold text-slate-700 px-1.5 min-w-[36px] text-center">
            {Math.round(viewport.zoom * 100)}%
          </span>
          <button
            onClick={() => dispatch({ type: 'ZOOM_IN' })}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              dispatch({
                type: 'ZOOM_FIT',
                containerWidth: window.innerWidth - 320,
                containerHeight: window.innerHeight - 130,
              })
            }
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Zoom to Fit"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Right: Page Dimensions, Version History, Preview & Export ── */}
      <div className="flex items-center gap-1.5">
        {/* Dimensions & Page Size Presets */}
        <div className="relative" ref={printRef}>
          <button
            onClick={() => setPrintMenuOpen(!printMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
            title="Canvas Dimensions & Presets"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">{doc.width} × {doc.height}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {printMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 text-xs">
              <p className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Paper Size Presets
              </p>
              {CANVAS_PRESETS.map((preset) => {
                const isActive = doc.width === preset.width && doc.height === preset.height;
                return (
                  <button
                    key={preset.name}
                    onClick={() => {
                      dispatch({
                        type: 'SET_CANVAS_DIMENSIONS',
                        width: preset.width,
                        height: preset.height,
                        orientation: preset.orientation,
                      });
                      setPrintMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      isActive ? 'bg-blue-50 text-blue-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {preset.width}×{preset.height}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Version History Dropdown */}
        <div className="relative" ref={historyRef}>
          <button
            onClick={() => setHistoryMenuOpen(!historyMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
            title="Version History & Snapshots"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {historyMenuOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-900">Version History</span>
                <button
                  onClick={() => {
                    createVersionSnapshot(`Snapshot ${new Date().toLocaleTimeString()}`);
                    setHistoryMenuOpen(false);
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  + Snapshot
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {(doc.versionHistory || []).length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-3 text-center">No snapshots saved yet.</p>
                ) : (
                  doc.versionHistory?.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        dispatch({ type: 'RESTORE_VERSION_SNAPSHOT', snapshotId: v.id });
                        setHistoryMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 text-left text-xs transition"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{v.label}</p>
                        <p className="text-[10px] text-slate-400">{new Date(v.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600">Restore</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview Button */}
        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold transition"
          title="Open Fullscreen Preview Mode"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        {/* Save Button with Label */}
        <button
          onClick={() => save()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
            saveStatus === 'Saved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              : saveStatus === 'Saving...'
              ? 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 shadow-xs'
          }`}
          title="Save Design (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{saveStatus === 'Saved' ? 'Saved' : saveStatus === 'Saving...' ? 'Saving...' : 'Save Template'}</span>
        </button>

        {/* Use in Generator Quick Button */}
        <button
          onClick={onUseInGenerator}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          title="Save and Return to Certificate Generator"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Use in Generator</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-1">
              <button
                onClick={() => {
                  onDownloadTestPdf();
                  setExportMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 text-left text-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Test PDF Preview</p>
                  <p className="text-[10px] text-slate-400">High-resolution vector PDF</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (onExportPng) onExportPng();
                  else onDownloadTestPdf();
                  setExportMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 text-left text-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Download PNG Image</p>
                  <p className="text-[10px] text-slate-400">Digital certificate graphic</p>
                </div>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  onUseInGenerator();
                  setExportMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-blue-700">Use in Bulk Generator</p>
                  <p className="text-[10px] text-blue-500">Generate recipients in batch</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
