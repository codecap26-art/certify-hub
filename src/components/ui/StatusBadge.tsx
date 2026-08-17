'use client';

import React from 'react';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface Props {
  status: 'Valid' | 'Revoked' | 'Active' | 'Draft' | 'Completed';
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const config: Record<
    string,
    { bg: string; text: string; border: string; dot: string }
  > = {
    Valid: {
      bg:     'var(--success-light)',
      text:   'var(--success-text)',
      border: 'var(--success-border)',
      dot:    'var(--success)',
    },
    Active: {
      bg:     'var(--success-light)',
      text:   'var(--success-text)',
      border: 'var(--success-border)',
      dot:    'var(--success)',
    },
    Completed: {
      bg:     'var(--primary-light)',
      text:   'var(--primary)',
      border: 'var(--primary-border)',
      dot:    'var(--primary)',
    },
    Draft: {
      bg:     'var(--surface-subtle)',
      text:   'var(--text-muted)',
      border: 'var(--border)',
      dot:    'var(--text-muted)',
    },
    Revoked: {
      bg:     'var(--error-light)',
      text:   'var(--error-text)',
      border: 'var(--error-border)',
      dot:    'var(--error)',
    },
  };

  const Icon = {
    Valid:     CheckCircle2,
    Active:    CheckCircle2,
    Completed: CheckCircle2,
    Draft:     Clock,
    Revoked:   ShieldAlert,
  }[status];

  const c = config[status] || config.Draft;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
      style={{
        backgroundColor: c.bg,
        color:           c.text,
        borderColor:     c.border,
      }}
      aria-label={`Status: ${status}`}
    >
      {/* Pulsing dot for active states */}
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: c.dot }}
      />
      <span>{status}</span>
    </span>
  );
};
