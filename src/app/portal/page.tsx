'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Award,
  Download,
  Eye,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Calendar,
  Building2,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { distributionRepository } from '@/lib/storage/distributionRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { CertificateRecord, Recipient, Organization } from '@/types';
import { RecipientNotification } from '@/types/distribution';
import { PageHeader } from '@/components/ui/PageHeader';
import { downloadCertificatePdf, viewCertificatePdfInTab } from '@/lib/certificate/pdfGenerator';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';

export default function RecipientPortalPage() {
  const [lookupQuery, setLookupQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [notifications, setNotifications] = useState<RecipientNotification[]>([]);
  const [previewCert, setPreviewCert] = useState<CertificateRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const org = organizationRepository.get();

  const handleSearch = (query: string) => {
    setActiveQuery(query);
    const clean = query.trim().toLowerCase();
    if (!clean) {
      setCertificates([]);
      setNotifications([]);
      return;
    }

    // 1. Find all matching recipients by email or roll no
    const allRecipients = recipientRepository.getAll();
    const matchedRecs = allRecipients.filter(
      (r) =>
        (r.email && r.email.toLowerCase() === clean) ||
        (r.registrationNumber && r.registrationNumber.toLowerCase() === clean)
    );

    const recIds = new Set(matchedRecs.map((r) => r.id));

    // 2. Fetch all matching certificates
    const allCerts = certificateRepository.getAll();
    const matchedCerts = allCerts.filter(
      (c) =>
        recIds.has(c.recipientId) ||
        (c.recipientSnapshot.email && c.recipientSnapshot.email.toLowerCase() === clean) ||
        (c.recipientSnapshot.registrationNumber && c.recipientSnapshot.registrationNumber.toLowerCase() === clean)
    );
    setCertificates(matchedCerts);

    // 3. Fetch recipient notifications
    const notifs = distributionRepository.getNotifications(clean);
    setNotifications(notifs);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setLookupQuery(emailParam);
        handleSearch(emailParam);
      }
    }
  }, []);

  const handleDownload = async (cert: CertificateRecord) => {
    setIsDownloading(cert.id);
    await downloadCertificatePdf(cert);
    setIsDownloading(null);
  };

  const handleMarkNotificationRead = (notifId: string) => {
    distributionRepository.markNotificationRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Student & Recipient Credential Portal"
        description="Access and verify your official digitally signed academic certificates, achievement badges, and workshop credentials."
        icon={Award}
        breadcrumbs={[{ label: 'Recipient Portal' }]}
      />

      {/* Recipient Search / Identity Box */}
      <div
        className="p-6 rounded-2xl border space-y-4 shadow-xs"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Lookup Official Academic Credentials
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Enter your registered student email address or university registration number.
            </p>
          </div>

          {/* Quick Demo Identities Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold text-slate-400">Quick Test:</span>
            {['subash@example.com', 'arun@example.com', 'priya@example.com', '23CS101'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setLookupQuery(id);
                  handleSearch(id);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono border hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                style={{
                  borderColor: 'var(--primary-border)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(lookupQuery)}
              placeholder="e.g. subash@example.com or 23CS101"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => handleSearch(lookupQuery)}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition hover:brightness-105 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
          >
            Find My Certificates
          </button>
        </div>
      </div>

      {/* In-Portal Notifications Section */}
      {notifications.length > 0 && (
        <div
          className="p-5 rounded-2xl border space-y-3 bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-2 text-blue-900 dark:text-blue-200">
              <Bell className="w-4 h-4 text-blue-600 animate-bounce" />
              <span>In-Portal Notifications ({notifications.length})</span>
            </span>
            <span className="text-[11px] text-blue-700">Real-time alerts</span>
          </div>

          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">{n.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkNotificationRead(n.id)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issued Certificates List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            My Issued Certificates ({certificates.length})
          </h2>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographically Verified</span>
          </span>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl border space-y-4 shadow-xs transition hover:shadow-md flex flex-col justify-between"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
                      {cert.eventSnapshot.eventType || 'Official Program'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                      {cert.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {cert.eventSnapshot.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Recipient: <strong>{cert.recipientSnapshot.fullName}</strong>
                      {cert.recipientSnapshot.registrationNumber && ` (${cert.recipientSnapshot.registrationNumber})`}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl border text-[11px] space-y-1" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credential Code:</span>
                      <span className="font-mono font-bold">{cert.certificateCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issued On:</span>
                      <span className="font-mono">{new Date(cert.generatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewCert(cert)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(cert)}
                    disabled={isDownloading === cert.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading === cert.id ? 'Generating...' : 'Download PDF'}</span>
                  </button>

                  <Link
                    href={`/verify/${cert.verificationToken}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-semibold"
                  >
                    <span>Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-12 rounded-2xl border text-center space-y-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              No Certificates Found for "{activeQuery}"
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Try searching by your student email address or register number above.
            </p>
          </div>
        )}
      </div>

      {/* Certificate Modal Preview */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden p-6 space-y-4 flex flex-col animate-in fade-in"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Credential Document Preview — {previewCert.recipientSnapshot.fullName}
              </span>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex justify-center p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
              <CertificateRenderer certificate={previewCert} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
