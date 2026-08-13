'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TopApplicationBar } from './TopApplicationBar';
import { ToolRail } from './ToolRail';
import { ContentPanel } from './ContentPanel';
import { ContextualToolbar } from './ContextualToolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { BottomStatusBar } from './BottomStatusBar';
import { EditorProvider, useEditor } from '@/lib/editor/useEditorStore';
import { CustomTemplate } from '@/types/template';
import { CertificateDocument, migrateFromLegacy } from '@/lib/editor/documentModel';
import { templateRepository } from '@/lib/storage/templateRepository';

// SSR-disabled Konva canvas stage
const CanvasStage = dynamic(
  () => import('./CanvasStage').then((mod) => mod.CanvasStage),
  { ssr: false },
);

interface Props {
  initialTemplate: CustomTemplate;
  onExit: () => void;
}

const EditorInner: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { state, dispatch, save, deleteSelected, duplicateSelected } = useEditor();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) dispatch({ type: 'REDO' });
        else dispatch({ type: 'UNDO' });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        dispatch({ type: 'COPY' });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        dispatch({ type: 'CUT' });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        dispatch({ type: 'PASTE' });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        dispatch({ type: 'SELECT_ALL' });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        dispatch({ type: 'CLEAR_SELECTION' });
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && state.selection.selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        state.selection.selectedIds.forEach((id) => {
          const elem = state.document.elements.find((el) => el.id === id);
          if (elem && !elem.locked) {
            let { x, y } = elem;
            if (e.key === 'ArrowUp') y -= step;
            if (e.key === 'ArrowDown') y += step;
            if (e.key === 'ArrowLeft') x -= step;
            if (e.key === 'ArrowRight') x += step;
            dispatch({ type: 'UPDATE_ELEMENT', id, attrs: { x, y }, coalesce: true, label: 'Nudge element' });
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, save, deleteSelected, duplicateSelected, state.selection.selectedIds, state.document.elements]);

  const handleDownloadTestPdf = () => {
    alert('Generating test PDF preview sample...');
  };

  const handleUseInGenerator = async () => {
    await save();
    if (typeof window !== 'undefined') {
      window.location.href = `/generate?templateId=${state.document.id}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Application Bar */}
      <TopApplicationBar
        onExit={onExit}
        onDownloadTestPdf={handleDownloadTestPdf}
        onUseInGenerator={handleUseInGenerator}
        onShowShortcuts={() => setShowShortcutsModal(true)}
      />

      {/* Main Studio Workbench */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Tool Rail */}
        <ToolRail />

        {/* Collapsible Content Panel */}
        <ContentPanel />

        {/* Central Viewport & Canvas Stage */}
        <main className="flex-1 bg-slate-200 overflow-auto flex items-center justify-center relative">
          {/* Floating Contextual Toolbar over selection */}
          <ContextualToolbar />

          <CanvasStage />
        </main>

        {/* Right Properties Inspector */}
        <PropertiesPanel />
      </div>

      {/* Bottom Status Bar */}
      <BottomStatusBar />

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between border-b py-1"><span>Undo</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + Z</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Redo</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + Y</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Save</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + S</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Copy</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + C</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Cut</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + X</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Paste</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + V</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Duplicate</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + D</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Select All</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Ctrl + A</kbd></div>
              <div className="flex justify-between border-b py-1"><span>Delete</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Delete / Backspace</kbd></div>
              <div className="flex justify-between py-1"><span>Nudge 1px / 10px</span><kbd className="font-mono bg-slate-100 px-1.5 rounded">Arrows / Shift+Arrows</kbd></div>
            </div>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="mt-6 w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const EditorContainer: React.FC<Props> = ({ initialTemplate, onExit }) => {
  // Convert legacy CustomTemplate to normalized CertificateDocument
  const initialDocument: CertificateDocument = migrateFromLegacy(initialTemplate as unknown as Record<string, unknown>);

  const handleSave = async (doc: CertificateDocument) => {
    await templateRepository.save(doc as unknown as CustomTemplate);
  };

  return (
    <EditorProvider initialDocument={initialDocument} onSave={handleSave}>
      <EditorInner onExit={onExit} />
    </EditorProvider>
  );
};
