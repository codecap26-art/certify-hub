import React from 'react';
import { CertificateRecord } from '@/types';

interface TemplateProps {
  certificate: Partial<CertificateRecord>;
  qrCodeUrl?: string;
}

export const AcademicMaroonTemplate: React.FC<TemplateProps> = ({ certificate, qrCodeUrl }) => {
  const org = certificate.organizationSnapshot;
  const event = certificate.eventSnapshot;
  const recipient = certificate.recipientSnapshot;

  return (
    <div
      className="relative w-full aspect-[1.414/1] bg-[#FFF5F5] text-rose-950 p-8 flex flex-col justify-between overflow-hidden shadow-2xl border-4 border-rose-900"
      style={{ fontFamily: "'Times New Roman', serif" }}
    >
      {/* Dual Border Lines */}
      <div className="absolute inset-2 border-2 border-rose-800 pointer-events-none" />
      <div className="absolute inset-3 border border-rose-700/40 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {org?.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logoDataUrl} alt={org.name} className="h-14 w-auto object-contain max-w-[140px]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-rose-900 text-rose-100 flex items-center justify-center font-bold text-2xl border-2 border-rose-700 shadow">
              {(org?.name || 'U').charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-rose-950 uppercase tracking-widest">{org?.name || 'Institution Name'}</h2>
            <p className="text-xs text-rose-800/80 italic">{org?.address}</p>
          </div>
        </div>

        <div className="text-right font-mono text-[10px] text-rose-900">
          <p>Serial Code:</p>
          <p className="font-bold text-xs">{certificate.certificateCode || 'MRN-2026-001'}</p>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative z-10 text-center my-auto py-3">
        <p className="text-xs font-bold tracking-[0.2em] text-rose-800 uppercase mb-1">
          Academic Certificate of {event?.certificateType || 'Achievement'}
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold text-rose-950 tracking-normal uppercase my-2">
          Testimonial of Completion
        </h1>

        <p className="text-xs text-rose-900 italic my-2">This credential is conferred upon</p>

        <div className="inline-block relative my-1">
          <p className="text-2xl md:text-3xl font-extrabold text-rose-950 border-b-2 border-rose-800 px-8 py-1">
            {recipient?.fullName || 'Recipient Name'}
          </p>
        </div>

        <p className="text-xs md:text-sm text-rose-900/90 max-w-2xl mx-auto leading-relaxed mt-3">
          in recognition of commendable performance and completion of the program titled{' '}
          <span className="font-bold text-rose-950">{event?.name || 'Event Title'}</span>.
          {recipient?.achievement && recipient.achievement !== 'Participant' && (
            <span className="block mt-1 font-bold text-rose-900">Commendation: {recipient.achievement}</span>
          )}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end border-t border-rose-300 pt-3">
        <div className="text-xs text-rose-900 space-y-0.5">
          <p><span className="font-bold">Date Conferred:</span> {certificate.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString() : 'N/A'}</p>
          <p className="text-[10px] text-rose-800">{org?.footerText}</p>
        </div>

        {qrCodeUrl && (
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt="Verify QR" className="w-14 h-14 bg-white p-1 rounded border border-rose-800 shadow-sm" />
            <span className="text-[8px] font-mono text-rose-900 mt-0.5">Scan to Verify</span>
          </div>
        )}

        <div className="text-right flex flex-col items-end">
          {org?.signatureDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.signatureDataUrl} alt="Signature" className="h-10 w-auto max-w-[130px] object-contain mb-1" />
          ) : (
            <div className="h-8 border-b border-rose-900 w-32 mb-1 text-xs italic text-rose-800 flex items-center justify-center">
              Authorized Seal
            </div>
          )}
          <p className="text-xs font-bold text-rose-950">{org?.signatoryName || 'Signatory Name'}</p>
          <p className="text-[10px] text-rose-800">{org?.signatoryDesignation || 'Designation'}</p>
        </div>
      </div>
    </div>
  );
};
