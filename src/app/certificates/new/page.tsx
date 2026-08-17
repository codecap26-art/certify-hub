// ============================================================================
// Individual Certificate Creator Mode — Workflow 11
// Step-by-step single certificate creation workflow with quality check & PDF
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { UserCheck, Sparkles, Download, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { templateRepository } from '@/lib/storage/templateRepository';
import { CustomTemplate } from '@/types/template';
import { runQualityAudit, QualityReport } from '@/lib/editor/qualityChecker';
import { CertificateDocument, migrateFromLegacy } from '@/lib/editor/documentModel';
import { getCategoryDefaultTemplateId } from '@/lib/template/categoryTemplateUtils';

export default function IndividualCertificatePage() {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [recipientName, setRecipientName] = useState('SUBASH P');
  const [recipientEmail, setRecipientEmail] = useState('subash@example.com');
  const [registrationNumber, setRegistrationNumber] = useState('23CS101');
  const [recipientCategory, setRecipientCategory] = useState<'winner' | 'runner' | 'participant'>('participant');
  const [eventName, setEventName] = useState('SOFTWARE INNOVATION CHALLENGE 2026');
  const [certificateCode, setCertificateCode] = useState(`ID: CERT-2026-IND-${Math.floor(1000 + Math.random() * 9000)}`);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);

  useEffect(() => {
    const list = templateRepository.getAll();
    setTemplates(list);
    if (list.length > 0) {
      const defaultId = getCategoryDefaultTemplateId(recipientCategory, list);
      setSelectedTemplateId(defaultId || list[0].id);
    }
  }, []);

  const handleCategoryChange = (cat: 'winner' | 'runner' | 'participant') => {
    setRecipientCategory(cat);
    const matchedId = getCategoryDefaultTemplateId(cat, templates);
    if (matchedId) {
      setSelectedTemplateId(matchedId);
    }
  };

  const handleRunAudit = () => {
    const selected = templates.find((t) => t.id === selectedTemplateId);
    if (!selected) return;
    const doc: CertificateDocument = migrateFromLegacy(selected as any);
    const report = runQualityAudit(doc);
    setQualityReport(report);
  };

  const handleGeneratePdf = () => {
    alert(`Generating print-quality PDF for recipient ${recipientName} (${recipientCategory.toUpperCase()})...`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Create Individual Certificate"
        description="Generate a single print-ready certificate manually for one recipient."
        icon={UserCheck}
        breadcrumbs={[
          { label: 'Studio', href: '/studio' },
          { label: 'Create Individual Certificate' },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs text-xs">
        {/* Step 1: Select Template */}
        <div className="space-y-2">
          <label className="font-bold text-sm text-slate-900 block">Step 1: Select Certificate Template</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Recipient Details */}
        <div className="space-y-4">
          <label className="font-bold text-sm text-slate-900 block">Step 2: Recipient Details</label>

          {/* Role / Status Question Box */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
            <span className="block font-bold text-slate-800">Is this recipient a Winner, Runner, or Participated? *</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('winner')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  recipientCategory === 'winner'
                    ? 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E] ring-2 ring-[#FCD34D]/50 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">🏆</span>
                <span>Winner</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('runner')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  recipientCategory === 'runner'
                    ? 'bg-[#F5F3FF] border-[#C4B5FD] text-[#5B21B6] ring-2 ring-[#C4B5FD]/50 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">🥈</span>
                <span>Runner</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('participant')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  recipientCategory === 'participant'
                    ? 'bg-[#ECFEFF] border-[#67E8F9] text-[#155E75] ring-2 ring-[#67E8F9]/50 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-base">📜</span>
                <span>Participated</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block font-semibold text-slate-700 mb-1">Full Name</span>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded-lg font-bold text-slate-900"
              />
            </div>
            <div>
              <span className="block font-semibold text-slate-700 mb-1">Email Address</span>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded-lg"
              />
            </div>
            <div>
              <span className="block font-semibold text-slate-700 mb-1">Reg / Roll Number</span>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded-lg"
              />
            </div>
            <div>
              <span className="block font-semibold text-slate-700 mb-1">Event Name</span>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Certificate Code & Audit */}
        <div className="space-y-3 border-t pt-4">
          <label className="font-bold text-sm text-slate-900 block">Step 3: Unique Code & Quality Audit</label>
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
            <span className="font-mono text-slate-700 font-bold">{certificateCode}</span>
            <button
              onClick={handleRunAudit}
              className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition"
            >
              Run Quality Audit
            </button>
          </div>

          {qualityReport && (
            <div className="bg-slate-50 border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-900">Quality Audit Summary</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {qualityReport.passedCount} Passed | {qualityReport.warningCount} Warnings | {qualityReport.errorCount} Errors
                </span>
              </div>
              {qualityReport.items.map((item) => (
                <div key={item.id} className="flex items-start gap-1.5 text-[11px]">
                  {item.severity === 'pass' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
                  {item.severity === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                  {item.severity === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
                  <span>
                    <strong className="text-slate-800">{item.title}:</strong> {item.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Export PDF */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGeneratePdf}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
          >
            <Download className="w-4 h-4" /> Generate Print-Quality PDF
          </button>
        </div>
      </div>
    </div>
  );
};
