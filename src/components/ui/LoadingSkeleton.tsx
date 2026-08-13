'use client';

import React from 'react';

interface Props {
  type?: 'card' | 'table' | 'form' | 'certificate';
  count?: number;
}

export const LoadingSkeleton: React.FC<Props> = ({ type = 'card', count = 3 }) => {
  if (type === 'table') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (type === 'certificate') {
    return (
      <div className="w-full aspect-[1.414/1] bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between animate-pulse">
        <div className="h-12 bg-slate-200 rounded-xl w-1/3" />
        <div className="space-y-3 text-center my-auto">
          <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto" />
          <div className="h-8 bg-slate-200 rounded w-2/3 mx-auto" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
        </div>
        <div className="flex justify-between items-end">
          <div className="h-10 bg-slate-200 rounded w-1/4" />
          <div className="h-10 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-10 bg-slate-100 rounded-xl w-full pt-2" />
        </div>
      ))}
    </div>
  );
};
