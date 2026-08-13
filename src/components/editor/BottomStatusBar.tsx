'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Monitor, Layers } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

export const BottomStatusBar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { document: doc, viewport, selection } = state;

  const selCount = selection.selectedIds.length;
  const elemCount = doc.elements.length;

  return (
    <footer className="h-8 bg-white border-t border-slate-200 px-3 flex items-center justify-between text-[10px] text-slate-500 font-medium z-30 shrink-0">
      {/* Left info */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-400" />
          {elemCount} element{elemCount !== 1 ? 's' : ''}
        </span>
        {selCount > 0 && (
          <span className="text-blue-600 font-semibold">
            {selCount} selected
          </span>
        )}
        <span className="text-slate-400">
          {doc.width} × {doc.height} pt ({doc.orientation})
        </span>
      </div>

      {/* Right zoom controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => dispatch({ type: 'ZOOM_OUT' })}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-3 h-3" />
        </button>

        <input
          type="range"
          min={15}
          max={300}
          step={5}
          value={Math.round(viewport.zoom * 100)}
          onChange={(e) =>
            dispatch({
              type: 'SET_VIEWPORT',
              viewport: { ...viewport, zoom: parseInt(e.target.value, 10) / 100 },
            })
          }
          className="w-20 h-1 accent-blue-600"
          title={`Zoom: ${Math.round(viewport.zoom * 100)}%`}
          aria-label="Zoom slider"
        />

        <span className="font-mono w-9 text-center text-slate-600">
          {Math.round(viewport.zoom * 100)}%
        </span>

        <button
          onClick={() => dispatch({ type: 'ZOOM_IN' })}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-3 h-3" />
        </button>

        <div className="w-px h-3 bg-slate-200" />

        <button
          onClick={() =>
            dispatch({
              type: 'ZOOM_FIT',
              containerWidth: window.innerWidth - 400,
              containerHeight: window.innerHeight - 100,
            })
          }
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          title="Fit Page"
          aria-label="Fit page in view"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
        <button
          onClick={() => dispatch({ type: 'ZOOM_100' })}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          title="100%"
          aria-label="Zoom to 100%"
        >
          <Monitor className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
};
