import React from 'react';
import { CertificateRecord } from '@/types';

interface TemplateProps {
  certificate: Partial<CertificateRecord>;
  qrCodeUrl?: string;
}

export const ModernBlueTemplate: React.FC<TemplateProps> = ({ certificate, qrCodeUrl }) => {
  const org = certificate.organizationSnapshot;
  const event = certificate.eventSnapshot;
  const recipient = certificate.recipientSnapshot;

  return (
    <div
      className="relative w-full aspect-[1.414/1] bg-slate-900 text-slate-100 p-8 flex flex-col justify-between overflow-hidden shadow-2xl border border-blue-500/30"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Dynamic Geometric Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-teal-400 to-blue-500" />
      
      {/* Decorative Border Frame */}
      <div className="absolute inset-4 border border-blue-500/20 pointer-events-none rounded-sm" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-4">
          {org?.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logoDataUrl}
              alt={org.name || 'Organization Logo'}
              className="h-16 w-auto object-contain max-w-[160px]"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20">
              {(org?.name || 'C').charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold tracking-wide text-white uppercase">{org?.name || 'Organization Name'}</h2>
            <p className="text-xs text-slate-400">{org?.address || 'Location & Details'}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-xs font-semibold tracking-wider uppercase mb-1">
            Official Document
          </span>
          <p className="text-[10px] text-slate-400 font-mono">ID: {certificate.certificateCode || 'ABC-2026-XXXXXX'}</p>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative z-10 text-center my-auto py-4">
        <p className="text-sm font-semibold tracking-[0.2em] text-teal-400 uppercase mb-2">
          Certificate of {event?.certificateType || 'Achievement'}
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
          PROUDLY PRESENTED TO
        </h1>

        <div className="inline-block relative mb-4">
          <p className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-blue-200 px-6 py-1">
            {recipient?.fullName || 'Recipient Name'}
          </p>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent mt-1" />
        </div>

        <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          For successful participation and completion of{' '}
          <span className="font-bold text-white">{event?.name || 'Event Title'}</span>
          {event?.startDate && ` held from ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''}`}.
          {recipient?.achievement && recipient.achievement !== 'Participant' && (
            <span className="block mt-1 font-semibold text-teal-300">Honored with: {recipient.achievement}</span>
          )}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end border-t border-slate-800 pt-4">
        {/* Date & Location */}
        <div className="text-xs text-slate-400 space-y-1">
          <p><span className="text-slate-500">Date Issued:</span> {certificate.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString() : 'N/A'}</p>
          <p><span className="text-slate-500">Location:</span> {event?.location || 'Main Campus'}</p>
          <p className="text-[10px] text-slate-500 max-w-[200px] truncate">{org?.footerText}</p>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt="Certificate Verification QR Code" className="w-16 h-16 bg-white p-1 rounded border border-slate-700" />
            <span className="text-[9px] font-mono text-slate-400 mt-1">Scan to Verify</span>
          </div>
        )}

        {/* Signatory */}
        <div className="text-right flex flex-col items-end">
          {org?.signatureDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.signatureDataUrl} alt="Authorized Signature" className="h-12 w-auto max-w-[140px] object-contain mb-1" />
          ) : (
            <div className="h-10 border-b border-slate-600 w-36 mb-1 flex items-center justify-center text-xs italic text-slate-500">
              [ Signature ]
            </div>
          )}
          <p className="text-xs font-bold text-white">{org?.signatoryName || 'Authorized Signatory'}</p>
          <p className="text-[10px] text-slate-400">{org?.signatoryDesignation || 'Designation'}</p>
        </div>
      </div>
    </div>
  );
};
