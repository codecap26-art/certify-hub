'use client';

import React from 'react';
import {
  Send,
  AlertTriangle,
  Mail,
  Users,
  FileCheck,
  CheckCircle2,
  Calendar,
  Layers,
  X,
} from 'lucide-react';
import { DeliveryMethod } from '@/types/distribution';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignName: string;
  eventName: string;
  totalRecipients: number;
  readyCount: number;
  invalidCount: number;
  deliveryMethod: DeliveryMethod;
  subject: string;
  isScheduled?: boolean;
  scheduledDate?: string;
  isSubmitting?: boolean;
}

export const SendConfirmationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  campaignName,
  eventName,
  totalRecipients,
  readyCount,
  invalidCount,
  deliveryMethod,
  subject,
  isScheduled = false,
  scheduledDate,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl text-white shadow-sm"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              }}
            >
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {isScheduled ? 'Confirm Scheduled Distribution' : 'Ready to Send Campaign'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Please review institutional distribution parameters before launching.
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

        {/* Campaign Parameters Summary Box */}
        <div className="p-6 space-y-4">
          <div
            className="p-4 rounded-2xl border space-y-3 text-xs"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Campaign:</span>
              <span className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{campaignName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Academic Event:</span>
              <span className="font-medium text-right" style={{ color: 'var(--text-primary)' }}>{eventName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Selected:</span>
              <span className="font-bold text-right font-mono" style={{ color: 'var(--text-primary)' }}>{totalRecipients}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-700">Validated Recipients:</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                {readyCount} Ready
              </span>
            </div>

            {invalidCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-700">Flagged Invalid:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
                  {invalidCount} (Will be skipped)
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Delivery Method:</span>
              <span className="font-bold capitalize" style={{ color: 'var(--primary)' }}>
                {deliveryMethod === 'attachment' ? 'PDF Attachment' : deliveryMethod === 'link' ? 'Secure Link' : 'Attachment & Link'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--border)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Subject Line:</span>
              <span className="font-medium truncate max-w-[240px] text-right" style={{ color: 'var(--text-primary)' }}>
                {subject}
              </span>
            </div>

            {isScheduled && scheduledDate && (
              <div className="flex items-center justify-between border-t pt-2 text-indigo-700 bg-indigo-50 p-2 rounded-xl">
                <span className="font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Scheduled Date:</span>
                </span>
                <span className="font-mono font-bold">{new Date(scheduledDate).toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border bg-blue-50 dark:bg-blue-950/40 border-blue-200 text-blue-900 dark:text-blue-200 text-xs">
            <p className="font-bold">
              🚀 This will initiate background queue distribution to {readyCount} personalized recipients.
            </p>
            <p className="text-[11px] mt-1 text-blue-700 dark:text-blue-300">
              CertifyHub will handle batching, rate-limiting, and idempotency protection automatically. Closing the browser will not interrupt sending.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div
          className="p-6 border-t flex items-center justify-end gap-3"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || readyCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            }}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Starting Queue...' : isScheduled ? 'Confirm Schedule' : 'Confirm & Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
