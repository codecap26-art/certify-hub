'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  FileCheck,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import { eventRepository } from '@/lib/storage/eventRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { EventItem, Recipient, CertificateRecord } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { parseRecipientCSV, generateSampleCSV } from '@/lib/csv/parser';
import {
  getNormalizedCategory,
  getCategoryBadgeStyle,
  getCategoryDisplayTitle,
} from '@/lib/participantUtils';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'recipients' | 'certificates'>('recipients');

  // Manual Recipient Form Modal
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [newRecName, setNewRecName] = useState('');
  const [newRecEmail, setNewRecEmail] = useState('');
  const [newRecRegNum, setNewRecRegNum] = useState('');
  const [newRecDept, setNewRecDept] = useState('');
  const [newRecCategory, setNewRecCategory] = useState<'winner' | 'runner' | 'participant'>('participant');

  // CSV Import Modal
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{
    valid: Recipient[];
    invalid: number;
    duplicates: number;
  } | null>(null);

  useEffect(() => {
    const evt = eventRepository.getById(resolvedParams.id);
    if (evt) setEvent(evt);

    const recs = recipientRepository.getByEventId(resolvedParams.id);
    setRecipients(recs);

    const certs = certificateRepository.getAll().filter((c) => c.eventId === resolvedParams.id);
    setCertificates(certs);
  }, [resolvedParams.id]);

  if (!event) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-600">The requested event ID does not exist.</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  // Add Manual Recipient
  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName.trim()) return;

    let achievement = 'Participant';
    if (newRecCategory === 'winner') achievement = 'Winner';
    if (newRecCategory === 'runner') achievement = 'Runner';

    const newRec: Recipient = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: event.id,
      fullName: newRecName.trim(),
      email: newRecEmail.trim() || 'student@example.com',
      registrationNumber: newRecRegNum.trim(),
      department: newRecDept.trim(),
      category: newRecCategory,
      achievement,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    recipientRepository.save(newRec);
    setRecipients(recipientRepository.getByEventId(event.id));
    setNewRecName('');
    setNewRecEmail('');
    setNewRecRegNum('');
    setNewRecDept('');
    setNewRecCategory('participant');
    setShowAddRecipientModal(false);
  };

  // CSV File Processing
  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const text = await file.text();
    const existingEmails = recipients.map((r) => r.email || '');
    const result = await parseRecipientCSV(text, existingEmails);

    const validRecipients: Recipient[] = result.validRows
      .filter((r) => !r.isDuplicate)
      .map((r, i) => ({
        id: `rec-csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: event.id,
        fullName: r.name,
        email: r.email,
        registrationNumber: r.registrationNumber,
        department: r.department,
        course: r.course,
        achievement: r.achievement,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    setCsvPreview({
      valid: validRecipients,
      invalid: result.invalidRows.length,
      duplicates: result.duplicateCount,
    });
  };

  const handleConfirmCsvImport = () => {
    if (!csvPreview || csvPreview.valid.length === 0) return;
    recipientRepository.saveBatch(csvPreview.valid);
    setRecipients(recipientRepository.getByEventId(event.id));
    setShowCsvModal(false);
    setCsvFile(null);
    setCsvPreview(null);
  };

  const recipientColumns: Column<Recipient>[] = [
    {
      key: 'fullName',
      header: 'Participant Name',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{r.fullName}</p>
          <p className="text-[10px] text-slate-500">{r.email}</p>
        </div>
      ),
    },
    {
      key: 'registrationNumber',
      header: 'Reg Number',
      sortable: true,
      render: (r) => <span className="font-mono text-xs text-blue-600">{r.registrationNumber || 'N/A'}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (r) => <span className="text-xs text-slate-700">{r.department || 'N/A'}</span>,
    },
    {
      key: 'category',
      header: 'Role / Status',
      sortable: true,
      render: (r) => {
        const cat = getNormalizedCategory(r);
        const style = getCategoryBadgeStyle(cat);
        const display = getCategoryDisplayTitle(cat);
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
            {cat === 'participant' ? 'Participated' : display}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title={event.name}
        description={`${event.eventType} • ${event.startDate} • Coordinator: ${event.coordinatorName}`}
        icon={Calendar}
        breadcrumbs={[{ label: 'Events', href: '/events' }, { label: event.name }]}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCsvModal(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-lg border border-slate-200 shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span>Import CSV Roster</span>
            </button>

            <button
              onClick={() => setShowAddRecipientModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Recipient</span>
            </button>
          </div>
        }
      />

      {/* Tabs Header */}
      <div
        className="p-2 rounded-2xl flex items-center gap-2 border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          onClick={() => setActiveTab('recipients')}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          style={{
            backgroundColor: activeTab === 'recipients' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'recipients' ? 'var(--text-inverse)' : 'var(--text-secondary)',
          }}
        >
          <Users className="w-4 h-4" />
          <span>Participants Roster ({recipients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          style={{
            backgroundColor: activeTab === 'certificates' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'certificates' ? 'var(--text-inverse)' : 'var(--text-secondary)',
          }}
        >
          <FileCheck className="w-4 h-4" />
          <span>Issued Credentials ({certificates.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recipients' && (
        <DataTable
          data={recipients}
          columns={recipientColumns}
          searchKey="fullName"
          searchPlaceholder="Search participant name, registration number, or email..."
          emptyTitle="No Participants Enrolled"
          emptyDescription="Add participants manually or import a roster via CSV."
        />
      )}

      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-2xl space-y-2 border shadow-xs"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--primary)' }}>{cert.certificateCode}</span>
                    <StatusBadge status={cert.status} />
                  </div>
                  <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{cert.recipientSnapshot.fullName}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{cert.recipientSnapshot.email}</p>
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="block text-right text-[11px] font-semibold hover:underline pt-1"
                    style={{ color: 'var(--secondary)' }}
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-8 rounded-2xl text-center space-y-3 border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No certificates generated for this event yet.</p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg text-xs"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Generator Wizard</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Manual Recipient Modal */}
      {showAddRecipientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl border"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-strong)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Add Participant Manually</h3>
              <button onClick={() => setShowAddRecipientModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecipient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="rec-name">
                  Full Name *
                </label>
                <input
                  id="rec-name"
                  type="text"
                  required
                  value={newRecName}
                  onChange={(e) => setNewRecName(e.target.value)}
                  className="w-full rounded-lg p-2.5 focus:outline-none border transition"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="e.g. Subash P"
                />
              </div>

              {/* Recipient Category / Achievement Question Box */}
              <div
                className="space-y-1.5 p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <label className="block font-bold" style={{ color: 'var(--text-primary)' }} htmlFor="rec-category">
                  Participant Role / Status *
                </label>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                  Select whether this recipient is a Winner, Runner, or Participated:
                </p>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewRecCategory('winner')}
                    className="p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                    style={{
                      backgroundColor: newRecCategory === 'winner' ? 'var(--warning-light)' : 'var(--surface)',
                      borderColor: newRecCategory === 'winner' ? 'var(--warning-border)' : 'var(--border)',
                      color: newRecCategory === 'winner' ? 'var(--warning-text)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="text-base">🏆</span>
                    <span>Winner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRecCategory('runner')}
                    className="p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                    style={{
                      backgroundColor: newRecCategory === 'runner' ? 'var(--runner-soft)' : 'var(--surface)',
                      borderColor: newRecCategory === 'runner' ? 'var(--runner-border)' : 'var(--border)',
                      color: newRecCategory === 'runner' ? 'var(--runner-text)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="text-base">🥈</span>
                    <span>Runner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRecCategory('participant')}
                    className="p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                    style={{
                      backgroundColor: newRecCategory === 'participant' ? 'var(--participant-soft)' : 'var(--surface)',
                      borderColor: newRecCategory === 'participant' ? 'var(--participant-border)' : 'var(--border)',
                      color: newRecCategory === 'participant' ? 'var(--participant-text)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="text-base">📜</span>
                    <span>Participated</span>
                  </button>
                </div>

                <select
                  id="rec-category"
                  value={newRecCategory}
                  onChange={(e) => setNewRecCategory(e.target.value as 'winner' | 'runner' | 'participant')}
                  className="w-full rounded-lg p-2 font-semibold focus:outline-none border cursor-pointer transition"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="winner">Winner</option>
                  <option value="runner">Runner</option>
                  <option value="participant">Participated (Participant)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="rec-email">
                  Email Address
                </label>
                <input
                  id="rec-email"
                  type="email"
                  value={newRecEmail}
                  onChange={(e) => setNewRecEmail(e.target.value)}
                  className="w-full rounded-lg p-2.5 focus:outline-none border transition"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="subash@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="rec-reg">
                    Reg / Roll Number
                  </label>
                  <input
                    id="rec-reg"
                    type="text"
                    value={newRecRegNum}
                    onChange={(e) => setNewRecRegNum(e.target.value)}
                    className="w-full rounded-lg p-2.5 focus:outline-none border transition"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="23CS101"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="rec-dept">
                    Department
                  </label>
                  <input
                    id="rec-dept"
                    type="text"
                    value={newRecDept}
                    onChange={(e) => setNewRecDept(e.target.value)}
                    className="w-full rounded-lg p-2.5 focus:outline-none border transition"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="CSE"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecipientModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold border transition"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white shadow-xs transition"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Save Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-xl border"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-strong)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileSpreadsheet className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
                <span>Import Recipients CSV Roster</span>
              </h3>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Need sample CSV template format?</span>
                <a
                  href={`data:text/csv;charset=utf-8,${encodeURIComponent(generateSampleCSV())}`}
                  download="Sample_Recipients_Import.csv"
                  className="hover:underline font-bold flex items-center gap-1"
                  style={{ color: 'var(--secondary)' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </a>
              </div>

              <div>
                <label className="block font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Upload CSV File *</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="w-full rounded-lg p-2.5 border transition"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {csvPreview && (
                <div
                  className="p-4 rounded-lg space-y-2 text-xs border"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>PapaParse CSV Validation Summary:</p>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                      <p className="font-bold text-base">{csvPreview.valid.length}</p>
                      <p className="text-[10px]">Valid Rows</p>
                    </div>
                    <div className="p-2 rounded bg-amber-950/40 text-amber-300 border border-amber-800/60">
                      <p className="font-bold text-base">{csvPreview.duplicates}</p>
                      <p className="text-[10px]">Duplicates</p>
                    </div>
                    <div className="p-2 rounded bg-red-950/40 text-red-300 border border-red-800/60">
                      <p className="font-bold text-base">{csvPreview.invalid}</p>
                      <p className="text-[10px]">Invalid</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCsvImport}
                  disabled={!csvPreview || csvPreview.valid.length === 0}
                  className="px-4 py-2 rounded-lg font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  Import {csvPreview?.valid.length || 0} Recipients
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
