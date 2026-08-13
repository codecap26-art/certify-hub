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

    const newRec: Recipient = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: event.id,
      fullName: newRecName.trim(),
      email: newRecEmail.trim() || 'student@example.com',
      registrationNumber: newRecRegNum.trim(),
      department: newRecDept.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    recipientRepository.save(newRec);
    setRecipients(recipientRepository.getByEventId(event.id));
    setNewRecName('');
    setNewRecEmail('');
    setNewRecRegNum('');
    setNewRecDept('');
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
      <div className="bg-white border border-slate-200 p-2 rounded-2xl flex items-center gap-2 shadow-xs">
        <button
          onClick={() => setActiveTab('recipients')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'recipients' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participants Roster ({recipients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'certificates' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
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
                <div key={cert.id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600">{cert.certificateCode}</span>
                    <StatusBadge status={cert.status} />
                  </div>
                  <p className="font-bold text-slate-900 text-xs">{cert.recipientSnapshot.fullName}</p>
                  <p className="text-[10px] text-slate-500">{cert.recipientSnapshot.email}</p>
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="block text-right text-[11px] font-semibold text-teal-600 hover:underline pt-1"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-3 shadow-xs">
              <p className="text-xs text-slate-600">No certificates generated for this event yet.</p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Participant Manually</h3>
              <button onClick={() => setShowAddRecipientModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecipient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1" htmlFor="rec-name">
                  Full Name *
                </label>
                <input
                  id="rec-name"
                  type="text"
                  required
                  value={newRecName}
                  onChange={(e) => setNewRecName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Subash P"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1" htmlFor="rec-email">
                  Email Address
                </label>
                <input
                  id="rec-email"
                  type="email"
                  value={newRecEmail}
                  onChange={(e) => setNewRecEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="subash@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1" htmlFor="rec-reg">
                    Reg / Roll Number
                  </label>
                  <input
                    id="rec-reg"
                    type="text"
                    value={newRecRegNum}
                    onChange={(e) => setNewRecRegNum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                    placeholder="23CS101"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1" htmlFor="rec-dept">
                    Department
                  </label>
                  <input
                    id="rec-dept"
                    type="text"
                    value={newRecDept}
                    onChange={(e) => setNewRecDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                    placeholder="CSE"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecipientModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700">
                  Save Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <span>Import Recipients CSV Roster</span>
              </h3>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-600">Need sample CSV template format?</span>
                <a
                  href={`data:text/csv;charset=utf-8,${encodeURIComponent(generateSampleCSV())}`}
                  download="Sample_Recipients_Import.csv"
                  className="text-teal-700 hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </a>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Upload CSV File *</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              {csvPreview && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2 text-xs">
                  <p className="font-bold text-slate-900">PapaParse CSV Validation Summary:</p>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <p className="font-bold text-base">{csvPreview.valid.length}</p>
                      <p className="text-[10px]">Valid Rows</p>
                    </div>
                    <div className="p-2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      <p className="font-bold text-base">{csvPreview.duplicates}</p>
                      <p className="text-[10px]">Duplicates</p>
                    </div>
                    <div className="p-2 rounded bg-red-50 text-red-700 border border-red-200">
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
