'use client';

import React from 'react';
import {
  Grid,
  Magnet,
  Maximize2,
  Minimize2,
  Shield,
  Square,
  Sparkles,
  Layers,
  Ruler,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

export const BottomStatusBar: React.FC = () => {
  const { state, dispatch } = useEditor();
  const {
    document: doc,
    viewport,
    showGrid,
    snappingEnabled,
    showRulers,
    showSafeArea,
    showBleedArea,
    showFieldNames,
  } = state;

  return (
    <footer className="h-8 bg-white border-t border-slate-200 px-3 flex items-center justify-between text-[11px] text-slate-600 shadow-xs z-40 shrink-0 select-none">
      {/* ── Left: Document Dimensions & Element Count ── */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-700">
          {doc.width} × {doc.height} px
        </span>

        <span className="text-slate-300">·</span>

        <span className="text-slate-500">
          {doc.elements.length} element{doc.elements.length === 1 ? '' : 's'}
        </span>

        <span className="text-slate-300">·</span>

        {/* Sample Data Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_FIELD_NAMES' })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold transition ${
            showFieldNames
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Toggle between Field Tokens ({{name}}) and Live Sample Data"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{showFieldNames ? 'Token Names' : 'Sample Data View'}</span>
        </button>
      </div>

      {/* ── Right: Tool Toggles (Rulers, Grid, Snap, Safe Area, Bleed) ── */}
      <div className="flex items-center gap-1.5">
        {/* Rulers Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_RULERS' })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
            showRulers ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Toggle Rulers"
        >
          <Ruler className="w-3 h-3" />
          <span className="hidden sm:inline">Rulers</span>
        </button>

        {/* Grid Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
            showGrid ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Toggle Grid (20px)"
        >
          <Grid className="w-3 h-3" />
          <span className="hidden sm:inline">Grid</span>
        </button>

        {/* Snapping Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SNAPPING' })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
            snappingEnabled ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Toggle Smart Snapping Guides"
        >
          <Magnet className="w-3 h-3" />
          <span className="hidden sm:inline">Snap</span>
        </button>

        {/* Safe Margins Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SAFE_AREA' })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
            showSafeArea ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Toggle Safe Margins (Print safe boundary)"
        >
          <Shield className="w-3 h-3" />
          <span className="hidden md:inline">Safe Margin</span>
        </button>

        {/* Bleed Area Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_BLEED_AREA' })}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
            showBleedArea ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Toggle Bleed Boundary (8px cut-line)"
        >
          <Square className="w-3 h-3" />
          <span className="hidden md:inline">Bleed</span>
        </button>
      </div>
    </footer>
  );
};
