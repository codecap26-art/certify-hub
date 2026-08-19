'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileCheck, Eye, ExternalLink, Mail } from 'lucide-react';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { CertificateRecord } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SendSingleCertificateModal } from '@/components/distribution/SendSingleCertificateModal';

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [selectedCertForEmail, setSelectedCertForEmail] = useState<CertificateRecord | null>(null);

  useEffect(() => {
    setCertificates(certificateRepository.getAll());
  }, []);

  const columns: Column<CertificateRecord>[] = [
    {
      key: 'certificateCode',
      header: 'Code / ID',
      sortable: true,
      render: (cert) => (
        <div>
          <span className="font-mono text-xs font-bold text-blue-600">{cert.certificateCode}</span>
          <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
            {cert.verificationToken}
          </p>
        </div>
      ),
    },
    {
      key: 'recipient',
      header: 'Recipient',
      sortable: true,
      render: (cert) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{cert.recipientSnapshot.fullName}</p>
          <p className="text-[10px] text-slate-500">{cert.recipientSnapshot.registrationNumber || cert.recipientSnapshot.email}</p>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event / Program',
      sortable: true,
      render: (cert) => (
        <span className="text-xs text-slate-700 font-medium">{cert.eventSnapshot.name}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (cert) => <StatusBadge status={cert.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (cert) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedCertForEmail(cert)}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition"
            title="Email Certificate with PDF Attachment"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          <Link
            href={`/certificates/${cert.id}`}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Link>

          <Link
            href={`/verify/${cert.verificationToken}`}
            target="_blank"
            className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify</span>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Certificate Audit History"
        description="Search, view, and manage all issued credential records and revocation statuses."
        icon={FileCheck}
        breadcrumbs={[{ label: 'Certificates History' }]}
      />

      <DataTable
        data={certificates}
        columns={columns}
        searchKey="certificateCode"
        searchPlaceholder="Search by certificate code or recipient..."
        filterKey="status"
        filterOptions={[
          { label: 'Valid', value: 'Valid' },
          { label: 'Revoked', value: 'Revoked' },
        ]}
        onRowClick={(cert) => router.push(`/certificates/${cert.id}`)}
        emptyTitle="No Certificates Issued Yet"
        emptyDescription="Use the Certificate Generator wizard to create official credentials for event participants."
      />

      {/* Email Certificate Modal */}
      {selectedCertForEmail && (
        <SendSingleCertificateModal
          isOpen={!!selectedCertForEmail}
          onClose={() => setSelectedCertForEmail(null)}
          certificate={selectedCertForEmail}
          onSuccess={() => setSelectedCertForEmail(null)}
        />
      )}
    </div>
  );
}
