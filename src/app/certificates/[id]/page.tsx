'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  X,
} from 'lucide-react';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { CertificateRecord } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';
import { downloadCertificatePdf } from '@/lib/certificate/pdfGenerator';

export default function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const cert = certificateRepository.getById(resolvedParams.id);
    if (cert) setCertificate(cert);
  }, [resolvedParams.id]);

  if (!certificate) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Certificate Record Not Found</h2>
        <p className="text-xs text-slate-600">The requested certificate ID does not exist or was deleted.</p>
        <Link
          href="/certificates"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Audit History</span>
        </Link>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/verify/${certificate.verificationToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadCertificatePdf(certificate);
    setIsDownloading(false);
  };

  const handleConfirmRevoke = () => {
    if (!revokeReason.trim()) return;
    const updated = certificateRepository.revoke(certificate.id, revokeReason);
    if (updated) setCertificate(updated);
    setShowRevokeModal(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title={`Certificate: ${certificate.certificateCode}`}
        description={`Issued to ${certificate.recipientSnapshot.fullName} for ${certificate.eventSnapshot.name}`}
        icon={FileCheck}
        breadcrumbs={[
          { label: 'Certificates History', href: '/certificates' },
          { label: certificate.certificateCode },
        ]}
        action={<StatusBadge status={certificate.status} />}
      />

      {/* Toolbar / Actions */}
      <div
        className="p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold mr-1" style={{ color: 'var(--text-secondary)' }}>Preview Zoom:</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
            className="p-1.5 rounded-lg border transition"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs w-12 text-center" style={{ color: 'var(--text-primary)' }}>{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
            className="p-1.5 rounded-lg border transition"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            className="p-1.5 rounded-lg border transition"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-lg border transition"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" style={{ color: 'var(--primary)' }} />}
            <span>{copiedLink ? 'Copied Token Link!' : 'Copy Verify URL'}</span>
          </button>

          <Link
            href={`/verify/${certificate.verificationToken}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-lg border transition"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ExternalLink className="w-4 h-4 text-teal-400" />
            <span>Public Lookup</span>
          </Link>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-xs transition"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Building PDF...' : 'Download PDF'}</span>
          </button>

          {certificate.status === 'Valid' && (
            <button
              onClick={() => setShowRevokeModal(true)}
              className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold py-2 px-3.5 rounded-lg border border-red-800/60 transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Revoke Credential</span>
            </button>
          )}
        </div>
      </div>

      {/* Revocation Warning Box if Revoked */}
      {certificate.status === 'Revoked' && (
        <div className="bg-red-950/50 border border-red-800/80 p-4 rounded-2xl text-red-200 text-xs space-y-1">
          <p className="font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>This credential has been revoked.</span>
          </p>
          <p className="text-[11px] text-red-300">
            <strong>Revocation Reason:</strong> {certificate.revocationReason || 'Unspecified administrative reason'}
          </p>
          <p className="text-[10px] text-red-400/80">Revoked at: {certificate.revokedAt}</p>
        </div>
      )}

      {/* Scalable Live Certificate Renderer Shell */}
      <div
        className="p-6 rounded-2xl overflow-x-auto border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
          <CertificateRenderer certificate={certificate} />
        </div>
      </div>

      {/* Revocation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-strong)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-base font-bold flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Revoke Certificate</span>
              </h3>
              <button onClick={() => setShowRevokeModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Revoking a credential marks it as invalid on public verification queries. Please specify an audit reason.
            </p>

            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Duplicate issue / Incorrect recipient data / Course withdrawal..."
              className="w-full rounded-lg p-3 text-xs focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border transition"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={!revokeReason.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
