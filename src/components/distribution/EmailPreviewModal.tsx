'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Send,
  UserCheck,
  CheckCircle2,
  X,
  Sparkles,
  Mail,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { EmailConfigSnapshot } from '@/types/distribution';
import { Recipient, EventItem, Organization, CertificateRecord } from '@/types';
import {
  renderFullHtmlEmail,
  replaceVariables,
  TemplateContext,
} from '@/lib/email/templateEngine';
import { defaultSmtpProvider } from '@/lib/email/providers/ServerSmtpProvider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: EmailConfigSnapshot;
  recipients: Recipient[];
  event: EventItem;
  organization: Organization;
  certificates?: CertificateRecord[];
  deliveryMethod?: 'attachment' | 'link' | 'both';
}

export const EmailPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  recipients,
  event,
  organization,
  certificates = [],
  deliveryMethod = 'both',
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const [testEmailInput, setTestEmailInput] = useState('admin@abccollege.edu');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRecipient = recipients[selectedRecipientIndex] || {
    id: 'demo-rec',
    eventId: event.id,
    fullName: 'Subash P',
    email: 'subash@example.com',
    registrationNumber: '23CS101',
    department: 'Computer Science & Engineering',
    course: event.name,
    category: 'winner',
    achievement: 'First Place',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const matchingCert = certificates.find((c) => c.recipientId === currentRecipient.id) || {
    id: 'demo-cert-preview',
    certificateCode: 'ABC-PREVIEW-2026-001',
    verificationToken: 'preview-token-xyz',
    eventId: event.id,
    recipientId: currentRecipient.id,
    templateId: 'modern-blue',
    organizationSnapshot: organization,
    eventSnapshot: event,
    recipientSnapshot: currentRecipient,
    status: 'Valid',
    generatedAt: new Date().toISOString(),
  };

  const context: TemplateContext = {
    recipient: currentRecipient,
    event,
    organization,
    certificate: matchingCert as CertificateRecord,
    portalLink: `https://certifyhub.edu/portal?email=${encodeURIComponent(currentRecipient.email || '')}`,
    verifyUrl: `https://certifyhub.edu/verify/${matchingCert.verificationToken}`,
    downloadLink: `https://certifyhub.edu/verify/${matchingCert.verificationToken}?download=true`,
  };

  const resolvedSubject = replaceVariables(config.subject, context);
  const renderedHtml = renderFullHtmlEmail(config, context);

  const handleSendTestEmail = async () => {
    if (!testEmailInput) return;
    setIsSendingTest(true);
    setTestSentMessage(null);

    const testContext: TemplateContext = {
      ...context,
      recipient: {
        ...currentRecipient,
        email: testEmailInput,
      },
    };

    const testSubject = `[TEST EMAIL] ${replaceVariables(config.subject, testContext)}`;
    const testHtml = `
      <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; padding: 12px; text-align: center; font-family: sans-serif; font-size: 12px; font-weight: bold; color: #92400E; margin-bottom: 20px; border-radius: 8px;">
        ⚠️ THIS IS A TEST EMAIL PREVIEW FROM CERTIFYHUB. NO LIVE RECIPIENT DATA HAS BEEN SENT.
      </div>
      ${renderFullHtmlEmail(config, testContext)}
    `;

    const res = await defaultSmtpProvider.sendEmail({
      to: testEmailInput,
      from: config.fromName || organization.email,
      replyTo: config.replyTo || organization.email,
      subject: testSubject,
      html: testHtml,
    });

    setIsSendingTest(false);
    if (res.success) {
      setTestSentMessage(`Test email successfully delivered to ${testEmailInput}!`);
      setTimeout(() => setTestSentMessage(null), 5000);
    } else {
      setTestSentMessage(`Failed to send test email: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Email Visual Delivery Preview
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Inspect rendered tokens and test formatting across desktop & mobile.
              </p>
            </div>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                deviceMode === 'desktop'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Variable Recipient Selector Toolbar */}
        <div
          className="px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Previewing Recipient:</span>
            </span>
            <select
              value={selectedRecipientIndex}
              onChange={(e) => setSelectedRecipientIndex(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border font-semibold text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {recipients.map((r, idx) => (
                <option key={r.id} value={idx}>
                  {r.fullName} — {r.email || 'No email'} ({r.registrationNumber || r.department || 'Student'})
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Method Pill */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5">
              <span>Method: PDF Attachment</span>
            </span>
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              Attached: {currentRecipient.fullName.trim().replace(/\s+/g, '_')}_Certificate.pdf
            </span>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-100/70 dark:bg-slate-900/70">
          {deviceMode === 'desktop' ? (
            /* Desktop Container */
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col">
              {/* Fake Email Client Chrome */}
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">From:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {config.fromName} &lt;{config.replyTo}&gt;
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">To:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {currentRecipient.fullName} &lt;{currentRecipient.email}&gt;
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                  <span className="font-semibold text-slate-500">Subject:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {resolvedSubject}
                  </span>
                </div>
                {deliveryMethod !== 'link' && (
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Attached: <strong>{currentRecipient.fullName.replace(/\s+/g, '_')}_Certificate.pdf</strong> (1.2 MB)</span>
                  </div>
                )}
              </div>

              {/* Rendered HTML inside iframe / sandboxed container */}
              <div className="p-4 flex-1">
                <iframe
                  title="Desktop Preview"
                  srcDoc={renderedHtml}
                  className="w-full min-h-[460px] border-0 rounded-xl"
                />
              </div>
            </div>
          ) : (
            /* Mobile Device Frame */
            <div className="w-[340px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col">
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />
              <div className="bg-white rounded-[26px] overflow-hidden flex-1 flex flex-col min-h-[500px]">
                <div className="p-3 border-b border-slate-100 bg-slate-50 text-[11px] space-y-1">
                  <p className="font-bold text-slate-900 truncate">{resolvedSubject}</p>
                  <p className="text-[10px] text-slate-500 truncate">From: {config.fromName}</p>
                </div>
                <iframe
                  title="Mobile Preview"
                  srcDoc={renderedHtml}
                  className="w-full flex-1 min-h-[440px] border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer: Send Test Email Action */}
        <div
          className="px-6 py-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="email"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              placeholder="Enter recipient email for test message..."
              className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest || !testEmailInput}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition shrink-0 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingTest ? 'Sending...' : 'Send Test Email'}</span>
            </button>
          </div>

          {testSentMessage && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{testSentMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border font-semibold text-xs transition"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
