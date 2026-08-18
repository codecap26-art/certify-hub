'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  Users,
  Layers,
  ArrowLeft,
  Eye,
  FileDown,
  Search,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { distributionRepository } from '@/lib/storage/distributionRepository';
import { eventRepository } from '@/lib/storage/eventRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import {
  DistributionCampaign,
  EmailDeliveryJob,
  EmailAuditLogEntry,
} from '@/types/distribution';
import { PageHeader } from '@/components/ui/PageHeader';
import { LiveProgressTracker } from '@/components/distribution/LiveProgressTracker';
import { FailedDeliveryManager } from '@/components/distribution/FailedDeliveryManager';
import { SmartResendModal } from '@/components/distribution/SmartResendModal';
import { EmailPreviewModal } from '@/components/distribution/EmailPreviewModal';
import { AuditTrailTimeline } from '@/components/distribution/AuditTrailTimeline';
import { emailQueueEngine } from '@/lib/email/queue/EmailQueueEngine';

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [campaign, setCampaign] = useState<DistributionCampaign | null>(null);
  const [deliveries, setDeliveries] = useState<EmailDeliveryJob[]>([]);
  const [auditLogs, setAuditLogs] = useState<EmailAuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'deliveries' | 'failures' | 'preview' | 'audit'>('deliveries');

  // Filters
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('ALL');
  const [deliverySearch, setDeliverySearch] = useState('');

  // Modals
  const [isSmartResendOpen, setIsSmartResendOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadCampaignData = () => {
    const c = distributionRepository.getCampaignById(resolvedParams.campaignId);
    const d = distributionRepository.getDeliveries(resolvedParams.campaignId);
    const logs = distributionRepository.getAuditLogs(resolvedParams.campaignId);

    setCampaign(c || null);
    setDeliveries(d);
    setAuditLogs(logs);
  };

  useEffect(() => {
    loadCampaignData();
    const interval = setInterval(loadCampaignData, 2500);
    return () => clearInterval(interval);
  }, [resolvedParams.campaignId]);

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Campaign Not Found
        </h2>
        <p className="text-xs text-slate-500">
          No distribution campaign exists for ID: <span className="font-mono">{resolvedParams.campaignId}</span>
        </p>
        <Link
          href="/distribution"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Distribution</span>
        </Link>
      </div>
    );
  }

  const failedDeliveries = deliveries.filter((d) => d.status === 'FAILED');
  const org = organizationRepository.get();
  const event = eventRepository.getById(campaign.eventId) || {
    id: campaign.eventId,
    name: campaign.eventName,
    eventType: 'Workshop',
    description: '',
    startDate: '2026-03-10',
    endDate: '',
    location: 'Campus',
    certificateType: 'Participation',
    coordinatorName: 'Coordinator',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const allRecipients = recipientRepository.getByEventId(campaign.eventId);
  const allCerts = certificateRepository.getByEventId(campaign.eventId);

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.recipientName.toLowerCase().includes(deliverySearch.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(deliverySearch.toLowerCase()) ||
      (d.registrationNumber || '').toLowerCase().includes(deliverySearch.toLowerCase());

    const matchesStatus = deliveryStatusFilter === 'ALL' || d.status === deliveryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetrySelected = async (ids: string[]) => {
    setIsRetrying(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://certifyhub.edu';
    await emailQueueEngine.retryDeliveries(ids, origin);
    loadCampaignData();
    setIsRetrying(false);
  };

  const handleRetryAll = async () => {
    setIsRetrying(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://certifyhub.edu';
    await emailQueueEngine.retryDeliveries(
      failedDeliveries.map((f) => f.id),
      origin
    );
    loadCampaignData();
    setIsRetrying(false);
  };

  const handleSmartResendConfirm = async (mode: 'failed_only' | 'never_sent_only' | 'failed_and_never_sent') => {
    setIsRetrying(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://certifyhub.edu';
    await emailQueueEngine.smartResend(campaign.id, mode, origin);
    setIsSmartResendOpen(false);
    loadCampaignData();
    setIsRetrying(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <PageHeader
        title={campaign.name}
        description={`Live Campaign Dashboard • Academic Program: ${campaign.eventName}`}
        icon={Send}
        breadcrumbs={[
          { label: 'Distribution', href: '/distribution' },
          { label: campaign.name },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Email Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSmartResendOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{
                borderColor: 'var(--primary-border)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Smart Resend</span>
            </button>
          </div>
        }
      />

      {/* Real-time Progress Bar & KPI Tracker */}
      <LiveProgressTracker
        campaign={campaign}
        onRefresh={loadCampaignData}
        onCancel={() => {
          emailQueueEngine.cancelCampaign(campaign.id);
          loadCampaignData();
        }}
      />

      {/* Tabs Bar */}
      <div className="flex border-b text-xs font-bold gap-4" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('deliveries')}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'deliveries'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Delivery Roster ({deliveries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('failures')}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'failures'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Failed Diagnostics & Retries ({failedDeliveries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Email Template Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: DELIVERIES ROSTER */}
      {activeTab === 'deliveries' && (
        <div
          className="p-6 rounded-2xl border space-y-4 shadow-xs"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                placeholder="Filter by recipient name, email address, or register number..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={deliveryStatusFilter}
                onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                className="text-xs rounded-xl px-3 py-2 border focus:outline-none"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="ALL">All Delivery Statuses ({deliveries.length})</option>
                <option value="DELIVERED">Delivered ({deliveries.filter((d) => d.status === 'DELIVERED').length})</option>
                <option value="FAILED">Failed ({deliveries.filter((d) => d.status === 'FAILED').length})</option>
                <option value="QUEUED">Queued ({deliveries.filter((d) => d.status === 'QUEUED').length})</option>
                <option value="PROCESSING">Processing ({deliveries.filter((d) => d.status === 'PROCESSING').length})</option>
                <option value="SENT">Sent ({deliveries.filter((d) => d.status === 'SENT').length})</option>
                <option value="CANCELLED">Cancelled ({deliveries.filter((d) => d.status === 'CANCELLED').length})</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden text-xs" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-left border-collapse">
              <thead style={{ backgroundColor: 'var(--surface-subtle)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Recipient</th>
                  <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Email Address</th>
                  <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Attachment</th>
                  <th className="p-3 font-bold text-center" style={{ color: 'var(--text-secondary)' }}>Attempts</th>
                  <th className="p-3 font-bold text-right" style={{ color: 'var(--text-secondary)' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredDeliveries.map((job) => {
                  const isDelivered = job.status === 'DELIVERED' || job.status === 'OPENED';
                  const isFailed = job.status === 'FAILED';

                  return (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{job.recipientName}</span>
                        {job.registrationNumber && (
                          <span className="font-mono text-[10px] text-slate-400 block">{job.registrationNumber}</span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {job.email || '<missing email>'}
                      </td>

                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border"
                          style={{
                            backgroundColor: isDelivered
                              ? 'var(--success-light)'
                              : isFailed
                              ? 'var(--error-light)'
                              : 'var(--primary-light)',
                            color: isDelivered
                              ? 'var(--success-text)'
                              : isFailed
                              ? 'var(--error-text)'
                              : 'var(--primary)',
                            borderColor: isDelivered
                              ? 'var(--success-border)'
                              : isFailed
                              ? 'var(--error-border)'
                              : 'var(--primary-border)',
                          }}
                        >
                          {job.status}
                        </span>
                        {job.lastError && (
                          <span className="text-[10px] text-red-600 block mt-0.5 truncate max-w-xs">{job.lastError}</span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {job.attachmentFilename || 'Certificate.pdf'}
                      </td>

                      <td className="p-3 text-center font-mono font-bold">
                        {job.attemptCount}
                      </td>

                      <td className="p-3 text-right font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {job.deliveredAt
                          ? new Date(job.deliveredAt).toLocaleTimeString()
                          : job.sentAt
                          ? new Date(job.sentAt).toLocaleTimeString()
                          : job.queuedAt
                          ? new Date(job.queuedAt).toLocaleTimeString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FAILED DIAGNOSTICS & RETRIES */}
      {activeTab === 'failures' && (
        <FailedDeliveryManager
          failedDeliveries={failedDeliveries}
          onRetrySelected={handleRetrySelected}
          onRetryAll={handleRetryAll}
          onUpdateEmailSuccess={loadCampaignData}
          isRetrying={isRetrying}
        />
      )}

      {/* TAB 3: EMAIL TEMPLATE PREVIEW */}
      {activeTab === 'preview' && (
        <div
          className="p-6 rounded-2xl border space-y-4 shadow-xs"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Configured Email Subject & Body
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Sender: {campaign.emailConfig.fromName} &lt;{campaign.emailConfig.replyTo}&gt;
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Interactive Preview</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border text-xs font-mono space-y-2" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border)' }}>
            <p><strong>Subject:</strong> {campaign.subject}</p>
            <p><strong>CTA Button:</strong> {campaign.emailConfig.ctaButtonText}</p>
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <strong>Body Source:</strong>
              <pre className="mt-1 whitespace-pre-wrap font-sans text-xs">{campaign.emailConfig.body}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <AuditTrailTimeline logs={auditLogs} />
      )}

      {/* Smart Resend Modal */}
      <SmartResendModal
        isOpen={isSmartResendOpen}
        onClose={() => setIsSmartResendOpen(false)}
        campaign={campaign}
        deliveries={deliveries}
        onConfirmResend={handleSmartResendConfirm}
        isProcessing={isRetrying}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        config={campaign.emailConfig}
        recipients={allRecipients.length > 0 ? allRecipients : [{ id: 'demo', fullName: 'Sample Recipient', email: 'sample@example.com', eventId: event.id, createdAt: '', updatedAt: '' }]}
        event={event}
        organization={org}
        certificates={allCerts}
        deliveryMethod={campaign.deliveryMethod}
      />
    </div>
  );
}
