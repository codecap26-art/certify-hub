'use client';

import React from 'react';
import {
  Sparkles,
  Layers,
  FileText,
  Bold,
  Italic,
  Link2,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  Building2,
} from 'lucide-react';
import { EmailConfigSnapshot, EmailTemplate } from '@/types/distribution';
import { BUILT_IN_EMAIL_TEMPLATES } from '@/lib/storage/distributionRepository';

interface Props {
  config: EmailConfigSnapshot;
  onChange: (updated: EmailConfigSnapshot) => void;
  availableTemplates?: EmailTemplate[];
  onSelectTemplate?: (template: EmailTemplate) => void;
}

export const DYNAMIC_VARIABLES = [
  { token: '{{recipient.name}}', label: 'Recipient Name', example: 'Subash P' },
  { token: '{{recipient.register_number}}', label: 'Register No', example: '23CS101' },
  { token: '{{recipient.department}}', label: 'Department', example: 'CSE' },
  { token: '{{event.name}}', label: 'Event Name', example: 'AI Workshop 2026' },
  { token: '{{certificate.title}}', label: 'Certificate Title', example: 'Certificate of Achievement' },
  { token: '{{issue_date}}', label: 'Issue Date', example: 'March 15, 2026' },
  { token: '{{institution.name}}', label: 'Institution Name', example: 'ABC Engineering College' },
  { token: '{{download_link}}', label: 'Download Link', example: 'https://certifyhub.edu/verify/...' },
];

export const EmailTemplateEditor: React.FC<Props> = ({
  config,
  onChange,
  availableTemplates = BUILT_IN_EMAIL_TEMPLATES,
  onSelectTemplate,
}) => {
  const insertToken = (token: string) => {
    onChange({
      ...config,
      body: config.body + ` ${token} `,
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Presets Bar */}
      <div
        className="p-4 rounded-2xl border space-y-3"
        style={{
          backgroundColor: 'var(--surface-subtle)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <Layers className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span>Institutional Email Template Presets</span>
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Select a pre-built institutional template
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {availableTemplates.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => {
                if (onSelectTemplate) {
                  onSelectTemplate(tmpl);
                } else {
                  onChange({
                    fromName: tmpl.fromName,
                    replyTo: tmpl.replyTo,
                    subject: tmpl.subject,
                    body: tmpl.body,
                    ctaButtonText: tmpl.ctaButtonText,
                    includeLogo: tmpl.includeLogo,
                    includeSignatory: tmpl.includeSignatory,
                    footerText: tmpl.footerText,
                  });
                }
              }}
              className="text-left p-3 rounded-xl border text-xs transition-all hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between space-y-1.5"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold truncate text-[11px]">{tmpl.name}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-semibold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {tmpl.category}
                </span>
              </div>
              <p className="text-[10px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                {tmpl.subject}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Composer Fields */}
      <div
        className="p-6 rounded-2xl border space-y-5"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              From Sender Name
            </label>
            <input
              type="text"
              value={config.fromName}
              onChange={(e) => onChange({ ...config, fromName: e.target.value })}
              placeholder="e.g. ABC College of Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Reply-To Email Address
            </label>
            <input
              type="email"
              value={config.replyTo}
              onChange={(e) => onChange({ ...config, replyTo: e.target.value })}
              placeholder="e.g. certificates@abccollege.edu"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            Email Subject Line
          </label>
          <input
            type="text"
            value={config.subject}
            onChange={(e) => onChange({ ...config, subject: e.target.value })}
            placeholder="e.g. Your {{event.name}} Certificate of {{certificate.title}}"
            className="w-full px-3.5 py-2.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Dynamic Variable Quick-Insert Chips */}
        <div className="space-y-2 pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              <span>Insert Dynamic Personalization Tokens:</span>
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Click token to insert into body
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DYNAMIC_VARIABLES.map((v) => (
              <button
                key={v.token}
                type="button"
                onClick={() => insertToken(v.token)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--primary-light)',
                  borderColor: 'var(--primary-border)',
                  color: 'var(--primary)',
                }}
                title={`Example value: ${v.example}`}
              >
                <span>+</span>
                <span>{v.token}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Email Body Content Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Email Body Content (Rich Text / HTML / Markdown supported)
            </label>
          </div>
          <textarea
            rows={7}
            value={config.body}
            onChange={(e) => onChange({ ...config, body: e.target.value })}
            placeholder="Write personalized email body here..."
            className="w-full p-3.5 rounded-xl text-xs border font-mono leading-relaxed focus:outline-none focus:ring-2 resize-y"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* CTA Button Text & Footer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Action Button (CTA) Label
            </label>
            <input
              type="text"
              value={config.ctaButtonText}
              onChange={(e) => onChange({ ...config, ctaButtonText: e.target.value })}
              placeholder="e.g. Download Official Certificate"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Institutional Footer Text
            </label>
            <input
              type="text"
              value={config.footerText}
              onChange={(e) => onChange({ ...config, footerText: e.target.value })}
              placeholder="e.g. Digitally verified credential issued by ABC College."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Brand Kit Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={config.includeLogo}
              onChange={(e) => onChange({ ...config, includeLogo: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Include Official Institute Logo Header</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={config.includeSignatory}
              onChange={(e) => onChange({ ...config, includeSignatory: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Include Signatory Signature & Seal</span>
          </label>
        </div>
      </div>
    </div>
  );
};
