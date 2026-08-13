import React from 'react';
import { CertificateRecord } from '@/types';

interface TemplateProps {
  certificate: Partial<CertificateRecord>;
  qrCodeUrl?: string;
}

export const MinimalGreenTemplate: React.FC<TemplateProps> = ({ certificate, qrCodeUrl }) => {
  const org = certificate.organizationSnapshot;
  const event = certificate.eventSnapshot;
  const recipient = certificate.recipientSnapshot;

  return (
    <div
      className="relative w-full aspect-[1.414/1] bg-emerald-950 text-emerald-50 p-8 flex flex-col justify-between overflow-hidden shadow-2xl border border-emerald-500/20"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Structural Accent Lines */}
      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
      <div className="absolute top-0 left-2 w-1 h-full bg-teal-400" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start pl-4">
        <div className="flex items-center gap-4">
          {org?.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logoDataUrl} alt={org.name} className="h-14 w-auto object-contain max-w-[150px]" />
          ) : (
            <div className="w-12 h-12 rounded bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow">
              {(org?.name || 'M').charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{org?.name || 'Organization Name'}</h2>
            <p className="text-xs text-emerald-300/80">{org?.address}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono bg-emerald-900/80 border border-emerald-700/50 px-2.5 py-1 rounded text-emerald-200">
            {certificate.certificateCode || 'GRN-2026-0000'}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative z-10 text-center my-auto py-4 pl-4">
        <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-2">
          {event?.certificateType || 'Completion'} Certificate
        </p>

        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
          CERTIFICATE OF PARTICIPATION
        </h1>

        <p className="text-xs text-emerald-300 mb-4">is presented to</p>

        <div className="inline-block relative mb-4">
          <p className="text-2xl md:text-3xl font-extrabold text-teal-300 border-b-2 border-emerald-400 pb-1 px-6">
            {recipient?.fullName || 'Recipient Name'}
          </p>
        </div>

        <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
          For demonstrating dedication and successfully participating in{' '}
          <span className="font-bold text-white">{event?.name || 'Event Title'}</span>.
          {recipient?.achievement && recipient.achievement !== 'Participant' && (
            <span className="block mt-1 text-emerald-300 font-semibold">Special Distinction: {recipient.achievement}</span>
          )}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end border-t border-emerald-900/90 pt-4 pl-4">
        <div className="text-xs text-emerald-300 space-y-1">
          <p><span className="text-emerald-400">Date:</span> {certificate.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString() : 'N/A'}</p>
          <p className="text-[10px] text-emerald-400/70">{org?.footerText}</p>
        </div>

        {qrCodeUrl && (
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 bg-white p-1 rounded border border-emerald-600" />
            <span className="text-[9px] font-mono text-emerald-300 mt-1">Verification QR</span>
          </div>
        )}

        <div className="text-right flex flex-col items-end">
          {org?.signatureDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.signatureDataUrl} alt="Signature" className="h-10 w-auto max-w-[130px] object-contain mb-1" />
          ) : (
            <div className="h-8 border-b border-emerald-600 w-32 mb-1 flex items-center justify-center text-xs text-emerald-400 italic">
              Signature
            </div>
          )}
          <p className="text-xs font-bold text-white">{org?.signatoryName || 'Signatory'}</p>
          <p className="text-[10px] text-emerald-300">{org?.signatoryDesignation || 'Designation'}</p>
        </div>
      </div>
    </div>
  );
};
