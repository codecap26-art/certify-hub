'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Square,
  Circle,
  Triangle,
  Minus,
  Star,
  ArrowRight,
  Award,
  Shield,
  GraduationCap,
  Briefcase,
  Crown,
  Medal,
  Frame,
  Hexagon,
  Pentagon,
  Bookmark,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { ShapeVariant } from '@/lib/editor/documentModel';

interface ElementItem {
  label: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
}

export const ElementsPanel: React.FC = () => {
  const { addShape, addBorder, addQrCode, addCertificateCode } = useEditor();
  const [search, setSearch] = useState('');

  const items: ElementItem[] = useMemo(
    () => [
      // Shapes
      { label: 'Rectangle', icon: Square, category: 'Shapes', action: () => addShape('rectangle') },
      { label: 'Rounded Rectangle', icon: Square, category: 'Shapes', action: () => addShape('rounded-rectangle') },
      { label: 'Circle', icon: Circle, category: 'Shapes', action: () => addShape('circle') },
      { label: 'Ellipse', icon: Circle, category: 'Shapes', action: () => addShape('ellipse') },
      { label: 'Triangle', icon: Triangle, category: 'Shapes', action: () => addShape('triangle') },
      { label: 'Star', icon: Star, category: 'Shapes', action: () => addShape('star') },
      { label: 'Polygon', icon: Hexagon, category: 'Shapes', action: () => addShape('polygon') },
      // Lines
      { label: 'Line', icon: Minus, category: 'Lines & Dividers', action: () => addShape('line') },
      { label: 'Arrow', icon: ArrowRight, category: 'Lines & Dividers', action: () => addShape('arrow') },
      // Borders & Frames
      { label: 'Certificate Border', icon: Frame, category: 'Borders & Frames', action: () => addBorder() },
      // Certificate elements
      { label: 'QR Code', icon: Shield, category: 'Certificate', action: () => addQrCode() },
      { label: 'Certificate Code', icon: Bookmark, category: 'Certificate', action: () => addCertificateCode() },
      { label: 'White Mask Box', icon: Square, category: 'Masking', action: () => addShape('rectangle', true) },
      // Decorative symbols (rendered as shapes — placeholders)
      { label: 'Award Badge', icon: Award, category: 'Symbols', action: () => addShape('star') },
      { label: 'Medal', icon: Medal, category: 'Symbols', action: () => addShape('circle') },
      { label: 'Crown', icon: Crown, category: 'Symbols', action: () => addShape('star') },
      { label: 'Academic Cap', icon: GraduationCap, category: 'Symbols', action: () => addShape('star') },
      { label: 'Corporate', icon: Briefcase, category: 'Symbols', action: () => addShape('rectangle') },
    ],
    [addShape, addBorder, addQrCode, addCertificateCode],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [items, search]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, ElementItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <h3 className="font-bold text-xs text-slate-900 mb-2">Elements</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elements..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            aria-label="Search elements"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Array.from(grouped.entries()).map(([category, categoryItems]) => (
          <div key={category}>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{category}</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {categoryItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1.5 hover:bg-blue-50 hover:border-blue-300 transition group"
                    title={`Add ${item.label}`}
                  >
                    <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                    <span className="text-[9px] font-semibold text-slate-600 group-hover:text-blue-700 leading-tight text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
