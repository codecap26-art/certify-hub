'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Calendar,
  Users,
  Mail,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  CheckSquare,
  Square,
  Clock,
  Layers,
  Sparkles,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { eventRepository } from '@/lib/storage/eventRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { distributionRepository, BUILT_IN_EMAIL_TEMPLATES } from '@/lib/storage/distributionRepository';
import { EventItem, Recipient, CertificateRecord, Organization } from '@/types';
import {
  DistributionCampaign,
  EmailConfigSnapshot,
  DeliveryMethod,
  PreFlightValidationReport,
} from '@/types/distribution';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmailTemplateEditor } from '@/components/distribution/EmailTemplateEditor';
import { EmailPreviewModal } from '@/components/distribution/EmailPreviewModal';
import { PreFlightValidationCard } from '@/components/distribution/PreFlightValidationCard';
import { SendConfirmationModal } from '@/components/distribution/SendConfirmationModal';
import { LiveProgressTracker } from '@/components/distribution/LiveProgressTracker';
import { emailQueueEngine } from '@/lib/email/queue/EmailQueueEngine';

const WIZARD_STEPS = [
  { id: 1, name: 'Select Batch', icon: Layers },
  { id: 2, name: 'Select Recipients', icon: Users },
  { id: 3, name: 'Configure Email', icon: Mail },
  { id: 4, name: 'Review & Validate', icon: ShieldCheck },
  { id: 5, name: 'Confirm & Send', icon: Send },
  { id: 6, name: 'Live Progress', icon: Sparkles },
];

export default function NewDistributionWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Storage Data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [allCertificates, setAllCertificates] = useState<CertificateRecord[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [org, setOrg] = useState<Organization>(organizationRepository.get());

  // Selections
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [emailStatusFilter, setEmailStatusFilter] = useState('ALL');

  // Email Config
  const defaultTmpl = BUILT_IN_EMAIL_TEMPLATES[0];
  const [emailConfig, setEmailConfig] = useState<EmailConfigSnapshot>({
    fromName: defaultTmpl.fromName,
    replyTo: defaultTmpl.replyTo,
    subject: defaultTmpl.subject,
    body: defaultTmpl.body,
    ctaButtonText: defaultTmpl.ctaButtonText,
    includeLogo: defaultTmpl.includeLogo,
    includeSignatory: defaultTmpl.includeSignatory,
    footerText: defaultTmpl.footerText,
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('both');
  const [campaignName, setCampaignName] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Modals & Progress
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<DistributionCampaign | null>(null);

  useEffect(() => {
    const evts = eventRepository.getAll();
    const certs = certificateRepository.getAll();
    const currentOrg = organizationRepository.get();

    setEvents(evts);
    setAllCertificates(certs);
    setOrg(currentOrg);

    if (evts.length > 0) {
      setSelectedEventId(evts[0].id);
      setCampaignName(`${evts[0].name} Certificate Distribution`);
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const eventRecs = recipientRepository.getByEventId(selectedEventId);
      setRecipients(eventRecs);
      setSelectedRecipientIds(eventRecs.map((r) => r.id));

      const ev = events.find((e) => e.id === selectedEventId);
      if (ev) {
        setCampaignName(`${ev.name} Certificate Distribution`);
      }
    }
  }, [selectedEventId, events]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedRecipients = recipients.filter((r) => selectedRecipientIds.includes(r.id));
  const eventCerts = allCertificates.filter((c) => c.eventId === selectedEventId);

  // Departments list for filter
  const departments = Array.from(
    new Set(recipients.map((r) => r.department).filter(Boolean) as string[])
  );

  // Toggle Selection
  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecipientIds.length === filteredRecipients.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(filteredRecipients.map((r) => r.id));
    }
  };

  // Filtered Recipients for Step 2 Table
  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(recipientSearch.toLowerCase()) ||
      (r.registrationNumber || '').toLowerCase().includes(recipientSearch.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || r.department === departmentFilter;

    const hasCert = allCertificates.some((c) => c.recipientId === r.id);
    const hasEmail = Boolean(r.email && r.email.trim());

    let matchesEmailStatus = true;
    if (emailStatusFilter === 'VALID') matchesEmailStatus = hasEmail;
    else if (emailStatusFilter === 'MISSING') matchesEmailStatus = !hasEmail;
    else if (emailStatusFilter === 'CERT_READY') matchesEmailStatus = hasCert;

    return matchesSearch && matchesDept && matchesEmailStatus;
  });

  // Pre-flight validation report
  const validationReport: PreFlightValidationReport = emailQueueEngine.validateRecipients(
    selectedRecipients,
    eventCerts
  );

  // Launch Campaign execution
  const handleConfirmAndLaunch = async () => {
    if (!selectedEvent || selectedRecipients.length === 0) return;

    setIsLaunching(true);
    const campaignId = `camp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newCampaign: DistributionCampaign = {
      id: campaignId,
      institutionId: org.id || 'org-abc-college',
      name: campaignName || `${selectedEvent.name} Certificate Distribution`,
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      certificateBatchId: `batch-${selectedEvent.id}`,
      templateId: 'custom-email-template',
      subject: emailConfig.subject,
      deliveryMethod,
      status: isScheduled ? 'scheduled' : 'processing',
      scheduledAt: isScheduled && scheduledDateTime ? scheduledDateTime : undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'admin@abccollege.edu',
      totalRecipients: selectedRecipients.length,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      failedCount: 0,
      queuedCount: selectedRecipients.length,
      batchSize: 50,
      rateLimitPerSecond: 10,
      emailConfig,
    };

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://certifyhub.edu';
    const launched = await emailQueueEngine.launchCampaign(
      newCampaign,
      selectedRecipients,
      eventCerts,
      origin
    );

    setActiveCampaign(launched);
    setIsLaunching(false);
    setIsConfirmOpen(false);
    setCurrentStep(6);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Create Email Distribution Campaign"
        description="Follow the guided multi-step wizard to select certificate batches, validate recipient lists, compose institutional email templates, and trigger background delivery."
        icon={Send}
        breadcrumbs={[
          { label: 'Distribution', href: '/distribution' },
          { label: 'New Campaign' },
        ]}
      />

      {/* Stepper Wizard Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl overflow-x-auto shadow-xs">
        <div className="flex items-center justify-between min-w-[640px] px-2">
          {WIZARD_STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-300 text-blue-600 font-bold shadow-xs'
                      : isCompleted
                      ? 'text-emerald-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800'
                      : 'text-slate-400 opacity-75'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700 font-bold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span className="text-xs whitespace-nowrap">{step.name}</span>
                </div>
                {idx < WIZARD_STEPS.length - 1 && (
                  <div className={`h-[1px] w-6 shrink-0 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Contents with Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* STEP 1: SELECT CERTIFICATES / BATCH */}
          {currentStep === 1 && (
            <div
              className="p-6 rounded-2xl border space-y-6 shadow-xs"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Step 1: Select Certificate Batch
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Choose an academic program or workshop batch with already-generated personalized certificates.
                </p>
              </div>

              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((evt) => {
                    const isSelected = selectedEventId === evt.id;
                    const certCount = allCertificates.filter((c) => c.eventId === evt.id).length;
                    const recCount = recipientRepository.getByEventId(evt.id).length;

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                            : 'hover:border-slate-300'
                        }`}
                        style={{
                          backgroundColor: isSelected ? undefined : 'var(--surface-subtle)',
                          borderColor: isSelected ? undefined : 'var(--border)',
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                              {evt.eventType}
                            </span>
                            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                              {evt.startDate}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {evt.name}
                          </h3>
                          <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                            {evt.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                          <span className="font-semibold text-emerald-700">
                            {certCount > 0 ? `🎓 ${certCount} Certificates Generated` : '⚠️ No certs yet'}
                          </span>
                          <span className="font-mono text-slate-500">
                            {recCount} Roster Recipients
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No events found.</p>
                  <Link href="/events/new" className="inline-flex bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs">
                    Create Event
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT RECIPIENTS */}
          {currentStep === 2 && (
            <div
              className="p-6 rounded-2xl border space-y-5 shadow-xs"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <h2 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    Step 2: Select & Filter Recipients
                  </h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Event: <strong>{selectedEvent?.name}</strong> • Choose recipients to receive email distribution.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl border bg-blue-50 text-blue-700 border-blue-200">
                    Selected: {selectedRecipientIds.length} / {recipients.length}
                  </span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    placeholder="Search by name, email, or roll no..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={emailStatusFilter}
                    onChange={(e) => setEmailStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="ALL">All Recipient Statuses</option>
                    <option value="VALID">Has Valid Email</option>
                    <option value="MISSING">Missing Email Address</option>
                    <option value="CERT_READY">Certificate Generated</option>
                  </select>
                </div>
              </div>

              {/* Recipients Table */}
              <div className="rounded-xl border overflow-hidden text-xs max-h-96 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="p-3 w-10 text-center">
                        <button type="button" onClick={toggleSelectAll} className="focus:outline-none">
                          {selectedRecipientIds.length === filteredRecipients.length && filteredRecipients.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Recipient Name</th>
                      <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Register No</th>
                      <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Email Address</th>
                      <th className="p-3 font-bold" style={{ color: 'var(--text-secondary)' }}>Department</th>
                      <th className="p-3 font-bold text-right" style={{ color: 'var(--text-secondary)' }}>Certificate Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {filteredRecipients.map((rec) => {
                      const isSelected = selectedRecipientIds.includes(rec.id);
                      const hasCert = allCertificates.some((c) => c.recipientId === rec.id);
                      const hasEmail = Boolean(rec.email && rec.email.trim());

                      return (
                        <tr
                          key={rec.id}
                          onClick={() => toggleRecipient(rec.id)}
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => toggleRecipient(rec.id)} className="focus:outline-none">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </td>

                          <td className="p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {rec.fullName}
                          </td>

                          <td className="p-3 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {rec.registrationNumber || '—'}
                          </td>

                          <td className="p-3 font-mono text-[11px]">
                            {hasEmail ? (
                              <span style={{ color: 'var(--text-primary)' }}>{rec.email}</span>
                            ) : (
                              <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Missing Email</span>
                            )}
                          </td>

                          <td className="p-3" style={{ color: 'var(--text-muted)' }}>
                            {rec.department || '—'}
                          </td>

                          <td className="p-3 text-right">
                            {hasCert ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                Ready
                              </span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                Not Generated
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIGURE EMAIL & DELIVERY */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Campaign Meta & Delivery Method */}
              <div
                className="p-6 rounded-2xl border space-y-4 shadow-xs"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. AI Workshop 2026 Distribution"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      Delivery Method
                    </label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="both">PDF Attachment + Secure Download Link (Recommended)</option>
                      <option value="attachment">PDF Attachment Only</option>
                      <option value="link">Secure Download Link Only</option>
                    </select>
                  </div>
                </div>

                {/* Scheduling Option */}
                <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span>Schedule for Future Distribution</span>
                    </label>
                  </div>

                  {isScheduled && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl border focus:outline-none"
                        style={{
                          backgroundColor: 'var(--surface-subtle)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Rich Visual Email Composer */}
              <EmailTemplateEditor
                config={emailConfig}
                onChange={(updated) => setEmailConfig(updated)}
              />

              {/* Action to preview */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  style={{
                    borderColor: 'var(--primary-border)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Email (Desktop & Mobile)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & VALIDATE */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <PreFlightValidationCard
                report={validationReport}
                recipients={selectedRecipients}
                certificates={eventCerts}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Check Email Preview</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION PROMPT */}
          {currentStep === 5 && (
            <div
              className="p-8 rounded-2xl border space-y-6 shadow-xs text-center max-w-2xl mx-auto"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Send className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Ready to Launch Distribution
                </h2>
                <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                  You are about to launch automated certificate email distribution for{' '}
                  <strong>{validationReport.readyCount} validated recipients</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl border text-xs space-y-2 max-w-md mx-auto text-left" style={{ backgroundColor: 'var(--surface-subtle)', borderColor: 'var(--border)' }}>
                <div className="flex justify-between">
                  <span className="text-slate-500">Campaign:</span>
                  <span className="font-bold">{campaignName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Recipients:</span>
                  <span className="font-bold font-mono text-emerald-700">{validationReport.readyCount} Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Method:</span>
                  <span className="font-bold capitalize">{deliveryMethod}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
                >
                  <Send className="w-4 h-4" />
                  <span>Launch Campaign Now</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: LIVE PROGRESS & RESULTS */}
          {currentStep === 6 && activeCampaign && (
            <div className="space-y-6">
              <LiveProgressTracker
                campaign={activeCampaign}
                onRefresh={() => {
                  const fresh = distributionRepository.getCampaignById(activeCampaign.id);
                  if (fresh) setActiveCampaign(fresh);
                }}
                onCancel={() => {
                  emailQueueEngine.cancelCampaign(activeCampaign.id);
                  const fresh = distributionRepository.getCampaignById(activeCampaign.id);
                  if (fresh) setActiveCampaign(fresh);
                }}
              />

              <div className="flex items-center justify-center gap-4 pt-4">
                <Link
                  href={`/distribution/${activeCampaign.id}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md transition"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
                >
                  <span>Open Full Campaign Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/distribution"
                  className="px-6 py-3 rounded-xl border text-xs font-semibold hover:bg-slate-50 transition"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Back to All Campaigns
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stepper Navigation Buttons */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition disabled:opacity-40"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            disabled={
              (currentStep === 1 && !selectedEventId) ||
              (currentStep === 2 && selectedRecipientIds.length === 0) ||
              (currentStep === 4 && validationReport.readyCount === 0)
            }
            onClick={() => {
              if (currentStep === 5) {
                setIsConfirmOpen(true);
              } else {
                setCurrentStep((s) => Math.min(5, s + 1));
              }
            }}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition hover:brightness-105 active:scale-[0.98] disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            }}
          >
            <span>{currentStep === 5 ? 'Confirm & Send' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedEvent && (
        <EmailPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          config={emailConfig}
          recipients={selectedRecipients.length > 0 ? selectedRecipients : recipients}
          event={selectedEvent}
          organization={org}
          certificates={eventCerts}
          deliveryMethod={deliveryMethod}
        />
      )}

      {/* Send Confirmation Safety Modal */}
      {selectedEvent && (
        <SendConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleConfirmAndLaunch}
          campaignName={campaignName || `${selectedEvent.name} Certificate Distribution`}
          eventName={selectedEvent.name}
          totalRecipients={selectedRecipients.length}
          readyCount={validationReport.readyCount}
          invalidCount={validationReport.issues.length}
          deliveryMethod={deliveryMethod}
          subject={emailConfig.subject}
          isScheduled={isScheduled}
          scheduledDate={scheduledDateTime}
          isSubmitting={isLaunching}
        />
      )}
    </div>
  );
}
