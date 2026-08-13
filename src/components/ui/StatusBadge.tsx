'use client';

import React from 'react';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface Props {
  status: 'Valid' | 'Revoked' | 'Active' | 'Draft' | 'Completed';
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const styles = {
    Valid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Completed: 'bg-blue-50 text-blue-700 border-blue-200',
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    Revoked: 'bg-red-50 text-red-700 border-red-200',
  }[status];

  const Icon = {
    Valid: CheckCircle2,
    Active: CheckCircle2,
    Completed: CheckCircle2,
    Draft: Clock,
    Revoked: ShieldAlert,
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}
      aria-label={`Status: ${status}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{status}</span>
    </span>
  );
};
