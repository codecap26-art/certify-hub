'use client';

import React from 'react';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  Save,
  Download,
  Sparkles,
  MoreHorizontal,
  Monitor,
  Users,
  Share2,
  Keyboard,
  Grid,
} from 'lucide-react';
import { useEditor, canUndo, canRedo } from '@/lib/editor/useEditorStore';

interface Props {
  onExit: () => void;
  onDownloadTestPdf: () => void;
  onUseInGenerator: () => void;
  onShowShortcuts?: () => void;
}

export const TopApplicationBar: React.FC<Props> = ({
  onExit,
  onDownloadTestPdf,
  onUseInGenerator,
  onShowShortcuts,
}) => {
  const { state, dispatch, save } = useEditor();
  const { document: doc, saveStatus, isPreviewMode, viewport } = state;
  const [showMore, setShowMore] = React.useState(false);

  return (
    <header className="h-12 bg-white border-b border-slate-200 px-3 flex items-center justify-between text-slate-800 shadow-xs z-40 shrink-0">
      {/* Left: Back + Name + Save Status */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onExit}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition flex items-center gap-1 text-[11px] font-semibold shrink-0"
          title="Back to Certificate Studio"
          aria-label="Back to Certificate Studio"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Studio</span>
        </button>

        <div className="h-4 w-px bg-slate-200 shrink-0" />

        {/* CertifyHub wordmark */}
        <span className="text-[11px] font-black text-blue-600 tracking-tight shrink-0 hidden md:block">
          CertifyHub
        </span>

        <input
          type="text"
          value={doc.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
          className="font-bold text-sm text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-blue-500 border border-transparent rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-0 max-w-[200px] truncate"
          placeholder="Design name..."
          aria-label="Design name"
        />

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
          aria-live="polite"
          role="status"
        >
          {saveStatus}
        </span>
      </div>

      {/* Center: History + Zoom */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={!canUndo(state.history)}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-25 transition"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={!canRedo(state.history)}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 disabled:opacity-25 transition"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => dispatch({ type: 'ZOOM_OUT' })}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-slate-700 px-1.5 min-w-[40px] text-center select-none">
            {Math.round(viewport.zoom * 100)}%
          </span>
          <button
            onClick={() => dispatch({ type: 'ZOOM_IN' })}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'ZOOM_100' })}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition text-[10px] font-bold"
            title="100%"
            aria-label="Zoom to 100%"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              dispatch({ type: 'ZOOM_FIT', containerWidth: window.innerWidth - 400, containerHeight: window.innerHeight - 100 })
            }
            className="p-1.5 rounded-md hover:bg-white text-slate-600 transition"
            title="Fit Page"
            aria-label="Fit page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
            isPreviewMode
              ? 'bg-teal-50 text-teal-700 border-teal-200 font-bold'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title={isPreviewMode ? 'Exit Preview' : 'Preview'}
          aria-label={isPreviewMode ? 'Exit preview mode' : 'Enter preview mode'}
        >
          {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden lg:inline">{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
        </button>

        <button
          onClick={onDownloadTestPdf}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition"
          title="Download Test PDF"
          aria-label="Download test PDF"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden lg:inline">Test PDF</span>
        </button>

        <button
          onClick={onUseInGenerator}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
          title="Save and use in Certificate Generator"
          aria-label="Use in generator"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden xl:inline">Generator</span>
        </button>

        <button
          onClick={() => save()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
          title="Save (Ctrl+S)"
          aria-label="Save design"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* More actions dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
            title="More actions"
            aria-label="More actions"
            aria-expanded={showMore}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMore && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                <button
                  onClick={() => {
                    setShowMore(false);
                    dispatch({ type: 'TOGGLE_FIELD_NAMES' });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  {state.showFieldNames ? 'Show Sample Data' : 'Show Field Names'}
                </button>
                <button
                  onClick={() => {
                    setShowMore(false);
                    dispatch({ type: 'TOGGLE_RULERS' });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  {state.showRulers ? 'Hide Rulers' : 'Show Rulers'}
                </button>
                <button
                  onClick={() => {
                    setShowMore(false);
                    dispatch({ type: 'TOGGLE_GRID' });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Grid className="w-3.5 h-3.5 text-slate-400" />
                  {state.showGrid ? 'Hide Grid' : 'Show Grid'}
                </button>
                <button
                  onClick={() => {
                    setShowMore(false);
                    dispatch({ type: 'TOGGLE_SAFE_AREA' });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  {state.showSafeArea ? 'Hide Safe Area' : 'Show Safe Area'}
                </button>
                <button
                  onClick={() => {
                    setShowMore(false);
                    dispatch({ type: 'TOGGLE_SNAPPING' });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {state.snappingEnabled ? 'Disable Snapping' : 'Enable Snapping'}
                </button>
                <div className="border-t border-slate-100 my-1" />
                {onShowShortcuts && (
                  <button
                    onClick={() => {
                      setShowMore(false);
                      onShowShortcuts();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                    Keyboard Shortcuts
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
