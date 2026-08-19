'use client';

import React, { useState } from 'react';
import {
  Mail,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Paperclip,
  User,
} from 'lucide-react';
import { CertificateRecord } from '@/types';
import { defaultSmtpProvider } from '@/lib/email/providers/ServerSmtpProvider';
import { generateCertificatePdfBase64 } from '@/lib/certificate/pdfGenerator';
import {
  renderFullHtmlEmail,
  generateSafeAttachmentFilename,
  replaceVariables,
  TemplateContext,
} from '@/lib/email/templateEngine';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { distributionRepository } from '@/lib/storage/distributionRepository';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateRecord;
  onSuccess?: () => void;
}

export const SendSingleCertificateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  certificate,
  onSuccess,
}) => {
  const recipient = certificate.recipientSnapshot;
  const event = certificate.eventSnapshot;
  const org = certificate.organizationSnapshot || organizationRepository.get();

  const [toEmail, setToEmail] = useState(recipient.email || '');
  const [subject, setSubject] = useState(`Your Certificate for ${event.name} — ${recipient.fullName}`);
  const [customMessage, setCustomMessage] = useState(
    `<p>Hello <strong>{{recipient.name}}</strong>,</p><p>Congratulations! Your official certificate for <strong>{{event.name}}</strong> has been issued by <strong>{{institution.name}}</strong>.</p><p>Please find your certificate attached to this email as a PDF document.</p>`
  );
  const [isSending, setIsSending] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    type: 'success' | 'error';
    message: string;
    messageId?: string;
  } | null>(null);

  if (!isOpen) return null;

  const safeFilename = generateSafeAttachmentFilename(
    recipient.fullName || 'Recipient',
    event.name || 'Certificate'
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = toEmail.trim();

    if (!cleanEmail) {
      setStatusResult({
        type: 'error',
        message: 'Recipient email address is required.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setStatusResult({
        type: 'error',
        message: `Invalid email address format: "${cleanEmail}"`,
      });
      return;
    }

    setIsSending(true);
    setStatusResult(null);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://certifyhub.edu';
      
      // 1. Generate high-resolution PDF Attachment
      const pdfBase64 = await generateCertificatePdfBase64(certificate, origin);

      // 2. Prepare Context & HTML Template
      const downloadUrl = `${origin}/verify/${certificate.verificationToken}?download=true`;
      const context: TemplateContext = {
        recipient: {
          ...recipient,
          email: cleanEmail,
        },
        event,
        organization: org,
        certificate,
        portalLink: `${origin}/portal?email=${encodeURIComponent(cleanEmail)}`,
        verifyUrl: `${origin}/verify/${certificate.verificationToken}`,
        downloadLink: downloadUrl,
      };

      const emailConfig = {
        subject,
        body: customMessage,
        fromName: org.name || 'CertifyHub Issuer',
        replyTo: org.email || 'principal@bitsathy.ac.in',
        includeLogo: true,
        includeSignatory: true,
        footerText: org.footerText || 'Official Verified Credential via CertifyHub.',
      };

      const renderedHtml = renderFullHtmlEmail(emailConfig, context);
      const renderedSubject = replaceVariables(subject, context);

      // 3. Dispatch Email via Provider with PDF Attachment
      const result = await defaultSmtpProvider.sendEmail({
        to: cleanEmail,
        from: org.name || 'CertifyHub Issuer',
        replyTo: org.email || 'contact@abccollege.edu',
        subject: renderedSubject,
        html: renderedHtml,
        certificate,
        attachments: [
          {
            filename: safeFilename,
            content: pdfBase64,
            contentType: 'application/pdf',
          },
        ],
        metadata: {
          recipientId: recipient.id,
          recipientName: recipient.fullName,
          certificateId: certificate.id,
          eventId: certificate.eventId,
        },
      });

      setIsSending(false);

      if (result.success) {
        setStatusResult({
          type: 'success',
          message: `Certificate successfully emailed to ${cleanEmail}! The PDF is attached.`,
          messageId: result.messageId,
        });

        // Audit Logging
        distributionRepository.addAuditLog({
          institutionId: org.id || 'org-main',
          action: 'TEST_EMAIL_SENT',
          entityId: certificate.id,
          entityType: 'delivery',
          user: 'Administrator',
          details: `Certificate ${certificate.certificateCode} delivered to ${cleanEmail} with attached PDF (${safeFilename})`,
        });

        // In-portal notification
        distributionRepository.addNotification({
          recipientEmail: cleanEmail,
          recipientId: recipient.id,
          certificateId: certificate.id,
          eventId: event.id,
          eventName: event.name,
          title: 'Certificate Delivered to Email',
          message: `Your official certificate was sent to ${cleanEmail} as a PDF attachment.`,
          isRead: false,
        });

        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000);
        }
      } else {
        setStatusResult({
          type: 'error',
          message: result.error || 'Failed to dispatch email. Please check your SMTP settings in Distribution.',
        });
      }
    } catch (err: any) {
      setIsSending(false);
      setStatusResult({
        type: 'error',
        message: `An unexpected error occurred: ${err?.message || String(err)}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Modal Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-800"
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Email Certificate to Recipient
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Directly deliver this credential with the high-resolution PDF attached.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4 text-xs">
          {/* Certificate Snapshot Summary Header */}
          <div
            className="p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {recipient.fullName}
                </span>
                <span className="text-[11px] ml-1.5 opacity-70">
                  ({recipient.registrationNumber || recipient.department || 'Student'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                {certificate.certificateCode}
              </span>
            </div>
          </div>

          {/* Recipient Email Input */}
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--text-primary)' }}>
              Recipient Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="e.g. student@college.edu"
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Email Subject */}
          <div className="space-y-1.5">
            <label className="font-bold block" style={{ color: 'var(--text-primary)' }}>
              Email Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Attachment Notice Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <Paperclip className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[11px] flex items-center gap-1.5">
                  <span>Attached PDF Document</span>
                  <span className="bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[9px] px-1.5 py-0.5 rounded font-mono">
                    application/pdf
                  </span>
                </p>
                <p className="font-mono text-[10px] opacity-80 truncate max-w-[280px]">
                  {safeFilename}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-1 rounded-md">
              ✓ Attached
            </span>
          </div>

          {/* Status Alert */}
          {statusResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                statusResult.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-200'
              }`}
            >
              {statusResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold">{statusResult.message}</p>
                {statusResult.messageId && (
                  <p className="text-[10px] font-mono opacity-80">Message ID: {statusResult.messageId}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2.5 rounded-xl border font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating PDF & Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Mail with Attached Certificate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
