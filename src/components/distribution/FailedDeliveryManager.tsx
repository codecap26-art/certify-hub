'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Edit2,
  Check,
  X,
  Mail,
  User,
  ShieldAlert,
  Search,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react';
import { EmailDeliveryJob } from '@/types/distribution';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { distributionRepository } from '@/lib/storage/distributionRepository';

interface Props {
  failedDeliveries: EmailDeliveryJob[];
  onRetrySelected: (deliveryIds: string[]) => void;
  onRetryAll: () => void;
  onUpdateEmailSuccess?: () => void;
  isRetrying?: boolean;
}

export const FailedDeliveryManager: React.FC<Props> = ({
  failedDeliveries,
  onRetrySelected,
  onRetryAll,
  onUpdateEmailSuccess,
  isRetrying = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editEmailValue, setEditEmailValue] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredJobs = failedDeliveries.filter(
    (j) =>
      j.recipientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (j.email || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (j.lastError || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (j.registrationNumber || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredJobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredJobs.map((j) => j.id));
    }
  };

  const startEdit = (job: EmailDeliveryJob) => {
    setEditingJobId(job.id);
    setEditEmailValue(job.email || '');
  };

  const saveEdit = (job: EmailDeliveryJob) => {
    if (!editEmailValue || !editEmailValue.trim()) return;

    // 1. Update job in distribution repository
    const updatedJob: EmailDeliveryJob = {
      ...job,
      email: editEmailValue.trim(),
      lastError: undefined,
      errorCategory: undefined,
      status: 'QUEUED', // ready for retry
    };
    distributionRepository.updateDelivery(updatedJob);

    // 2. Also update in Recipient repository if exists
    const rec = recipientRepository.getById(job.recipientId);
    if (rec) {
      rec.email = editEmailValue.trim();
      recipientRepository.save(rec);
    }

    // 3. Add audit log
    distributionRepository.addAuditLog({
      institutionId: job.institutionId,
      campaignId: job.campaignId,
      action: 'RECIPIENT_EMAIL_EDITED',
      entityId: job.id,
      entityType: 'delivery',
      user: 'Administrator',
      details: `Updated email address for ${job.recipientName} to ${editEmailValue.trim()}`,
    });

    setEditingJobId(null);
    if (onUpdateEmailSuccess) onUpdateEmailSuccess();
  };

  if (failedDeliveries.length === 0) {
    return (
      <div
        className="p-8 rounded-2xl border text-center space-y-2"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          No Failed Deliveries
        </h4>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          All recipients have been successfully processed or delivered.
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-2xl border space-y-5 shadow-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Top Header & Bulk Retry Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--error)' }} />
            <span>Failed Email Diagnostics & Retry Management</span>
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Review error causes, correct malformed addresses inline, and trigger controlled retries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onRetrySelected(selectedIds)}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRetryAll}
            disabled={isRetrying || failedDeliveries.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{
              borderColor: 'var(--error-border)',
              backgroundColor: 'var(--error-light)',
              color: 'var(--error-text)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry All Failed ({failedDeliveries.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter failed records by recipient name, email, register number, or error reason..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden text-xs" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-left border-collapse">
          <thead style={{ backgroundColor: 'var(--surface-subtle)' }}>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="p-3 w-10 text-center">
                <button type="button" onClick={toggleSelectAll} className="focus:outline-none">
                  {selectedIds.length === filteredJobs.length && filteredJobs.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Recipient</th>
              <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Email Address</th>
              <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Failure Reason</th>
              <th className="p-3 font-bold text-center" style={{ color: 'var(--text-secondary)' }}>Attempts</th>
              <th className="p-3 font-bold text-right" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filteredJobs.map((job) => {
              const isSelected = selectedIds.includes(job.id);
              const isEditing = editingJobId === job.id;

              return (
                <tr
                  key={job.id}
                  className={`transition ${
                    isSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="p-3 text-center">
                    <button type="button" onClick={() => toggleSelect(job.id)} className="focus:outline-none">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </td>

                  <td className="p-3">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {job.recipientName}
                    </span>
                    <span className="font-mono text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                      {job.registrationNumber || job.department || 'Student'}
                    </span>
                  </td>

                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 max-w-xs">
                        <input
                          type="email"
                          value={editEmailValue}
                          onChange={(e) => setEditEmailValue(e.target.value)}
                          className="px-2 py-1 text-xs border rounded-lg focus:outline-none w-full font-mono"
                          style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--primary)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(job)}
                          className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                          title="Save Email"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingJobId(null)}
                          className="p-1 rounded-lg border text-slate-500 hover:bg-slate-100"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs" style={{ color: job.email ? 'var(--text-primary)' : 'var(--error-text)' }}>
                          {job.email || '<missing email>'}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(job)}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition"
                          title="Edit email address"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="space-y-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
                        {job.errorCategory || 'FAILURE'}
                      </span>
                      <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {job.lastError || 'Delivery rejected by provider'}
                      </p>
                    </div>
                  </td>

                  <td className="p-3 text-center font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {job.attemptCount} / {job.maxAttempts}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRetrySelected([job.id])}
                      disabled={isRetrying}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--primary)',
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
