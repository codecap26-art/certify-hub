'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Users,
  Layers,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Search,
  Check,
  Building2,
  Edit3,
  ExternalLink,
  Palette,
} from 'lucide-react';
import { eventRepository } from '@/lib/storage/eventRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { templateRepository } from '@/lib/storage/templateRepository';
import { EventItem, Recipient, TemplateId, CertificateRecord } from '@/types';
import { CustomTemplate } from '@/types/template';
import { TEMPLATES } from '@/lib/constants';
import { BUILT_IN_TEMPLATES } from '@/lib/template/builtInTemplates';
import { PageHeader } from '@/components/ui/PageHeader';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';
import { ParticipantSelection } from '@/components/generator/ParticipantSelection';
import { getNormalizedCategory } from '@/lib/participantUtils';
import {
  generateCertificateCode,
  generateVerificationToken,
} from '@/lib/certificate/codeGenerator';
import { generateAndDownloadBulkCertificatesZip } from '@/lib/certificate/bulkGenerator';
import {
  DEFAULT_CATEGORY_TEMPLATE_MAPPING,
  CategoryTemplateMapping,
  resolveTemplateIdForCategory,
  getCategoryDefaultTemplateId,
  getCategoryRoleBadge,
} from '@/lib/template/categoryTemplateUtils';

const STEPS = [
  { id: 1, name: 'Select Event', icon: Calendar },
  { id: 2, name: 'Select Recipients', icon: Users },
  { id: 3, name: 'Select Template', icon: Layers },
  { id: 4, name: 'Review Details', icon: FileCheck },
  { id: 5, name: 'Live Preview', icon: Sparkles },
  { id: 6, name: 'Generate & Download', icon: Download },
];

export default function CertificateGeneratorWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  // Repositories Data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [customTemplatesList, setCustomTemplatesList] = useState<CustomTemplate[]>([]);
  const org = organizationRepository.get();

  // Selections
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern-blue');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [autoMapCategories, setAutoMapCategories] = useState(true);
  const [categoryMappings, setCategoryMappings] = useState<CategoryTemplateMapping>(
    DEFAULT_CATEGORY_TEMPLATE_MAPPING
  );

  // Generated State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecords, setGeneratedRecords] = useState<CertificateRecord[]>([]);
  const [generationProgress, setGenerationProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const allEvents = eventRepository.getAll();
    setEvents(allEvents);
    const customList = templateRepository.getAll();
    setCustomTemplatesList(customList);

    // Initialize smart default template mapping
    const winnerDef = getCategoryDefaultTemplateId('winner', customList);
    const runnerDef = getCategoryDefaultTemplateId('runner', customList);
    const participantDef = getCategoryDefaultTemplateId('participant', customList);
    setCategoryMappings({
      winner: winnerDef,
      runner: runnerDef,
      participant: participantDef,
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramTmplId = params.get('templateId');
      const paramEvtId = params.get('eventId');

      if (paramTmplId) {
        setSelectedTemplateId(paramTmplId);
        // If coming from Studio, jump to step 1 or step 3
        setCurrentStep(1);
      }

      if (paramEvtId && allEvents.some((e) => e.id === paramEvtId)) {
        setSelectedEventId(paramEvtId);
      } else if (allEvents.length > 0) {
        setSelectedEventId(allEvents[0].id);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const recs = recipientRepository.getByEventId(selectedEventId);
      const normalizedRecs = recs.map((r) => ({
        ...r,
        category: getNormalizedCategory(r),
      }));
      setRecipients(normalizedRecs);
      setSelectedRecipientIds(normalizedRecs.map((r) => r.id));
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedRecipients = recipients.filter((r) => selectedRecipientIds.includes(r.id));

  // Toggle Recipient Selection
  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecipientIds.length === recipients.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(recipients.map((r) => r.id));
    }
  };

  const [previewRecipientId, setPreviewRecipientId] = useState<string>('');

  // Preview Certificate Snapshot
  const activePreviewRecipient =
    selectedRecipients.find((r) => r.id === previewRecipientId) || selectedRecipients[0];
  const previewCategory = activePreviewRecipient?.category || 'participant';
  const previewTemplateId = autoMapCategories
    ? resolveTemplateIdForCategory(previewCategory, categoryMappings, customTemplatesList)
    : selectedTemplateId;

  const previewCertificateSnapshot: Partial<CertificateRecord> = {
    certificateCode: 'PREVIEW-CODE-2026',
    verificationToken: 'preview-token-demo',
    eventId: selectedEventId,
    templateId: (previewTemplateId as TemplateId) || 'modern-blue',
    organizationSnapshot: org,
    eventSnapshot: selectedEvent || {
      id: 'demo-evt',
      name: 'Workshop Program',
      eventType: 'Workshop',
      description: 'Program Description',
      startDate: '2026-03-15',
      endDate: '2026-03-16',
      location: 'Main Auditorium',
      certificateType: 'Completion',
      coordinatorName: 'Prof. Coordinator',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    recipientSnapshot: activePreviewRecipient || {
      id: 'demo-rec',
      eventId: selectedEventId,
      fullName: 'Sample Participant',
      email: 'sample@example.com',
      registrationNumber: '2026-REG-01',
      department: 'Computer Science',
      course: 'React & Next.js Workshop',
      category: 'participant',
      achievement: 'Participant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    status: 'Valid',
    generatedAt: new Date().toISOString(),
  };

  // Execute Certificate Generation
  const handleGenerateCertificates = async () => {
    if (!selectedEvent || selectedRecipients.length === 0) return;

    setIsGenerating(true);
    const newRecords: CertificateRecord[] = [];
    const timestamp = new Date().toISOString();

    for (let i = 0; i < selectedRecipients.length; i++) {
      const rec = selectedRecipients[i];
      const code = generateCertificateCode(org.name, selectedEvent.name);
      const token = generateVerificationToken();
      const recCategory = getNormalizedCategory(rec);
      const recTemplateId = autoMapCategories
        ? resolveTemplateIdForCategory(recCategory, categoryMappings, customTemplatesList)
        : selectedTemplateId;

      const record: CertificateRecord = {
        id: `cert-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        certificateCode: code,
        verificationToken: token,
        eventId: selectedEvent.id,
        recipientId: rec.id,
        templateId: recTemplateId,
        organizationSnapshot: {
          ...org,
          logoDataUrl: '',
          signatureDataUrl: '',
        },
        eventSnapshot: selectedEvent,
        recipientSnapshot: rec,
        status: 'Valid',
        generatedAt: timestamp,
      };

      newRecords.push(record);
    }

    certificateRepository.saveBatch(newRecords);
    setGeneratedRecords(newRecords);
    setIsGenerating(false);
    setCurrentStep(6);
  };

  // Bulk ZIP Download
  const handleDownloadZip = async () => {
    if (!selectedEvent || generatedRecords.length === 0) return;
    setIsGenerating(true);
    await generateAndDownloadBulkCertificatesZip(
      generatedRecords,
      selectedEvent.name,
      (completed: number, total: number) => setGenerationProgress({ completed, total })
    );
    setIsGenerating(false);
    setGenerationProgress(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeader
        title="Multi-Step Certificate Generator Wizard"
        description="Select an event, review participant roster, choose a built-in or custom template, preview live, and generate PDF bundles."
        icon={Sparkles}
        breadcrumbs={[{ label: 'Generator Wizard' }]}
      />

      {/* Horizontal Desktop / Scrollable Stepper Navigation */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-2xl overflow-x-auto shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between min-w-[640px] px-2">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#EFF6FF] border border-[#93C5FD] text-[#2563EB] font-bold shadow-[0_1px_4px_rgba(37,99,235,0.12)]'
                      : isCompleted
                      ? 'text-[#06B6D4] font-semibold hover:bg-[#F8FAFC]'
                      : 'text-[#94A3B8] opacity-75'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] ring-2 ring-[#2563EB]/25 font-bold'
                        : isCompleted
                        ? 'bg-[#ECFEFF] text-[#06B6D4] border border-[#67E8F9] font-bold'
                        : 'bg-[#F1F5F9] text-[#94A3B8]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                  </div>
                  <span className="text-xs whitespace-nowrap">{step.name}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-[1px] w-6 shrink-0 transition-colors duration-200 ${isCompleted ? 'bg-[#67E8F9]' : 'bg-[#E2E8F0]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Contents with Directional Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* STEP 1: SELECT EVENT */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 1: Select Event or Academic Program</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Choose the workshop or program for which certificates are being issued.
                </p>
              </div>

              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEventId(evt.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition space-y-2 ${
                        selectedEventId === evt.id
                          ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2 py-0.5 bg-blue-100 rounded border border-blue-200">
                          {evt.eventType}
                        </span>
                        <span className="text-xs text-slate-500">{evt.startDate}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">{evt.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <p className="text-xs text-slate-600">No events found. Please create an event first.</p>
                  <Link
                    href="/events/new"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs"
                  >
                    <span>Create Event</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT RECIPIENTS */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
              <ParticipantSelection
                eventName={selectedEvent?.name}
                recipients={recipients}
                selectedRecipientIds={selectedRecipientIds}
                onSelectionChange={(selectedIds) => setSelectedRecipientIds(selectedIds)}
                onUpdateRecipient={(updatedRec) => {
                  setRecipients((prev) =>
                    prev.map((r) => (r.id === updatedRec.id ? updatedRec : r))
                  );
                  recipientRepository.save(updatedRec);
                }}
              />
            </div>
          )}

          {/* STEP 3: SELECT TEMPLATE */}
          {currentStep === 3 && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 3: Certificate Template Assignment</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Automatically match templates for Winner 🏆, Runner 🥈, and Participated 📜, or choose a single template for all.
                  </p>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAutoMapCategories(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      autoMapCategories
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Auto-Map Roles ⚡
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoMapCategories(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !autoMapCategories
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Single Template
                  </button>
                </div>
              </div>

              {autoMapCategories ? (
                /* Category Auto-Mapping UI */
                <div className="space-y-6">
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
                    <span className="font-semibold">
                      ⚡ Templates will be updated automatically for each participant based on their category (Winner, Runner, Participated).
                    </span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      Auto-Mapping Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Winner Template Selection Card */}
                    <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#92400E] flex items-center gap-1.5">
                            <span className="text-base">🏆</span> Winner Template
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            {selectedRecipients.filter((r) => getNormalizedCategory(r) === 'winner').length} Recipients
                          </span>
                        </div>
                        <select
                          value={categoryMappings.winner}
                          onChange={(e) => setCategoryMappings((prev) => ({ ...prev, winner: e.target.value }))}
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                        >
                          <optgroup label="Built-in Specialized Templates">
                            {BUILT_IN_TEMPLATES.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.orientation})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Built-in Themes">
                            {TEMPLATES.map((t) => (
                              <option key={t.id} value={t.id}>{t.name} Theme</option>
                            ))}
                          </optgroup>
                          {customTemplatesList.length > 0 && (
                            <optgroup label="Custom & Saved Designs">
                              {customTemplatesList.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <p className="text-[11px] text-amber-800/80">
                          Assigned to 1st Place & Winner category certificate generation.
                        </p>
                      </div>
                      <Link
                        href={`/studio/editor/${categoryMappings.winner}?from=generate&eventId=${selectedEventId}`}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs py-2 px-3 rounded-xl transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Customize Winner Template</span>
                      </Link>
                    </div>

                    {/* Runner Template Selection Card */}
                    <div className="bg-[#F5F3FF] border border-[#C4B5FD] rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#5B21B6] flex items-center gap-1.5">
                            <span className="text-base">🥈</span> Runner Template
                          </span>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                            {selectedRecipients.filter((r) => getNormalizedCategory(r) === 'runner').length} Recipients
                          </span>
                        </div>
                        <select
                          value={categoryMappings.runner}
                          onChange={(e) => setCategoryMappings((prev) => ({ ...prev, runner: e.target.value }))}
                          className="w-full p-2 bg-white border border-purple-300 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                        >
                          <optgroup label="Built-in Specialized Templates">
                            {BUILT_IN_TEMPLATES.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.orientation})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Built-in Themes">
                            {TEMPLATES.map((t) => (
                              <option key={t.id} value={t.id}>{t.name} Theme</option>
                            ))}
                          </optgroup>
                          {customTemplatesList.length > 0 && (
                            <optgroup label="Custom & Saved Designs">
                              {customTemplatesList.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <p className="text-[11px] text-purple-800/80">
                          Assigned to 2nd/3rd Place & Runner-up certificate generation.
                        </p>
                      </div>
                      <Link
                        href={`/studio/editor/${categoryMappings.runner}?from=generate&eventId=${selectedEventId}`}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs py-2 px-3 rounded-xl transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                        <span>Customize Runner Template</span>
                      </Link>
                    </div>

                    {/* Participated Template Selection Card */}
                    <div className="bg-[#ECFEFF] border border-[#67E8F9] rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#155E75] flex items-center gap-1.5">
                            <span className="text-base">📜</span> Participated Template
                          </span>
                          <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded">
                            {selectedRecipients.filter((r) => getNormalizedCategory(r) === 'participant').length} Recipients
                          </span>
                        </div>
                        <select
                          value={categoryMappings.participant}
                          onChange={(e) => setCategoryMappings((prev) => ({ ...prev, participant: e.target.value }))}
                          className="w-full p-2 bg-white border border-cyan-300 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                        >
                          <optgroup label="Built-in Specialized Templates">
                            {BUILT_IN_TEMPLATES.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.orientation})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Built-in Themes">
                            {TEMPLATES.map((t) => (
                              <option key={t.id} value={t.id}>{t.name} Theme</option>
                            ))}
                          </optgroup>
                          {customTemplatesList.length > 0 && (
                            <optgroup label="Custom & Saved Designs">
                              {customTemplatesList.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <p className="text-[11px] text-cyan-800/80">
                          Assigned to general workshop & event participation certificates.
                        </p>
                      </div>
                      <Link
                        href={`/studio/editor/${categoryMappings.participant}?from=generate&eventId=${selectedEventId}`}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold text-xs py-2 px-3 rounded-xl transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-700" />
                        <span>Customize Participated Template</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Unified Template UI */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Built-in Code Templates</h3>
                    <Link
                      href={`/studio/editor/${selectedTemplateId}?from=generate&eventId=${selectedEventId}`}
                      className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-blue-200 transition"
                    >
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      <span>Customize Selected in Studio</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {BUILT_IN_TEMPLATES.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                          selectedTemplateId === tmpl.id
                            ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div
                            className="h-20 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner p-2 text-center"
                            style={{ backgroundColor: tmpl.backgroundColor || '#FFFFFF', color: '#0F172A' }}
                          >
                            {tmpl.name}
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-slate-900 truncate">{tmpl.name}</h4>
                              {selectedTemplateId === tmpl.id && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{tmpl.description}</p>
                          </div>
                        </div>

                        <Link
                          href={`/studio/editor/${tmpl.id}?from=generate&eventId=${selectedEventId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold py-1.5 rounded-lg border border-slate-200 transition"
                        >
                          <Edit3 className="w-3 h-3 text-blue-600" />
                          <span>Edit in Studio</span>
                        </Link>
                      </div>
                    ))}
                  </div>

                  {customTemplatesList.length > 0 && (
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Custom & Saved Templates</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customTemplatesList.map((tmpl) => (
                          <div
                            key={tmpl.id}
                            onClick={() => setSelectedTemplateId(tmpl.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                              selectedTemplateId === tmpl.id
                                ? 'bg-blue-50/80 border-blue-500 text-slate-900 shadow-xs ring-2 ring-blue-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                                  {tmpl.category}
                                </span>
                                {selectedTemplateId === tmpl.id ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                                    <Check className="w-3 h-3" /> Selected
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">{tmpl.orientation}</span>
                                )}
                              </div>
                              <h4 className="font-bold text-xs text-slate-900 mt-1">{tmpl.name}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{tmpl.description}</p>
                            </div>

                            <Link
                              href={`/studio/editor/${tmpl.id}?from=generate&eventId=${selectedEventId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full flex items-center justify-center gap-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold py-1.5 rounded-lg border border-slate-200 transition"
                            >
                              <Edit3 className="w-3 h-3 text-blue-600" />
                              <span>Edit in Studio</span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW DETAILS */}
          {currentStep === 4 && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 4: Review Data Snapshots & Pre-Generation Checks</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Verify frozen organization, event, and recipient metadata before generating certificates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold text-blue-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Organization</span>
                  </h3>
                  <p className="font-bold text-slate-900 text-sm">{org.name}</p>
                  <p className="text-slate-600">{org.type}</p>
                  <p className="text-slate-500 text-[11px]">Signatory: {org.signatoryName}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold text-teal-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Event Program</span>
                  </h3>
                  <p className="font-bold text-slate-900 text-sm">{selectedEvent?.name}</p>
                  <p className="text-slate-600">Date: {selectedEvent?.startDate}</p>
                  <p className="text-slate-500 text-[11px]">Location: {selectedEvent?.location}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold text-indigo-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Selected Roster</span>
                  </h3>
                  <p className="font-bold text-slate-900 text-sm">{selectedRecipients.length} Participants</p>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/60">
                    <p>Winners: <strong className="text-amber-700">{selectedRecipients.filter((r) => getNormalizedCategory(r) === 'winner').length}</strong></p>
                    <p>Runners: <strong className="text-purple-700">{selectedRecipients.filter((r) => getNormalizedCategory(r) === 'runner').length}</strong></p>
                    <p>Participants: <strong className="text-blue-700">{selectedRecipients.filter((r) => getNormalizedCategory(r) === 'participant').length}</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: LIVE PREVIEW */}
          {currentStep === 5 && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 5: Live Certificate Visual Preview</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    On-screen rendering of sample certificate snapshot.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCertificates}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-xs transition text-xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating...' : 'Confirm & Issue Certificates'}</span>
                </button>
              </div>

              {/* Recipient Category Selector for Preview */}
              {selectedRecipients.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Preview Recipient Category:</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Showing template layout & titles for: <strong>{activePreviewRecipient?.fullName}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipients.slice(0, 8).map((rec) => {
                      const recCategory = getNormalizedCategory(rec);
                      const isWinner = recCategory === 'winner';
                      const isRunner = recCategory === 'runner';
                      const isSelected = (activePreviewRecipient?.id || selectedRecipients[0]?.id) === rec.id;

                      return (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => setPreviewRecipientId(rec.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                            isSelected
                              ? isWinner
                                ? 'bg-amber-100 text-amber-900 border-2 border-amber-500 shadow-xs'
                                : isRunner
                                ? 'bg-purple-100 text-purple-900 border-2 border-purple-500 shadow-xs'
                                : 'bg-blue-100 text-blue-900 border-2 border-blue-500 shadow-xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span>{isWinner ? '🏆' : isRunner ? '🥈' : '📜'}</span>
                          <span>{rec.fullName}</span>
                          <span className="text-[10px] opacity-75 font-mono capitalize">({recCategory})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Template Selection Summary Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Active Template:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {customTemplatesList.find((t) => t.id === previewTemplateId)?.name ||
                      TEMPLATES.find((t) => t.id === previewTemplateId)?.name ||
                      previewTemplateId}
                  </span>
                  {autoMapCategories && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                      ⚡ Category Matched
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold uppercase text-[10px]">
                    Role:{' '}
                    {previewCategory.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold uppercase text-[10px]">
                    Orientation:{' '}
                    {customTemplatesList.find((t) => t.id === previewTemplateId)?.orientation || 'landscape'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-center">
                <CertificateRenderer
                  key={`${previewTemplateId}-${activePreviewRecipient?.id}`}
                  certificate={previewCertificateSnapshot}
                  templateId={previewTemplateId as TemplateId}
                />
              </div>
            </div>
          )}

          {/* STEP 6: GENERATE & DOWNLOAD */}
          {currentStep === 6 && (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-6 shadow-xs text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">Certificates Successfully Generated!</h2>
                <p className="text-xs text-slate-600">
                  Created <strong>{generatedRecords.length}</strong> official credential records for event:{' '}
                  <strong>{selectedEvent?.name}</strong>.
                </p>
              </div>

              {generationProgress && (
                <div className="bg-slate-50 p-4 rounded-xl max-w-md mx-auto space-y-2 border border-slate-200">
                  <p className="text-xs font-semibold text-blue-700">
                    Bundling PDF Package: {generationProgress.completed} / {generationProgress.total}
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-200"
                      style={{
                        width: `${(generationProgress.completed / generationProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleDownloadZip}
                  disabled={isGenerating}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-lg shadow-sm transition text-sm disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Bulk ZIP Bundle</span>
                </button>

                <Link
                  href="/certificates"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-8 rounded-lg border border-slate-200 text-sm"
                >
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  <span>View Audit History</span>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stepper Wizard Controls */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            disabled={
              (currentStep === 1 && !selectedEventId) ||
              (currentStep === 2 && selectedRecipientIds.length === 0)
            }
            onClick={() => {
              if (currentStep === 5) {
                handleGenerateCertificates();
              } else {
                setCurrentStep((s) => Math.min(6, s + 1));
              }
            }}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-all duration-200 disabled:opacity-40"
          >
            <span>{currentStep === 5 ? 'Issue Certificates' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
