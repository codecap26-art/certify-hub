'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Send,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Calendar,
  Users,
  Building2,
  Mail,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { distributionRepository } from '@/lib/storage/distributionRepository';
import { eventRepository } from '@/lib/storage/eventRepository';
import { DistributionCampaign } from '@/types/distribution';
import { PageHeader } from '@/components/ui/PageHeader';
import { emailQueueEngine } from '@/lib/email/queue/EmailQueueEngine';

export default function DistributionOverviewPage() {
  const [campaigns, setCampaigns] = useState<DistributionCampaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; user?: string; message?: string } | null>(null);
  const [isCheckingSmtp, setIsCheckingSmtp] = useState(true);
  const [smtpUserInput, setSmtpUserInput] = useState('');
  const [smtpPassInput, setSmtpPassInput] = useState('');
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  const checkSmtp = async () => {
    try {
      setIsCheckingSmtp(true);
      const res = await fetch('/api/email/verify-smtp');
      const data = await res.json();
      setSmtpStatus(data);
      if (data.user && data.user !== 'Not set') {
        setSmtpUserInput(data.user);
      }
    } catch {
      setSmtpStatus({ configured: false, message: 'Could not connect to SMTP verification endpoint' });
    } finally {
      setIsCheckingSmtp(false);
    }
  };

  const handleSaveSmtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!smtpUserInput.trim() || !smtpPassInput.trim()) {
      setSaveSmtpResult({ success: false, message: 'Please provide both your Gmail address and Google App Password.' });
      return;
    }

    try {
      setIsSavingSmtp(true);
      setSaveSmtpResult(null);
      const res = await fetch('/api/email/configure-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpUser: smtpUserInput.trim(),
          smtpPass: smtpPassInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSmtpResult({ success: true, message: `✓ ${data.message}` });
        await checkSmtp();
      } else {
        setSaveSmtpResult({ success: false, message: data.error || 'Failed to authenticate with Gmail' });
      }
    } catch (err: any) {
      setSaveSmtpResult({ success: false, message: err?.message || 'Network error saving SMTP credentials' });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) return;
    try {
      setIsSendingTest(true);
      setTestResult(null);
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: testEmailAddress.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: `✓ Test email sent successfully to ${testEmailAddress}!` });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send test email' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Network error sending test email' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const loadData = () => {
    // Check scheduled campaigns
    emailQueueEngine.checkScheduledCampaigns();
    const all = distributionRepository.getCampaigns();
    setCampaigns(all);
  };

  useEffect(() => {
    loadData();
    checkSmtp();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalCampaigns = campaigns.length;
  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
  const totalFailed = campaigns.reduce((acc, c) => acc + (c.failedCount || 0), 0);
  const totalQueued = campaigns.reduce((acc, c) => acc + (c.queuedCount || 0), 0);
  const totalRecipients = campaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0);
  const successRate = totalRecipients > 0 ? Math.round((totalDelivered / (totalDelivered + totalFailed || 1)) * 100) : 100;

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <PageHeader
        title="Automated Certificate Email Distribution"
        description="Queue, personalize, batch, and monitor verified certificate email campaigns across academic cohorts."
        icon={Send}
        breadcrumbs={[{ label: 'Certificate Distribution' }]}
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Send Test Email</span>
            </button>

            <Link
              href="/portal"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Recipient Portal</span>
            </Link>

            <Link
              href="/distribution/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Distribution</span>
            </Link>
          </div>
        }
      />

      {/* SMTP Configuration Status Card */}
      {!isCheckingSmtp && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xs ${
            smtpStatus?.configured
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                smtpStatus?.configured
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {smtpStatus?.configured ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold flex items-center gap-2">
                <span>{smtpStatus?.configured ? 'Gmail SMTP Server Connected & Active' : 'Gmail SMTP Not Configured'}</span>
                {smtpStatus?.configured && (
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 px-2 py-0.5 rounded-full font-mono">
                    {smtpStatus.user}
                  </span>
                )}
              </p>
              <p className="text-[11px] opacity-80">
                {smtpStatus?.configured
                  ? 'Real emails with attached certificate PDFs will be delivered directly to students’ Gmail / inbox.'
                  : 'To send real emails to recipient inboxes, configure your Gmail address and Google App Password below or in .env.local.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowTestModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl border bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              style={{ borderColor: 'var(--border)' }}
            >
              {smtpStatus?.configured ? 'Send Test Email' : 'Setup & Test SMTP'}
            </button>
            <button
              type="button"
              onClick={checkSmtp}
              className="p-1.5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Refresh SMTP status"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl border space-y-1.5 shadow-xs"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold">Total Campaigns</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono" style={{ color: 'var(--text-primary)' }}>
            {totalCampaigns}
          </p>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {totalRecipients.toLocaleString()} total recipients
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border space-y-1.5 shadow-xs"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="font-semibold">Emails Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-700">
            {totalDelivered.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600">
            {successRate}% overall success rate
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border space-y-1.5 shadow-xs"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold">Queued & In-Flight</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono" style={{ color: 'var(--text-primary)' }}>
            {totalQueued}
          </p>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Active background workers
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border space-y-1.5 shadow-xs"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs text-amber-700">
            <span className="font-semibold">Failed Deliveries</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-amber-700">
            {totalFailed}
          </p>
          <span className="text-[11px] text-amber-600">
            Eligible for smart retry
          </span>
        </div>
      </div>

      {/* Search & Status Filters Bar */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns by name, event program, or subject line..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 border focus:outline-none"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Statuses ({campaigns.length})</option>
            <option value="completed">Completed ({campaigns.filter((c) => c.status === 'completed').length})</option>
            <option value="processing">Processing ({campaigns.filter((c) => c.status === 'processing').length})</option>
            <option value="scheduled">Scheduled ({campaigns.filter((c) => c.status === 'scheduled').length})</option>
            <option value="cancelled">Cancelled ({campaigns.filter((c) => c.status === 'cancelled').length})</option>
          </select>
        </div>
      </div>

      {/* Recent Campaigns Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Recent Campaigns ({filteredCampaigns.length})
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Auto-refreshing live progress
          </span>
        </div>

        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.map((camp) => {
              const processed = (camp.deliveredCount || 0) + (camp.failedCount || 0);
              const total = camp.totalRecipients || 1;
              const pct = Math.min(100, Math.round((processed / total) * 100));

              return (
                <div
                  key={camp.id}
                  className="p-5 rounded-2xl border transition hover:shadow-md space-y-4"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {/* Top Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {camp.name}
                        </h3>

                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono border"
                          style={{
                            backgroundColor:
                              camp.status === 'completed'
                                ? 'var(--success-light)'
                                : camp.status === 'cancelled'
                                ? 'var(--error-light)'
                                : camp.status === 'scheduled'
                                ? 'var(--info-light)'
                                : 'var(--primary-light)',
                            color:
                              camp.status === 'completed'
                                ? 'var(--success-text)'
                                : camp.status === 'cancelled'
                                ? 'var(--error-text)'
                                : camp.status === 'scheduled'
                                ? 'var(--info-text)'
                                : 'var(--primary)',
                            borderColor:
                              camp.status === 'completed'
                                ? 'var(--success-border)'
                                : camp.status === 'cancelled'
                                ? 'var(--error-border)'
                                : camp.status === 'scheduled'
                                ? 'var(--info-border)'
                                : 'var(--primary-border)',
                          }}
                        >
                          {camp.status}
                        </span>
                      </div>

                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Event: <strong className="text-slate-800 dark:text-slate-200">{camp.eventName}</strong> • Delivery:{' '}
                        <span className="capitalize">{camp.deliveryMethod}</span> • Created:{' '}
                        {new Date(camp.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/distribution/${camp.id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition hover:bg-slate-50 dark:hover:bg-slate-800"
                        style={{
                          backgroundColor: 'var(--surface-subtle)',
                          borderColor: 'var(--border)',
                          color: 'var(--primary)',
                        }}
                      >
                        <span>Campaign Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Delivery Progress
                      </span>
                      <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>
                        {pct}% ({processed} / {total})
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border" style={{ borderColor: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          background:
                            camp.status === 'completed'
                              ? '#16A34A'
                              : camp.status === 'cancelled'
                              ? '#DC2626'
                              : '#2563EB',
                        }}
                      />
                    </div>
                  </div>

                  {/* Recipient Statistics Breakdown Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                      <span className="text-[10px] text-slate-500 block">Recipients</span>
                      <span className="font-bold font-mono text-sm">{camp.totalRecipients}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                      <span className="text-[10px] text-emerald-600 block">Delivered</span>
                      <span className="font-bold font-mono text-sm">{camp.deliveredCount || 0}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                      <span className="text-[10px] text-amber-600 block">Failed</span>
                      <span className="font-bold font-mono text-sm">{camp.failedCount || 0}</span>
                    </div>

                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                      <span className="text-[10px] text-slate-500 block">Queued / Pending</span>
                      <span className="font-bold font-mono text-sm">{camp.queuedCount || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="p-12 rounded-2xl border text-center space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                No Distribution Campaigns Found
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Create your first automated certificate email distribution campaign.
              </p>
            </div>
            <Link
              href="/distribution/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        )}
      </div>

      {/* Send Test Email & Setup Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>
                    Gmail SMTP Live Email Setup
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Configure Google SMTP to send real certificate emails directly to students
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setSaveSmtpResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--border)' }}
              >
                Close
              </button>
            </div>

            {/* Quick 3-Step Setup Guide */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>How to get your Google App Password (1 minute):</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11.5px] leading-relaxed">
                <li>Turn ON 2-Step Verification in <a href="https://myaccount.google.com/security" target="_blank" className="text-blue-600 underline font-semibold">Google Account Security</a>.</li>
                <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-blue-600 underline font-semibold">Google App Passwords</a>.</li>
                <li>Generate a 16-character password for "Mail" (e.g. <code>abcd efgh ijkl mnop</code>).</li>
                <li>Enter your Gmail and 16-character App Password below and click <strong>"Save & Connect"</strong>:</li>
              </ol>
            </div>

            {/* In-App Credentials Form */}
            <form onSubmit={handleSaveSmtp} className="p-4 rounded-2xl border space-y-4 bg-slate-50/50 dark:bg-slate-900/50" style={{ borderColor: 'var(--border)' }}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Enter Gmail Credentials
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Sender Gmail (SMTP_USER):
                  </label>
                  <input
                    type="email"
                    required
                    value={smtpUserInput}
                    onChange={(e) => setSmtpUserInput(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    16-Char App Password (SMTP_PASS):
                  </label>
                  <input
                    type="password"
                    required
                    value={smtpPassInput}
                    onChange={(e) => setSmtpPassInput(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {saveSmtpResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    saveSmtpResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200 font-semibold'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {saveSmtpResult.message}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSmtp || !smtpUserInput.trim() || !smtpPassInput.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition"
                >
                  {isSavingSmtp ? 'Verifying with Google...' : 'Save & Connect Gmail SMTP'}
                </button>
              </div>
            </form>

            {/* Test Input & Sender */}
            <div className="p-4 rounded-2xl border space-y-3" style={{ borderColor: 'var(--border)' }}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Send Test Email to Any Inbox
              </h4>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Recipient Destination Email (TO):
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="e.g. abineshk2007@gmail.com"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={isSendingTest || !testEmailAddress.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition shrink-0"
                  >
                    {isSendingTest ? 'Sending...' : 'Send Live Test'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs mt-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200 font-semibold'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setSaveSmtpResult(null);
                }}
                className="px-5 py-2.5 rounded-xl border text-xs font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
