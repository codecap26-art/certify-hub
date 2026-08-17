'use client';

import React from 'react';

interface RulerBarProps {
  orientation: 'horizontal' | 'vertical';
  length: number; // In canvas document pixels
  zoomLevel: number;
}

export const RulerBar: React.FC<RulerBarProps> = ({ orientation, length, zoomLevel }) => {
  const isHorizontal = orientation === 'horizontal';
  const step = 50; // tick mark every 50 document pixels
  const ticksCount = Math.floor(length / step);

  if (isHorizontal) {
    return (
      <div
        className="h-6 bg-slate-100 border-b border-slate-300 relative select-none overflow-hidden font-mono text-[9px] text-slate-500"
        style={{ width: length * zoomLevel }}
      >
        {Array.from({ length: ticksCount + 1 }).map((_, i) => {
          const val = i * step;
          const pos = val * zoomLevel;
          return (
            <div key={i} className="absolute top-0 bottom-0 flex flex-col justify-between" style={{ left: `${pos}px` }}>
              <div className="h-2 w-px bg-slate-400" />
              <span className="-translate-x-1/2 leading-none mb-0.5">{val}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="w-6 bg-slate-100 border-r border-slate-300 relative select-none overflow-hidden font-mono text-[9px] text-slate-500"
      style={{ height: length * zoomLevel }}
    >
      {Array.from({ length: ticksCount + 1 }).map((_, i) => {
        const val = i * step;
        const pos = val * zoomLevel;
        return (
          <div key={i} className="absolute left-0 right-0 flex justify-between items-center" style={{ top: `${pos}px` }}>
            <div className="w-2 h-px bg-slate-400" />
            <span className="-translate-y-1/2 leading-none mr-0.5">{val}</span>
          </div>
        );
      })}
    </div>
  );
};
