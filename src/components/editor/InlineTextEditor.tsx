'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DocumentElement } from '@/lib/editor/documentModel';

interface InlineTextEditorProps {
  element: DocumentElement;
  zoomLevel: number;
  showFieldNames: boolean;
  sampleData: Record<string, string>;
  onSave: (value: string) => void;
  onClose: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  element,
  zoomLevel,
  showFieldNames,
  sampleData,
  onSave,
  onClose,
}) => {
  const isDynamic = element.type === 'dynamic-text';
  const initialText = isDynamic
    ? element.fallbackValue || (element.dynamicBinding ? sampleData[element.dynamicBinding] || '' : '')
    : element.textValue || '';

  const [value, setValue] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleBlur = () => {
    onSave(value);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(value);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const fontSize = (element.textStyle?.fontSize || 16) * zoomLevel;
  const fontFamily = element.textStyle?.fontFamily || 'sans-serif';
  const fontWeight = element.textStyle?.fontWeight || 'normal';
  const fontStyle = element.textStyle?.fontStyle || 'normal';
  const color = element.textStyle?.fill || '#0F172A';
  const textAlign = element.textStyle?.align || 'left';

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        left: `${element.x * zoomLevel}px`,
        top: `${element.y * zoomLevel}px`,
        width: `${element.width * zoomLevel}px`,
        minHeight: `${element.height * zoomLevel}px`,
        fontSize: `${fontSize}px`,
        fontFamily,
        fontWeight,
        fontStyle,
        color,
        textAlign,
        lineHeight: 1.2,
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #3B82F6',
        borderRadius: '4px',
        outline: 'none',
        resize: 'both',
        padding: '0px 2px',
        zIndex: 50,
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
      }}
    />
  );
};
