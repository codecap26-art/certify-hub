'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileDown,
  CheckCircle2,
  XCircle,
  MailWarning,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { PreFlightValidationReport } from '@/types/distribution';
import saveAs from 'file-saver';

import { Recipient, CertificateRecord } from '@/types';

interface Props {
  report: PreFlightValidationReport;
  recipients?: Recipient[];
  certificates?: CertificateRecord[];
  onProceedAnyway?: () => void;
}

export const PreFlightValidationCard: React.FC<Props> = ({ report, recipients = [], certificates = [] }) => {
  const hasIssues = report.issues.length > 0;

  const downloadErrorReportCsv = () => {
    if (!report.issues.length) return;

    const headers = ['Recipient ID', 'Name', 'Register Number', 'Email', 'Issue Category', 'Reason'];
    const rows = report.issues.map((issue) => [
      `"${issue.recipientId}"`,
      `"${issue.name}"`,
      `"${issue.registerNumber || ''}"`,
      `"${issue.email || ''}"`,
      `"${issue.category}"`,
      `"${issue.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Distribution_Validation_Errors_${Date.now()}.csv`);
  };

  return (
    <div
      className="p-6 rounded-2xl border space-y-6 shadow-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Top Title & Download Report CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Pre-Flight Recipient Validation & Integrity Check</span>
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Every selected record has been verified against database credentials and email delivery rules.
          </p>
        </div>

        {hasIssues && (
          <button
            type="button"
            onClick={downloadErrorReportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            style={{
              borderColor: 'var(--warning-border)',
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning-text)',
            }}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download Error Report (.CSV)</span>
          </button>
        )}
      </div>

      {/* 4 Categorized Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Ready */}
        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--success-light)',
            borderColor: 'var(--success-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold" style={{ color: 'var(--success-text)' }}>
              Ready to Send
            </span>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2" style={{ color: 'var(--success-text)' }}>
            {report.readyCount}
          </p>
          <span className="text-[10px]" style={{ color: 'var(--success-text)', opacity: 0.8 }}>
            Valid certificates & emails
          </span>
        </div>

        {/* Missing Email */}
        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: report.missingEmailCount > 0 ? 'var(--warning-light)' : 'var(--surface-subtle)',
            borderColor: report.missingEmailCount > 0 ? 'var(--warning-border)' : 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold" style={{ color: report.missingEmailCount > 0 ? 'var(--warning-text)' : 'var(--text-muted)' }}>
              Missing Email
            </span>
            <MailWarning className="w-4 h-4" style={{ color: report.missingEmailCount > 0 ? 'var(--warning)' : 'var(--text-muted)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2" style={{ color: report.missingEmailCount > 0 ? 'var(--warning-text)' : 'var(--text-primary)' }}>
            {report.missingEmailCount}
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            No address configured
          </span>
        </div>

        {/* Invalid Email */}
        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: report.invalidEmailCount > 0 ? 'var(--error-light)' : 'var(--surface-subtle)',
            borderColor: report.invalidEmailCount > 0 ? 'var(--error-border)' : 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold" style={{ color: report.invalidEmailCount > 0 ? 'var(--error-text)' : 'var(--text-muted)' }}>
              Invalid Format
            </span>
            <XCircle className="w-4 h-4" style={{ color: report.invalidEmailCount > 0 ? 'var(--error)' : 'var(--text-muted)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2" style={{ color: report.invalidEmailCount > 0 ? 'var(--error-text)' : 'var(--text-primary)' }}>
            {report.invalidEmailCount}
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Malformed syntax
          </span>
        </div>

        {/* Missing Certificate */}
        <div
          className="p-4 rounded-xl border flex flex-col justify-between"
          style={{
            backgroundColor: report.missingCertCount > 0 ? 'var(--error-light)' : 'var(--surface-subtle)',
            borderColor: report.missingCertCount > 0 ? 'var(--error-border)' : 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold" style={{ color: report.missingCertCount > 0 ? 'var(--error-text)' : 'var(--text-muted)' }}>
              Missing Cert
            </span>
            <AlertCircle className="w-4 h-4" style={{ color: report.missingCertCount > 0 ? 'var(--error)' : 'var(--text-muted)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2" style={{ color: report.missingCertCount > 0 ? 'var(--error-text)' : 'var(--text-primary)' }}>
            {report.missingCertCount}
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Unissued credentials
          </span>
        </div>
      </div>

      {/* Duplicate Protection Warning if detected */}
      {report.duplicateCount > 0 && (
        <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <Copy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Duplicate Send Prevention Notice:</p>
            <p>
              <strong>{report.duplicateCount} recipients</strong> have already received or been queued for this certificate in this campaign. To prevent spamming recipients, duplicate deliveries will be filtered out automatically.
            </p>
          </div>
        </div>
      )}

      {/* Non-blocking Notice */}
      <div className="p-3.5 rounded-xl border bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between">
        <span className="font-semibold">
          💡 Invalid recipient records will NOT block the <strong>{report.readyCount} valid recipients</strong> from being distributed.
        </span>
        <span className="font-bold text-[11px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md">
          Safe Non-Blocking Queue
        </span>
      </div>

      {/* Issues Table if any */}
      {hasIssues && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Flagged Recipient Diagnostics ({report.issues.length})
          </h4>

          <div className="rounded-xl border overflow-hidden max-h-60 overflow-y-auto text-xs" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-left border-collapse">
              <thead style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="p-2.5 font-bold" style={{ color: 'var(--text-secondary)' }}>Recipient Name</th>
                  <th className="p-2.5 font-bold" style={{ color: 'var(--text-secondary)' }}>Email Given</th>
                  <th className="p-2.5 font-bold" style={{ color: 'var(--text-secondary)' }}>Diagnostic Issue</th>
                  <th className="p-2.5 font-bold" style={{ color: 'var(--text-secondary)' }}>Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {report.issues.map((issue) => (
                  <tr key={issue.recipientId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {issue.name}
                      {issue.registerNumber && <span className="font-mono text-[10px] text-slate-400 block">{issue.registerNumber}</span>}
                    </td>
                    <td className="p-2.5 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {issue.email || '<empty>'}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase font-mono" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
                        {issue.category}
                      </span>
                    </td>
                    <td className="p-2.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {issue.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pre-Send Recipient to Email Mapping Table (Step 17) */}
      {recipients.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pre-Send Recipient Destination Verification ({recipients.length})</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              Each student certificate will be sent strictly to their own email address
            </span>
          </div>

          <div className="rounded-xl border overflow-hidden max-h-64 overflow-y-auto text-xs" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="p-2.5 font-bold" style={{ color: 'var(--text-secondary)' }}>Recipient Student</th>
                  <th className="p-2.5 font-bold" style={{ color: 'var(--text-secondary)' }}>Sending To (Destination Email)</th>
                  <th className="p-2.5 font-bold" style={{ color: 'var(--text-secondary)' }}>Certificate Code</th>
                  <th className="p-2.5 font-bold text-right" style={{ color: 'var(--text-secondary)' }}>Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {recipients.map((rec) => {
                  const cert = certificates.find((c) => c.recipientId === rec.id);
                  const hasEmail = Boolean(rec.email && rec.email.trim());
                  const isReady = hasEmail && Boolean(cert);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {rec.fullName}
                        {rec.registrationNumber && (
                          <span className="font-mono text-[10px] text-slate-400 block">{rec.registrationNumber}</span>
                        )}
                      </td>

                      <td className="p-2.5 font-mono text-[11px]">
                        {hasEmail ? (
                          <span className="text-blue-700 dark:text-blue-300 font-bold">{rec.email}</span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">Missing Email</span>
                        )}
                      </td>

                      <td className="p-2.5 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {cert?.certificateCode || 'Pending Issue'}
                      </td>

                      <td className="p-2.5 text-right">
                        {isReady ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            ✓ Verified Direct Delivery
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            Flagged for Review
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
