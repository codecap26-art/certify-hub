'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  Pause,
  Play,
  X,
  RefreshCw,
  MailCheck,
} from 'lucide-react';
import { DistributionCampaign } from '@/types/distribution';

interface Props {
  campaign: DistributionCampaign;
  onCancel?: () => void;
  onRefresh?: () => void;
}

export const LiveProgressTracker: React.FC<Props> = ({ campaign, onCancel, onRefresh }) => {
  const total = campaign.totalRecipients || 1;
  const processed = (campaign.deliveredCount || 0) + (campaign.failedCount || 0);
  const percentage = Math.min(100, Math.round((processed / total) * 100));

  const isCompleted = campaign.status === 'completed';
  const isCancelled = campaign.status === 'cancelled';
  const isProcessing = campaign.status === 'processing' || campaign.status === 'queued';
  const isScheduled = campaign.status === 'scheduled';

  return (
    <div
      className="p-6 rounded-2xl border space-y-6 shadow-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {isCompleted
                ? 'Campaign Distribution Completed'
                : isCancelled
                ? 'Campaign Cancelled'
                : isScheduled
                ? 'Scheduled for Automatic Distribution'
                : 'Sending Certificates in Progress...'}
            </h3>

            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-mono"
              style={{
                backgroundColor: isCompleted
                  ? 'var(--success-light)'
                  : isCancelled
                  ? 'var(--error-light)'
                  : isScheduled
                  ? 'var(--info-light)'
                  : 'var(--primary-light)',
                color: isCompleted
                  ? 'var(--success-text)'
                  : isCancelled
                  ? 'var(--error-text)'
                  : isScheduled
                  ? 'var(--info-text)'
                  : 'var(--primary)',
                borderColor: isCompleted
                  ? 'var(--success-border)'
                  : isCancelled
                  ? 'var(--error-border)'
                  : isScheduled
                  ? 'var(--info-border)'
                  : 'var(--primary-border)',
              }}
            >
              {campaign.status}
            </span>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Campaign: <strong>{campaign.name}</strong> • Academic Program: <strong>{campaign.eventName}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh status"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {isProcessing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition hover:bg-red-50"
              style={{
                borderColor: 'var(--error-border)',
                backgroundColor: 'var(--error-light)',
                color: 'var(--error-text)',
              }}
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar with Percentage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span style={{ color: 'var(--text-secondary)' }}>Overall Distribution Progress</span>
          <span className="font-mono text-sm" style={{ color: 'var(--primary)' }}>
            {percentage}% ({processed} / {total})
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border" style={{ borderColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              background: isCompleted
                ? 'linear-gradient(90deg, #16A34A 0%, #10B981 100%)'
                : isCancelled
                ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)'
                : 'linear-gradient(90deg, #2563EB 0%, #0284C7 100%)',
            }}
          />
        </div>
      </div>

      {/* Realtime KPI Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {/* Total */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
        >
          <span className="font-semibold text-[11px]" style={{ color: 'var(--text-muted)' }}>Total Recipients</span>
          <p className="text-xl font-extrabold font-mono mt-1" style={{ color: 'var(--text-primary)' }}>
            {campaign.totalRecipients}
          </p>
        </div>

        {/* Delivered */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--success-light)', borderColor: 'var(--success-border)' }}
        >
          <span className="font-semibold text-[11px]" style={{ color: 'var(--success-text)' }}>Delivered</span>
          <p className="text-xl font-extrabold font-mono mt-1" style={{ color: 'var(--success-text)' }}>
            {campaign.deliveredCount || 0}
          </p>
        </div>

        {/* Sent */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary-border)' }}
        >
          <span className="font-semibold text-[11px]" style={{ color: 'var(--primary)' }}>In-Flight Sent</span>
          <p className="text-xl font-extrabold font-mono mt-1" style={{ color: 'var(--primary)' }}>
            {campaign.sentCount || 0}
          </p>
        </div>

        {/* Queued / Pending */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border)' }}
        >
          <span className="font-semibold text-[11px]" style={{ color: 'var(--text-muted)' }}>Queued</span>
          <p className="text-xl font-extrabold font-mono mt-1" style={{ color: 'var(--text-primary)' }}>
            {campaign.queuedCount || 0}
          </p>
        </div>

        {/* Failed */}
        <div
          className="p-3.5 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: (campaign.failedCount || 0) > 0 ? 'var(--error-light)' : 'var(--surface-subtle)',
            borderColor: (campaign.failedCount || 0) > 0 ? 'var(--error-border)' : 'var(--border)',
          }}
        >
          <span className="font-semibold text-[11px]" style={{ color: (campaign.failedCount || 0) > 0 ? 'var(--error-text)' : 'var(--text-muted)' }}>
            Failed
          </span>
          <p className="text-xl font-extrabold font-mono mt-1" style={{ color: (campaign.failedCount || 0) > 0 ? 'var(--error-text)' : 'var(--text-primary)' }}>
            {campaign.failedCount || 0}
          </p>
        </div>
      </div>
    </div>
  );
};
