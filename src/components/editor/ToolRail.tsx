'use client';

import React from 'react';
import {
  LayoutTemplate,
  Shapes,
  Type,
  Sparkles,
  Palette,
  Upload,
  Wrench,
  FolderOpen,
  ImageIcon,
  Layers,
} from 'lucide-react';
import { ToolPanelId, useEditor } from '@/lib/editor/useEditorStore';

interface ToolItem {
  id: ToolPanelId;
  label: string;
  icon: React.ElementType;
}

const TOOLS: ToolItem[] = [
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'dynamic', label: 'Dynamic', icon: Sparkles },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'background', label: 'Background', icon: ImageIcon },
  { id: 'layers', label: 'Layers', icon: Layers },
];

export const ToolRail: React.FC = () => {
  const { state, dispatch } = useEditor();

  return (
    <aside
      className="w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-2 gap-0.5 shrink-0 z-30"
      role="toolbar"
      aria-label="Design tools"
    >
      {TOOLS.map((tool) => {
        const isActive = state.activePanel === tool.id && state.isPanelOpen;
        const Icon = tool.icon;

        return (
          <button
            key={tool.id}
            onClick={() => dispatch({ type: 'SET_PANEL', panel: tool.id })}
            className={`
              relative w-[60px] flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl
              text-[10px] font-semibold transition-all duration-150 group
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
              ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }
            `}
            title={tool.label}
            aria-pressed={isActive}
            aria-label={tool.label}
          >
            {/* Active indicator — left border bar (non-colour indicator) */}
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-blue-600 rounded-r-full" />
            )}
            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
            <span className="leading-none">{tool.label}</span>
          </button>
        );
      })}
    </aside>
  );
};
