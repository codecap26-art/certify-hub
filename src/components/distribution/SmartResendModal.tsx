'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  MailCheck,
  AlertCircle,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { DistributionCampaign, EmailDeliveryJob } from '@/types/distribution';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaign: DistributionCampaign;
  deliveries: EmailDeliveryJob[];
  onConfirmResend: (mode: 'failed_only' | 'never_sent_only' | 'failed_and_never_sent') => void;
  isProcessing?: boolean;
}

export const SmartResendModal: React.FC<Props> = ({
  isOpen,
  onClose,
  campaign,
  deliveries,
  onConfirmResend,
  isProcessing = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<
    'failed_only' | 'never_sent_only' | 'failed_and_never_sent'
  >('failed_only');

  if (!isOpen) return null;

  const total = deliveries.length;
  const delivered = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const failed = deliveries.filter((d) => d.status === 'FAILED').length;
  const neverSent = deliveries.filter(
    (d) => d.status === 'QUEUED' || d.status === 'CANCELLED' || d.attemptCount === 0
  ).length;

  const targetCount =
    selectedMode === 'failed_only'
      ? failed
      : selectedMode === 'never_sent_only'
      ? neverSent
      : failed + neverSent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              }}
            >
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Smart Resend Distribution
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Target only unreached or failed recipients safely.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Summary Breakdown */}
          <div
            className="p-4 rounded-2xl border space-y-2"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Campaign Recipients:</span>
              <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{total}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700">
              <span className="font-semibold">Already Delivered:</span>
              <span className="font-bold font-mono">{delivered}</span>
            </div>
            <div className="flex items-center justify-between text-amber-700">
              <span className="font-semibold">Failed Deliveries:</span>
              <span className="font-bold font-mono">{failed}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold">Never Sent / Cancelled:</span>
              <span className="font-bold font-mono">{neverSent}</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>
              Choose Smart Target Audience:
            </span>

            <label
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                selectedMode === 'failed_only'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="smart_resend_mode"
                  checked={selectedMode === 'failed_only'}
                  onChange={() => setSelectedMode('failed_only')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">Failed Recipients Only</span>
                  <span className="text-[11px] text-slate-500">Retry all {failed} rejected or bounced addresses</span>
                </div>
              </div>
              <span className="font-bold font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                {failed}
              </span>
            </label>

            <label
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                selectedMode === 'never_sent_only'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="smart_resend_mode"
                  checked={selectedMode === 'never_sent_only'}
                  onChange={() => setSelectedMode('never_sent_only')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">Never Sent Only</span>
                  <span className="text-[11px] text-slate-500">Send to {neverSent} queued or skipped recipients</span>
                </div>
              </div>
              <span className="font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {neverSent}
              </span>
            </label>

            <label
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                selectedMode === 'failed_and_never_sent'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="smart_resend_mode"
                  checked={selectedMode === 'failed_and_never_sent'}
                  onChange={() => setSelectedMode('failed_and_never_sent')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">Failed + Never Sent</span>
                  <span className="text-[11px] text-slate-500">Combined resend to all {failed + neverSent} unreached recipients</span>
                </div>
              </div>
              <span className="font-bold font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                {failed + neverSent}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-end gap-3" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-100 transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirmResend(selectedMode)}
            disabled={isProcessing || targetCount === 0}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Processing Resend...' : `Resend to ${targetCount} Recipients`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
