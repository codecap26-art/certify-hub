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
  Download,
  FileCheck,
  Share2,
  CheckCircle2,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { CertificateRecord } from '@/types';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';
import { downloadCertificatePdf, viewCertificatePdfInTab } from '@/lib/certificate/pdfGenerator';
import { motion } from 'framer-motion';

export default function RecipientCertificatePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const rawToken = resolvedParams.token;
    const cert =
      certificateRepository.getByDownloadToken(rawToken) ||
      certificateRepository.getByTokenOrCode(rawToken);

    setCertificate(cert || null);
    setLoading(false);

    // Auto-trigger direct browser download on arrival if download=true query or initial visit
    if (cert && cert.status !== 'Revoked' && typeof window !== 'undefined') {
      const isExpired = cert.expiresAt && new Date(cert.expiresAt).getTime() < Date.now();
      if (!isExpired) {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldAutoDownload = urlParams.get('download') === 'true';
        if (shouldAutoDownload) {
          setTimeout(() => {
            handleDownload(cert);
          }, 300);
        }
      }
    }
  }, [resolvedParams.token]);

  const handleDownload = async (certToDownload?: CertificateRecord) => {
    const targetCert = certToDownload || certificate;
    if (!targetCert || targetCert.status === 'Revoked') return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      // Record download activity tracking
      certificateRepository.recordDownload(targetCert.id);

      // Trigger direct Chrome/browser download
      await downloadCertificatePdf(targetCert);

      setDownloadSuccess(true);
      // Refresh local certificate record
      const refreshed = certificateRepository.getById(targetCert.id);
      if (refreshed) setCertificate(refreshed);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewInTab = async () => {
    if (!certificate || certificate.status === 'Revoked') return;
    try {
      await viewCertificatePdfInTab(certificate);
    } catch (err) {
      console.error('View PDF error:', err);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading your certificate credential...</p>
        </div>
      </div>
    );
  }

  // 1. Invalid or Not Found Token State (Step 13)
  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl space-y-6 text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Certificate Link Invalid
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This certificate link is invalid or no longer available. Please contact the issuing institution or verify your credential code.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <span>Verification Lookup</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Expired Link State (Step 14)
  const isExpired = certificate.expiresAt && new Date(certificate.expiresAt).getTime() < Date.now();
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 p-8 rounded-3xl space-y-6 text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Certificate Link Expired
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This certificate access link expired on{' '}
              <strong>{new Date(certificate.expiresAt!).toLocaleDateString()}</strong>. The certificate remains permanently recorded. Please contact your institution administrator to request a renewed download link.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-semibold">{certificate.eventSnapshot.name}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{certificate.recipientSnapshot.fullName}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Revoked Certificate State
  const isRevoked = certificate.status === 'Revoked';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Direct Chrome Download Notification Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm ${
            downloadSuccess
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                downloadSuccess
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
              }`}
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : downloadSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold">
                {isDownloading
                  ? 'Downloading certificate to your Chrome browser...'
                  : downloadSuccess
                  ? '✓ Certificate PDF downloaded to your Chrome browser!'
                  : 'Direct Chrome Browser Download'}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isDownloading
                  ? 'Generating high-resolution official PDF. Check your Chrome download bar.'
                  : `File saved to Chrome downloads: ${certificate.recipientSnapshot.fullName}_${certificate.eventSnapshot.name}_Certificate.pdf`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDownload()}
            disabled={isDownloading || isRevoked}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
          >
            {isDownloading ? 'Downloading...' : 'Download Again'}
          </button>
        </motion.div>

        {/* Top Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-2.5 py-0.5 rounded-full">
                  Official Digital Credential
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                  {certificate.eventSnapshot.name}
                </h1>
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {isRevoked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Revoked</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified & Active</span>
                </span>
              )}
            </div>
          </div>

          {/* Recipient Details & Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Recipient Name</span>
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {certificate.recipientSnapshot.fullName}
              </p>
              {certificate.recipientSnapshot.registrationNumber && (
                <p className="font-mono text-[11px] text-slate-500">
                  Reg: {certificate.recipientSnapshot.registrationNumber}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Issued By</span>
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {certificate.organizationSnapshot.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {certificate.organizationSnapshot.address || 'Academic Center'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Issue Date</span>
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {new Date(certificate.generatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                Code: {certificate.certificateCode}
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleDownload()}
                disabled={isDownloading || isRevoked}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleViewInTab}
                disabled={isRevoked}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 transition"
                title="Open PDF in Full Screen Tab"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Open PDF in Tab</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 transition"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Link</span>
                  </>
                )}
              </button>
            </div>

            {certificate.downloadCount !== undefined && certificate.downloadCount > 0 && (
              <span className="text-[11px] text-slate-500 font-medium">
                Downloaded {certificate.downloadCount} {certificate.downloadCount === 1 ? 'time' : 'times'}
              </span>
            )}
          </div>
        </motion.div>

        {/* Certificate Visual Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Digital Certificate Preview</span>
            </h3>

            <Link
              href={`/verify/${certificate.verificationToken}`}
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Verification Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Certificate Renderer Component */}
          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl transform scale-95 origin-top transition">
              <CertificateRenderer certificate={certificate} />
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p>
            Digitally certified credential issued by <strong>{certificate.organizationSnapshot.name}</strong>
          </p>
          <p className="text-[11px]">
            Powered by CertifyHub Secure Credential Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
