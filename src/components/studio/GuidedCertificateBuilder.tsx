// ============================================================================
// Guided Certificate Builder — 10-Step Wizard Modal for Beginners
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Building2,
  Calendar,
  Award,
  User,
  FileText,
  FileSignature,
  Palette,
  Shield,
  Eye,
  Save,
  Upload,
} from 'lucide-react';
import { CertificateDocument, Orientation, createBlankDocument, createTextElement, createDynamicTextElement, createBorderElement, createQrElement, createCertificateCodeElement } from '@/lib/editor/documentModel';
import { BUILT_IN_WORDINGS } from '@/lib/wordingLibrary';
import { templateRepository } from '@/lib/storage/templateRepository';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (doc: CertificateDocument) => void;
}

export const GuidedCertificateBuilder: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [backgroundColor, setBackgroundColor] = useState('#FAFAF8');
  const [hasBorder, setHasBorder] = useState(true);

  const [orgName, setOrgName] = useState('ABC ENGINEERING COLLEGE');
  const [orgAffiliation, setOrgAffiliation] = useState('Autonomous Institution Affiliated to State University');
  const [orgAccreditation, setOrgAccreditation] = useState('Accredited with NAAC A+ Grade');
  const [orgSlogan, setOrgSlogan] = useState('Excellence in Technology');
  const [mainLogo, setMainLogo] = useState<string | undefined>();

  const [eventName, setEventName] = useState('SOFTWARE INNOVATION CHALLENGE 2026');
  const [eventOrganizer, setEventOrganizer] = useState('Department of Computer Science');
  const [eventDateRange, setEventDateRange] = useState('March 10-12, 2026');

  const [certType, setCertType] = useState('OF APPRECIATION');
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [wording, setWording] = useState(BUILT_IN_WORDINGS[0].text);

  const [sigCount, setSigCount] = useState<1 | 2 | 3 | 4 | 5 | 6>(3);
  const [sigNames, setSigNames] = useState<string[]>(['Dr. R. Sundaram', 'Dr. M. Lakshmi', 'Prof. V. Anand', '', '', '']);
  const [sigDesigs, setSigDesigs] = useState<string[]>(['Convener & Professor', 'Head of Department', 'Dean of Academics', '', '', '']);

  const [includeQr, setIncludeQr] = useState(true);
  const [includeCode, setIncludeCode] = useState(true);
  const [previewTestName, setPreviewTestName] = useState('SUBASH P');

  if (!isOpen) return null;

  const handleNext = () => setStep((s) => Math.min(10, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    const doc = createBlankDocument(`Guided ${certType} Certificate`, orientation);
    doc.backgroundColor = backgroundColor;

    const width = doc.width;
    const height = doc.height;
    const centerX = width / 2;

    // Layer 1: Border
    if (hasBorder) {
      doc.elements.push(createBorderElement(width, height, 1));
    }

    // Layer 2: Org Header
    doc.elements.push(
      createDynamicTextElement('{{organization.name}}', width, height, 2)
    );
    const lastEl = doc.elements[doc.elements.length - 1];
    lastEl.y = 40;
    lastEl.textValue = orgName;

    // Layer 3: Event Heading
    const eventEl = createDynamicTextElement('{{event.name}}', width, height, 3);
    eventEl.y = 90;
    eventEl.textValue = eventName;
    doc.elements.push(eventEl);

    // Layer 4: Cert Title & Subtitle
    const titleEl = createTextElement('CERTIFICATE', true, width, height, 4);
    titleEl.y = 135;
    doc.elements.push(titleEl);

    const subEl = createDynamicTextElement('{{certificate.type}}', width, height, 5);
    subEl.y = 175;
    subEl.textValue = certType;
    doc.elements.push(subEl);

    // Layer 5: Recipient Name
    const recEl = createDynamicTextElement('{{recipient.name}}', width, height, 6);
    recEl.y = 235;
    recEl.textStyle = { ...recEl.textStyle!, fontSize: 34, fontFamily, fontWeight: 'bold' };
    doc.elements.push(recEl);

    // Layer 7: Message Wording
    const wordEl = createTextElement(wording, false, width, height, 7);
    wordEl.y = 300;
    wordEl.width = width - 200;
    wordEl.x = 100;
    doc.elements.push(wordEl);

    // Layer 9: Signatories (1 to 6)
    const colWidth = (width - 80) / sigCount;
    for (let i = 0; i < sigCount; i++) {
      const colX = 40 + i * colWidth + colWidth / 2 - 60;
      const sigNameEl = createDynamicTextElement(`{{signatory.${i + 1}.name}}` as any, width, height, 10 + i);
      sigNameEl.x = colX;
      sigNameEl.y = height - 100;
      sigNameEl.width = 120;
      sigNameEl.textValue = sigNames[i] || `Signatory ${i + 1}`;
      sigNameEl.textStyle = { fontSize: 11, fontFamily: 'Helvetica', fontWeight: 'bold', fontStyle: 'normal', fill: '#0F172A', align: 'center' };
      doc.elements.push(sigNameEl);

      const sigDesigEl = createDynamicTextElement(`{{signatory.${i + 1}.designation}}` as any, width, height, 20 + i);
      sigDesigEl.x = colX;
      sigDesigEl.y = height - 80;
      sigDesigEl.width = 120;
      sigDesigEl.textValue = sigDesigs[i] || 'Designation';
      sigDesigEl.textStyle = { fontSize: 9, fontFamily: 'Helvetica', fontWeight: 'normal', fontStyle: 'normal', fill: '#64748B', align: 'center' };
      doc.elements.push(sigDesigEl);
    }

    // Layer 10: Verification
    if (includeQr) {
      doc.elements.push(createQrElement(width, height, 30));
    }
    if (includeCode) {
      doc.elements.push(createCertificateCodeElement(width, height, 31));
    }

    await templateRepository.save(doc as any);
    onComplete(doc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">Guided Certificate Builder</h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Step {step} of 10
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${(step / 10) * 100}%` }} />
        </div>

        {/* Step Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" /> Step 1: Page Setup & Layout
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`p-4 border rounded-xl text-left transition ${orientation === 'landscape' ? 'border-blue-500 bg-blue-50/50 font-bold' : 'border-slate-200'}`}
                >
                  <span className="block font-bold text-sm text-slate-900">A4 Landscape</span>
                  <span className="text-[10px] text-slate-500">842 × 595 pt (Recommended)</span>
                </button>
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`p-4 border rounded-xl text-left transition ${orientation === 'portrait' ? 'border-blue-500 bg-blue-50/50 font-bold' : 'border-slate-200'}`}
                >
                  <span className="block font-bold text-sm text-slate-900">A4 Portrait</span>
                  <span className="text-[10px] text-slate-500">595 × 842 pt</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Canvas Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 bg-slate-50 border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={hasBorder}
                  onChange={(e) => setHasBorder(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Include Decorative Dark Outer Frame Border
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Step 2: Organization Details
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affiliation Statement</label>
                <input
                  type="text"
                  value={orgAffiliation}
                  onChange={(e) => setOrgAffiliation(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Accreditation Statement</label>
                <input
                  type="text"
                  value={orgAccreditation}
                  onChange={(e) => setOrgAccreditation(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Step 3: Event Information
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organizer / Department</label>
                <input
                  type="text"
                  value={eventOrganizer}
                  onChange={(e) => setEventOrganizer(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Date Range</label>
                <input
                  type="text"
                  value={eventDateRange}
                  onChange={(e) => setEventDateRange(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" /> Step 4: Certificate Type & Subtitle
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['OF APPRECIATION', 'OF PARTICIPATION', 'OF COMPLETION', 'OF ACHIEVEMENT', 'OF RECOGNITION', 'OF INTERNSHIP'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCertType(t)}
                    className={`p-3 border rounded-xl text-left transition font-bold ${certType === t ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200'}`}
                  >
                    CERTIFICATE {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Step 5: Recipient Field Formatting
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2"
                >
                  <option value="Georgia">Georgia (Serif)</option>
                  <option value="Helvetica">Helvetica (Sans-Serif)</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                </select>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-700">
                <p className="font-semibold text-blue-900">Dynamic Placeholder:</p>
                <p className="font-mono text-xs text-blue-700 mt-1">{"{{recipient.name}}"}</p>
                <p className="text-[10px] text-slate-500 mt-1">Recipient names will be automatically centered and uppercase during generation.</p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Step 6: Certificate Message Wording
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preset Options</label>
                <div className="space-y-1 mb-3">
                  {BUILT_IN_WORDINGS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWording(w.text)}
                      className="w-full text-left p-2 bg-slate-50 hover:bg-blue-50 border rounded-lg text-xs"
                    >
                      <span className="font-bold text-slate-800">{w.title}</span>: {w.text.substring(0, 60)}...
                    </button>
                  ))}
                </div>
                <textarea
                  rows={4}
                  value={wording}
                  onChange={(e) => setWording(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-slate-800"
                />
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-blue-600" /> Step 7: Signatories (1 to 6)
              </h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Number of Signatory Columns</label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setSigCount(n)}
                      className={`px-3 py-1.5 border rounded-lg font-bold ${sigCount === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {Array.from({ length: sigCount }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border">
                    <input
                      type="text"
                      placeholder={`Signatory ${i + 1} Name`}
                      value={sigNames[i] || ''}
                      onChange={(e) => {
                        const updated = [...sigNames];
                        updated[i] = e.target.value;
                        setSigNames(updated);
                      }}
                      className="bg-white border rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      placeholder={`Signatory ${i + 1} Designation`}
                      value={sigDesigs[i] || ''}
                      onChange={(e) => {
                        const updated = [...sigDesigs];
                        updated[i] = e.target.value;
                        setSigDesigs(updated);
                      }}
                      className="bg-white border rounded px-2 py-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" /> Step 8: Branding Assets
              </h3>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <p className="font-semibold text-slate-800 mb-2">Upload Organization Logo</p>
                <label className="p-3 bg-white border border-dashed hover:border-blue-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Browse Logo Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setMainLogo(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
                {mainLogo && <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Logo loaded</span>}
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" /> Step 9: Verification & Security Tokens
              </h3>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeQr}
                  onChange={(e) => setIncludeQr(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Include QR Verification Code Token
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded text-blue-600"
                />
                Include Unique Certificate Code (ID: CERT-2026-0842)
              </label>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" /> Step 10: Final Preview & Save Template
              </h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Recipient Name Preview</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewTestName('SUBASH P')}
                    className={`px-3 py-1 border rounded-lg text-xs font-semibold ${previewTestName === 'SUBASH P' ? 'bg-blue-50 border-blue-400 font-bold' : ''}`}
                  >
                    Short Name
                  </button>
                  <button
                    onClick={() => setPreviewTestName('SUBASH CHANDRA BOSE PRAKASH PRASAD')}
                    className={`px-3 py-1 border rounded-lg text-xs font-semibold ${previewTestName !== 'SUBASH P' ? 'bg-blue-50 border-blue-400 font-bold' : ''}`}
                  >
                    Long Name Test
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700">
                <p className="font-bold text-slate-900">Summary Configuration:</p>
                <p>• {orgName}</p>
                <p>• CERTIFICATE {certType}</p>
                <p>• Event: {eventName}</p>
                <p>• Signatories: {sigCount} column(s)</p>
                <p>• Security: {includeQr ? 'QR Included' : 'No QR'} | {includeCode ? 'Code Included' : 'No Code'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 10 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
            >
              <Save className="w-4 h-4" /> Save & Open Studio
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
