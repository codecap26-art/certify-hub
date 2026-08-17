'use client';

import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Award,
} from 'lucide-react';
import { useEditor, SAMPLE_DATA } from '@/lib/editor/useEditorStore';
import { CanvasStage } from './CanvasStage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export const PreviewModal: React.FC<Props> = ({ isOpen, onClose, onDownloadPdf }) => {
  const { state, dispatch } = useEditor();
  const { document: doc } = state;
  const [zoom, setZoom] = useState(0.85);
  const [useSampleData, setUseSampleData] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md text-white animate-fade-in select-none">
      {/* Top Floating Control Bar */}
      <header className="h-14 px-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">{doc.name || 'Certificate Preview'}</h2>
            <p className="text-[10px] text-slate-400">
              {doc.width} × {doc.height} px · {doc.orientation.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Center: Zoom & Sample Data Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseSampleData(!useSampleData)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              useSampleData
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{useSampleData ? 'Sample Data View' : 'Token Placeholders'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs text-slate-300 px-2 min-w-[40px] text-center font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(0.85)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Download & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Test PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
            title="Close Preview (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Canvas Presentation Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-950/80">
        <CanvasStage
          width={doc.width}
          height={doc.height}
          backgroundColor={doc.backgroundColor}
          backgroundImageUrl={doc.backgroundDataUrl}
          elements={doc.elements}
          zoomLevel={zoom}
          isPreviewMode={true}
          sampleData={useSampleData ? SAMPLE_DATA : {}}
        />
      </div>
    </div>
  );
};
