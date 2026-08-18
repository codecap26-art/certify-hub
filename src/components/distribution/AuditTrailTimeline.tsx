'use client';

import React from 'react';
import {
  Clock,
  ShieldCheck,
  Send,
  RotateCcw,
  Edit2,
  Calendar,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { EmailAuditLogEntry } from '@/types/distribution';

interface Props {
  logs: EmailAuditLogEntry[];
}

export const AuditTrailTimeline: React.FC<Props> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="p-8 rounded-2xl border text-center space-y-1.5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          No audit log entries recorded yet.
        </p>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CAMPAIGN_CREATED':
        return { label: 'Created', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'CAMPAIGN_STARTED':
        return { label: 'Queue Started', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'CAMPAIGN_COMPLETED':
        return { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'CAMPAIGN_CANCELLED':
        return { label: 'Cancelled', color: 'text-red-700 bg-red-50 border-red-200' };
      case 'CAMPAIGN_SCHEDULED':
        return { label: 'Scheduled', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'TEST_EMAIL_SENT':
        return { label: 'Test Sent', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
      case 'RECIPIENT_EMAIL_EDITED':
        return { label: 'Address Corrected', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'FAILED_EMAIL_RETRIED':
        return { label: 'Retried', color: 'text-orange-700 bg-orange-50 border-orange-200' };
      default:
        return { label: action, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div
      className="p-6 rounded-2xl border space-y-4 shadow-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
          <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span>Institutional Distribution Audit Trail ({logs.length})</span>
        </h4>
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Tamper-evident system activity log
        </span>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const badge = getActionBadge(log.action);

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {log.details}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span>Actor: <strong>{log.user}</strong></span>
                  <span>•</span>
                  <span>Scope: {log.entityType}</span>
                </div>
              </div>

              <div className="font-mono text-[11px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
