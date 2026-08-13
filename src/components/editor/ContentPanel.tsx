'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { TemplatesPanel } from './panels/TemplatesPanel';
import { ElementsPanel } from './panels/ElementsPanel';
import { TextPanel } from './panels/TextPanel';
import { DynamicFieldsPanel } from './panels/DynamicFieldsPanel';
import { BrandPanel } from './panels/BrandPanel';
import { UploadsPanel } from './panels/UploadsPanel';
import { ToolsPanel } from './panels/ToolsPanel';
import { ProjectsPanel } from './panels/ProjectsPanel';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { LayersPanel } from './panels/LayersPanel';

export const ContentPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const { activePanel, isPanelOpen } = state;

  if (!isPanelOpen || !activePanel) {
    return null;
  }

  const renderContent = () => {
    switch (activePanel) {
      case 'templates': return <TemplatesPanel />;
      case 'elements': return <ElementsPanel />;
      case 'text': return <TextPanel />;
      case 'dynamic': return <DynamicFieldsPanel />;
      case 'brand': return <BrandPanel />;
      case 'uploads': return <UploadsPanel />;
      case 'tools': return <ToolsPanel />;
      case 'projects': return <ProjectsPanel />;
      case 'background': return <BackgroundPanel />;
      case 'layers': return <LayersPanel />;
      default: return null;
    }
  };

  return (
    <div
      className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-xs relative transition-all duration-200"
      role="region"
      aria-label="Design options"
    >
      {/* Collapse button on right border */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_PANEL' })}
        className="absolute -right-3 top-4 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-xs transition z-30"
        title="Collapse panel"
        aria-label="Collapse panel"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {renderContent()}
    </div>
  );
};
