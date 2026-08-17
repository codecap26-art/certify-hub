'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Square,
  Circle,
  Triangle,
  Minus,
  Star,
  Shield,
  Crown,
  Frame,
  Hexagon,
  Bookmark,
  Award,
  Heart,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useEditor } from '@/lib/editor/useEditorStore';
import { CornerOrnamentStyle, ShapeVariant } from '@/lib/editor/documentModel';

interface ElementItem {
  label: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
}

export const ElementsPanel: React.FC = () => {
  const { addShape, addShapePreset, addCornerOrnaments, addBorder, addQrCode, addCertificateCode } = useEditor();
  const [search, setSearch] = useState('');

  const items: ElementItem[] = useMemo(
    () => [
      // 1. Shapes
      { label: 'Rectangle', icon: Square, category: 'Basic Shapes', action: () => addShape('rectangle') },
      { label: 'Rounded Rectangle', icon: Square, category: 'Basic Shapes', action: () => addShape('rounded-rectangle') },
      { label: 'Circle', icon: Circle, category: 'Basic Shapes', action: () => addShape('circle') },
      { label: 'Ellipse', icon: Circle, category: 'Basic Shapes', action: () => addShape('ellipse') },
      { label: 'Diamond', icon: Square, category: 'Basic Shapes', action: () => addShape('diamond') },
      { label: 'Triangle', icon: Triangle, category: 'Basic Shapes', action: () => addShape('triangle') },
      { label: 'Hexagon', icon: Hexagon, category: 'Basic Shapes', action: () => addShape('hexagon') },
      { label: 'Octagon', icon: Hexagon, category: 'Basic Shapes', action: () => addShape('octagon') },
      { label: 'Heart', icon: Heart, category: 'Basic Shapes', action: () => addShape('heart') },
      { label: 'Divider Line', icon: Minus, category: 'Basic Shapes', action: () => addShape('line') },
      { label: 'Arrow', icon: ArrowRight, category: 'Basic Shapes', action: () => addShape('arrow') },

      // 2. Badges & Award Seals
      { label: 'Gold Star (5-Point)', icon: Star, category: 'Awards & Seals', action: () => addShape('star') },
      { label: 'Official Seal (16-Point)', icon: Crown, category: 'Awards & Seals', action: () => addShape('seal') },
      { label: 'Honor Badge (12-Point)', icon: Award, category: 'Awards & Seals', action: () => addShape('badge') },
      { label: 'Excellence Medal', icon: Award, category: 'Awards & Seals', action: () => addShapePreset('gold-medal') },
      { label: 'Ribbon Banner', icon: Bookmark, category: 'Awards & Seals', action: () => addShapePreset('ribbon-badge') },

      // 3. 4-Corner Decorative Sets (Auto-placed to all 4 corners)
      { label: 'Luxury Corner Set', icon: Frame, category: '4-Corner Ornaments', action: () => addCornerOrnaments('luxury', '#D97706') },
      { label: 'Classic Corner Set', icon: Frame, category: '4-Corner Ornaments', action: () => addCornerOrnaments('classic', '#1E40AF') },
      { label: 'Minimal Corner Set', icon: Frame, category: '4-Corner Ornaments', action: () => addCornerOrnaments('minimal', '#64748B') },
      { label: 'Geometric Corner Set', icon: Frame, category: '4-Corner Ornaments', action: () => addCornerOrnaments('geometric', '#0F172A') },
      { label: 'Academic Corner Set', icon: Frame, category: '4-Corner Ornaments', action: () => addCornerOrnaments('academic', '#059669') },
      { label: 'Ornamental Set', icon: Frame, category: '4-Corner Ornaments', action: () => addCornerOrnaments('ornamental', '#7C3AED') },

      // 4. Dividers & Accents
      { label: 'Single Divider', icon: Minus, category: 'Dividers & Accents', action: () => addShapePreset('divider') },
      { label: 'Double Divider', icon: Minus, category: 'Dividers & Accents', action: () => addShapePreset('double-divider') },
      { label: 'Decorative Dashed Ring', icon: Circle, category: 'Dividers & Accents', action: () => addShapePreset('decorative-circle') },

      // 5. Borders & Security Credentials
      { label: 'Certificate Border', icon: Frame, category: 'Borders & Security', action: () => addBorder() },
      { label: 'Verification QR Code', icon: Shield, category: 'Borders & Security', action: () => addQrCode() },
      { label: 'Certificate Code Token', icon: Bookmark, category: 'Borders & Security', action: () => addCertificateCode() },
      { label: 'White Mask Box', icon: Square, category: 'Borders & Security', action: () => addShape('rectangle', true) },
    ],
    [addShape, addShapePreset, addCornerOrnaments, addBorder, addQrCode, addCertificateCode],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [items, search]);

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
        <h3 className="font-bold text-xs text-slate-900 mb-2">Shapes & Decorative Elements</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shapes, seals, ornaments..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
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
                    className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl transition text-center group cursor-pointer"
                    title={`Insert ${item.label}`}
                  >
                    <Icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition mb-1" />
                    <span className="text-[10px] font-medium text-slate-700 group-hover:text-blue-900 line-clamp-2 leading-tight">
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
