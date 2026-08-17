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
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { CommandPalette } from './CommandPalette';
import { PreviewModal } from './PreviewModal';
import { LocalRecoveryModal } from './LocalRecoveryModal';
import { templateRepository } from '@/lib/storage/templateRepository';
import { generatePdfFromCustomTemplate } from '@/lib/certificate/customPdfGenerator';
import { demoOrganization } from '@/lib/demo-data';

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
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [recoveryDraft, setRecoveryDraft] = useState<CertificateDocument | null>(null);

  // Check for local crash recovery drafts
  useEffect(() => {
    if (typeof window !== 'undefined' && state.document.id) {
      try {
        const saved = localStorage.getItem(`certifyhub:v1:draft_${state.document.id}`);
        if (saved) {
          const parsed = JSON.parse(saved) as CertificateDocument;
          const parsedTime = new Date(parsed.updatedAt || 0).getTime();
          const docTime = new Date(state.document.updatedAt || 0).getTime();
          if (parsedTime > docTime + 1000) {
            setRecoveryDraft(parsed);
          }
        }
      } catch {
        // ignore storage parse errors
      }
    }
  }, [state.document.id]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'z') {
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
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          // Ungroup
          const primary = state.document.elements.find((el) => state.selection.selectedIds.includes(el.id));
          if (primary?.groupId) {
            dispatch({ type: 'UNGROUP', groupId: primary.groupId });
          }
        } else if (state.selection.selectedIds.length > 1) {
          // Group
          dispatch({ type: 'GROUP_ELEMENTS', ids: state.selection.selectedIds });
        }
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        state.selection.selectedIds.forEach((id) => {
          const elem = state.document.elements.find((el) => el.id === id);
          if (elem && (elem.type === 'text' || elem.type === 'dynamic-text') && elem.textStyle && !elem.locked) {
            const isBold = elem.textStyle.fontWeight === 'bold' || elem.textStyle.fontWeight === '700';
            dispatch({
              type: 'UPDATE_ELEMENT',
              id,
              attrs: {
                textStyle: {
                  ...elem.textStyle,
                  fontWeight: isBold ? 'normal' : 'bold',
                },
              },
              label: 'Toggle bold',
            });
          }
        });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        state.selection.selectedIds.forEach((id) => {
          const elem = state.document.elements.find((el) => el.id === id);
          if (elem && (elem.type === 'text' || elem.type === 'dynamic-text') && elem.textStyle && !elem.locked) {
            const isItalic = elem.textStyle.fontStyle === 'italic';
            dispatch({
              type: 'UPDATE_ELEMENT',
              id,
              attrs: {
                textStyle: {
                  ...elem.textStyle,
                  fontStyle: isItalic ? 'normal' : 'italic',
                },
              },
              label: 'Toggle italic',
            });
          }
        });
      } else if (ctrlOrCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        dispatch({ type: 'CLEAR_SELECTION' });
        setShowCommandPalette(false);
        setShowPreviewModal(false);
        setShowShortcutsModal(false);
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

  const handleDownloadTestPdf = async () => {
    try {
      const sampleCert: import('@/types').CertificateRecord = {
        id: 'cert-preview-test',
        certificateCode: 'CERT-2026-TEST-001',
        verificationToken: '550e8400-e29b-41d4-a716-446655440000',
        eventId: 'evt-test',
        recipientId: 'rec-test',
        templateId: state.document.id as any,
        organizationSnapshot: demoOrganization,
        eventSnapshot: {
          id: 'evt-test',
          name: 'AI & SOFTWARE INNOVATION CHALLENGE 2026',
          eventType: 'Competition',
          description: 'Annual National AI Development Hackathon',
          startDate: '2026-03-10',
          endDate: '2026-03-12',
          location: 'Technology Auditorium',
          certificateType: 'Achievement',
          coordinatorName: 'Dr. V. Ramanathan',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        recipientSnapshot: {
          id: 'rec-test',
          eventId: 'evt-test',
          fullName: 'SUBASH P',
          email: 'subash@example.com',
          registrationNumber: '23CS101',
          department: 'Computer Science & Engineering',
          course: 'Artificial Intelligence & Systems',
          achievement: '1st Place Winner - Grand Hackathon Champion',
          category: 'winner',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        status: 'Valid',
        generatedAt: new Date().toISOString(),
      };

      const pdfBytes = await generatePdfFromCustomTemplate(
        sampleCert,
        state.document as unknown as CustomTemplate,
      );

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(state.document.name || 'certificate').toLowerCase().replace(/\s+/g, '-')}-test.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Unable to generate PDF preview.');
    }
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
        onOpenPreview={() => setShowPreviewModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
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

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenPreview={() => {
          setShowCommandPalette(false);
          setShowPreviewModal(true);
        }}
      />

      {/* Fullscreen Preview Modal */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onDownloadPdf={handleDownloadTestPdf}
      />

      {/* Local Crash Recovery Modal */}
      {recoveryDraft && (
        <LocalRecoveryModal
          isOpen={Boolean(recoveryDraft)}
          draftDoc={recoveryDraft}
          onRestore={() => {
            dispatch({ type: 'SET_DOCUMENT', doc: recoveryDraft });
            setRecoveryDraft(null);
          }}
          onDiscard={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`certifyhub:v1:draft_${state.document.id}`);
            }
            setRecoveryDraft(null);
          }}
        />
      )}

      {/* Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
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
