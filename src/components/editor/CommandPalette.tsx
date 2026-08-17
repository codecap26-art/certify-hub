'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Type,
  Square,
  Image,
  QrCode,
  Shield,
  Layers,
  Save,
  Download,
  Eye,
  Grid,
  Maximize2,
  AlignCenter,
  Group,
  Ungroup,
  Trash2,
  Copy,
  Sparkles,
  Command,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview?: () => void;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, onOpenPreview }) => {
  const {
    state,
    dispatch,
    addText,
    addShape,
    addQrCode,
    addBorder,
    deleteSelected,
    duplicateSelected,
    save,
  } = useEditor();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMulti = state.selection.selectedIds.length > 1;

  const commands: CommandItem[] = [
    // Add Elements
    { id: 'add-heading', title: 'Add Heading Text', category: 'Insert', icon: Type, action: () => addText('CERTIFICATE TITLE', true) },
    { id: 'add-body', title: 'Add Body Text', category: 'Insert', icon: Type, action: () => addText('This is to certify that...', false) },
    { id: 'add-recipient', title: 'Add Recipient Name (Dynamic)', category: 'Insert', icon: Sparkles, action: () => dispatch({ type: 'ADD_ELEMENT', element: import('@/lib/editor/documentModel').then(m => m.createDynamicTextElement('{{recipient.name}}', state.document.width, state.document.height, 10)) as unknown as import('@/lib/editor/documentModel').DocumentElement }) },
    { id: 'add-rect', title: 'Add Rectangle', category: 'Shapes', icon: Square, action: () => addShape('rectangle') },
    { id: 'add-rounded', title: 'Add Rounded Rectangle', category: 'Shapes', icon: Square, action: () => addShape('rounded-rectangle') },
    { id: 'add-circle', title: 'Add Circle', category: 'Shapes', icon: Square, action: () => addShape('circle') },
    { id: 'add-star', title: 'Add Star', category: 'Shapes', icon: Square, action: () => addShape('star') },
    { id: 'add-seal', title: 'Add Official Seal', category: 'Shapes', icon: Shield, action: () => addShape('seal') },
    { id: 'add-border', title: 'Add Certificate Border', category: 'Insert', icon: Square, action: () => addBorder() },
    { id: 'add-qr', title: 'Add Verification QR Code', category: 'Insert', icon: QrCode, action: () => addQrCode() },

    // Alignment & Arrange
    { id: 'align-center-canvas', title: 'Align Center to Canvas', category: 'Arrange', icon: AlignCenter, action: () => dispatch({ type: 'ALIGN', alignment: 'center', relativeTo: 'canvas' }) },
    { id: 'align-middle-canvas', title: 'Align Middle to Canvas', category: 'Arrange', icon: AlignCenter, action: () => dispatch({ type: 'ALIGN', alignment: 'middle', relativeTo: 'canvas' }) },
    { id: 'align-left', title: 'Align Left', category: 'Arrange', icon: AlignCenter, action: () => dispatch({ type: 'ALIGN', alignment: 'left' }) },
    { id: 'align-right', title: 'Align Right', category: 'Arrange', icon: AlignCenter, action: () => dispatch({ type: 'ALIGN', alignment: 'right' }) },
    { id: 'distribute-h', title: 'Distribute Horizontally', category: 'Arrange', icon: AlignCenter, action: () => dispatch({ type: 'DISTRIBUTE', direction: 'horizontal' }) },
    { id: 'distribute-v', title: 'Distribute Vertically', category: 'Arrange', icon: AlignCenter, action: () => dispatch({ type: 'DISTRIBUTE', direction: 'vertical' }) },

    // Selection & Edit
    { id: 'select-all', title: 'Select All Elements', category: 'Edit', icon: Layers, shortcut: 'Ctrl+A', action: () => dispatch({ type: 'SELECT_ALL' }) },
    { id: 'duplicate', title: 'Duplicate Selection', category: 'Edit', icon: Copy, shortcut: 'Ctrl+D', action: () => duplicateSelected() },
    { id: 'delete', title: 'Delete Selection', category: 'Edit', icon: Trash2, shortcut: 'Delete', action: () => deleteSelected() },
    { id: 'group', title: 'Group Selected Elements', category: 'Edit', icon: Group, shortcut: 'Ctrl+G', action: () => isMulti && dispatch({ type: 'GROUP_ELEMENTS', ids: state.selection.selectedIds }) },

    // View & Toggles
    { id: 'toggle-preview', title: 'Toggle Preview Mode', category: 'View', icon: Eye, action: () => onOpenPreview ? onOpenPreview() : dispatch({ type: 'TOGGLE_PREVIEW' }) },
    { id: 'toggle-grid', title: 'Toggle Grid Overlay', category: 'View', icon: Grid, action: () => dispatch({ type: 'TOGGLE_GRID' }) },
    { id: 'toggle-rulers', title: 'Toggle Rulers', category: 'View', icon: Grid, action: () => dispatch({ type: 'TOGGLE_RULERS' }) },
    { id: 'toggle-snapping', title: 'Toggle Smart Snapping', category: 'View', icon: Grid, action: () => dispatch({ type: 'TOGGLE_SNAPPING' }) },
    { id: 'toggle-safe-area', title: 'Toggle Safe Margins', category: 'View', icon: Grid, action: () => dispatch({ type: 'TOGGLE_SAFE_AREA' }) },
    { id: 'toggle-bleed', title: 'Toggle Bleed Area', category: 'View', icon: Grid, action: () => dispatch({ type: 'TOGGLE_BLEED_AREA' }) },
    { id: 'zoom-fit', title: 'Zoom to Fit Canvas', category: 'View', icon: Maximize2, action: () => dispatch({ type: 'ZOOM_FIT', containerWidth: window.innerWidth - 300, containerHeight: window.innerHeight - 150 }) },

    // Document
    { id: 'save-doc', title: 'Save Certificate Design', category: 'File', icon: Save, shortcut: 'Ctrl+S', action: () => save() },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[480px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search action... (e.g. Add Text, Align, Grid)"
            className="w-full text-sm text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                    isSelected ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{cmd.title}</p>
                      <p className="text-[10px] text-slate-400">{cmd.category}</p>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isSelected ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> CertifyHub Studio
          </span>
        </div>
      </div>
    </div>
  );
};
