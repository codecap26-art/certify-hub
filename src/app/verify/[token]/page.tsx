'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  Building2,
  User,
  ArrowLeft,
  Download,
  FileCheck,
} from 'lucide-react';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { CertificateRecord } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';
import { downloadCertificatePdf } from '@/lib/certificate/pdfGenerator';
import { motion } from 'framer-motion';

export default function VerificationResultPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const cert = certificateRepository.getByTokenOrCode(resolvedParams.token);
    setCertificate(cert || null);
    setLoading(false);
  }, [resolvedParams.token]);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500 text-xs">
        <p>Verifying credential authenticity token...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-xs"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Credential Not Found</h2>
            <p className="text-xs text-slate-600">
              No matching certificate was found for token / code:{' '}
              <span className="font-mono text-amber-700 font-bold">{resolvedParams.token}</span>
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-lg text-xs border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Try Another Query</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const isRevoked = certificate.status === 'Revoked';

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadCertificatePdf(certificate);
    setIsDownloading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Banner Result State */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border shadow-xs space-y-3 ${
          isRevoked
            ? 'bg-red-50 border-red-200 text-red-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRevoked ? (
              <div className="p-2.5 rounded-xl bg-red-100 text-red-700">
                <ShieldAlert className="w-6 h-6" />
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isRevoked ? 'REVOKED CREDENTIAL' : 'AUTHENTICATED VALID CREDENTIAL'}
              </h1>
              <p className="text-xs text-slate-600">
                Official Credential Code: <span className="font-mono font-bold text-slate-900">{certificate.certificateCode}</span>
              </p>
            </div>
          </div>

          <StatusBadge status={certificate.status} />
        </div>

        {isRevoked && (
          <div className="pt-2 border-t border-red-200 text-xs text-red-800">
            <p>
              <strong>Revocation Reason:</strong> {certificate.revocationReason || 'Administrative revocation'}
            </p>
            <p className="text-[10px] text-red-600 mt-0.5">Revoked on: {certificate.revokedAt}</p>
          </div>
        )}
      </motion.div>

      {/* Snapshot Verification Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="p-5 rounded-2xl space-y-2 border shadow-xs"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
            <User className="w-4 h-4" />
            <span>Recipient</span>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{certificate.recipientSnapshot.fullName}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {certificate.recipientSnapshot.registrationNumber || certificate.recipientSnapshot.email}
          </p>
        </div>

        <div
          className="p-5 rounded-2xl space-y-2 border shadow-xs"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--secondary)' }}>
            <Calendar className="w-4 h-4" />
            <span>Event / Course</span>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{certificate.eventSnapshot.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{certificate.eventSnapshot.startDate}</p>
        </div>

        <div
          className="p-5 rounded-2xl space-y-2 border shadow-xs"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
            <Building2 className="w-4 h-4" />
            <span>Issuing Institute</span>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{certificate.organizationSnapshot.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{certificate.organizationSnapshot.type}</p>
        </div>
      </div>

      {/* Certificate Visual & Actions */}
      <div
        className="p-6 rounded-2xl space-y-4 border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileCheck className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span>Authenticated Certificate Document</span>
          </span>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-xs transition"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download Official PDF'}</span>
          </button>
        </div>

        <div
          className="p-4 rounded-xl border flex justify-center"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <CertificateRenderer certificate={certificate} />
        </div>
      </div>
    </div>
  );
}
