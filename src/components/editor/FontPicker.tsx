'use client';

import React from 'react';

export interface FontOption {
  name: string;
  family: string;
  category: 'Serif' | 'Sans Serif' | 'Elegant' | 'Modern' | 'Display';
}

export const FONT_OPTIONS: FontOption[] = [
  // Serif
  { name: 'Cinzel', family: 'Cinzel, serif', category: 'Serif' },
  { name: 'Playfair Display', family: 'Playfair Display, serif', category: 'Serif' },
  { name: 'Georgia', family: 'Georgia, serif', category: 'Serif' },
  { name: 'Times New Roman', family: 'Times New Roman, serif', category: 'Serif' },

  // Sans Serif
  { name: 'Inter', family: 'Inter, sans-serif', category: 'Sans Serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans Serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Sans Serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Sans Serif' },

  // Elegant
  { name: 'Great Vibes', family: 'Great Vibes, cursive', category: 'Elegant' },
  { name: 'Alex Brush', family: 'Alex Brush, cursive', category: 'Elegant' },

  // Modern
  { name: 'Outfit', family: 'Outfit, sans-serif', category: 'Modern' },
];

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
  className?: string;
}

export const FontPicker: React.FC<FontPickerProps> = ({ value, onChange, className }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none cursor-pointer ${
        className || ''
      }`}
    >
      <optgroup label="Serif (Classic & Formal)">
        {FONT_OPTIONS.filter((f) => f.category === 'Serif').map((f) => (
          <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
            {f.name}
          </option>
        ))}
      </optgroup>

      <optgroup label="Sans Serif (Clean & Neutral)">
        {FONT_OPTIONS.filter((f) => f.category === 'Sans Serif').map((f) => (
          <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
            {f.name}
          </option>
        ))}
      </optgroup>

      <optgroup label="Elegant (Calligraphy)">
        {FONT_OPTIONS.filter((f) => f.category === 'Elegant').map((f) => (
          <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
            {f.name}
          </option>
        ))}
      </optgroup>

      <optgroup label="Modern (Geometric)">
        {FONT_OPTIONS.filter((f) => f.category === 'Modern').map((f) => (
          <option key={f.name} value={f.name} style={{ fontFamily: f.family }}>
            {f.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
};
