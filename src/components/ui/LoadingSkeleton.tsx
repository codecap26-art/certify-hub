'use client';

import React from 'react';

interface Props {
  type?: 'card' | 'table' | 'form' | 'certificate';
  count?: number;
}

export const LoadingSkeleton: React.FC<Props> = ({ type = 'card', count = 3 }) => {
  const shimmer = {
    backgroundColor: 'var(--surface-subtle)',
    borderRadius: 'var(--radius-lg)',
  };

  const shimmerDark = {
    backgroundColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
  };

  if (type === 'table') {
    return (
      <div
        className="rounded-2xl border p-4 space-y-3 animate-pulse"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="h-8 w-full" style={shimmer} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full" style={{ ...shimmer, opacity: 1 - i * 0.1 }} />
        ))}
      </div>
    );
  }

  if (type === 'certificate') {
    return (
      <div
        className="w-full aspect-[1.414/1] rounded-2xl border p-8 flex flex-col justify-between animate-pulse"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="h-12 w-1/3" style={shimmer} />
        <div className="space-y-3 text-center my-auto">
          <div className="h-4 w-1/4 mx-auto" style={shimmerDark} />
          <div className="h-8 w-2/3 mx-auto" style={shimmer} />
          <div className="h-4 w-1/2 mx-auto" style={shimmerDark} />
        </div>
        <div className="flex justify-between items-end">
          <div className="h-10 w-1/4" style={shimmer} />
          <div className="h-10 w-1/4" style={shimmer} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border p-6 space-y-4 animate-pulse"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="h-5 w-1/3" style={shimmer} />
          <div className="h-3.5 w-3/4" style={shimmerDark} />
          <div className="h-3.5 w-1/2" style={shimmerDark} />
          <div className="h-9 w-full" style={shimmer} />
        </div>
      ))}
    </div>
  );
};
