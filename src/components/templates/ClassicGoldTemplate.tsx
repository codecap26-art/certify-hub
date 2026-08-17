import React from 'react';
import { CertificateRecord } from '@/types';
import {
  getNormalizedCategory,
  getCertificateCategoryTitle,
  getCertificateMainTitle,
  getCertificateRoleLabel,
} from '@/lib/participantUtils';

interface TemplateProps {
  certificate: Partial<CertificateRecord>;
  qrCodeUrl?: string;
}

export const ClassicGoldTemplate: React.FC<TemplateProps> = ({ certificate, qrCodeUrl }) => {
  const org = certificate.organizationSnapshot;
  const event = certificate.eventSnapshot;
  const recipient = certificate.recipientSnapshot;
  const category = getNormalizedCategory(recipient || {});
  const certCategoryTitle = getCertificateCategoryTitle(category, event?.certificateType);
  const certMainTitle = getCertificateMainTitle(category, event?.certificateType);
  const roleLabel = getCertificateRoleLabel(category, recipient?.achievement);
  const isWinner = category === 'winner';
  const isRunner = category === 'runner';

  return (
    <div
      className="relative w-full aspect-[1.414/1] bg-[#FFFDF5] text-amber-950 p-8 flex flex-col justify-between overflow-hidden shadow-2xl border-4 border-amber-600"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      {/* Ornate Gold Border Structure */}
      <div className="absolute inset-2 border-2 border-amber-500/60 pointer-events-none" />
      <div className="absolute inset-4 border border-amber-400/40 pointer-events-none" />

      {/* Decorative Corner Ornaments */}
      <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
      <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {org?.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logoDataUrl} alt={org.name} className="h-14 w-auto object-contain max-w-[140px]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-600 text-amber-100 flex items-center justify-center font-bold text-xl shadow-md border border-amber-700">
              {(org?.name || 'A').charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-amber-900 uppercase tracking-wide">{org?.name || 'Organization Name'}</h2>
            <p className="text-xs text-amber-800/80 italic">{org?.address}</p>
          </div>
        </div>

        <div className="text-right font-mono text-[10px] text-amber-800">
          <p>Certificate No:</p>
          <p className="font-bold text-xs">{certificate.certificateCode || 'GOLD-2026-0001'}</p>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative z-10 text-center my-auto py-3">
        <p className="text-xs font-bold tracking-[0.25em] text-amber-700 uppercase mb-1">
          Official {certCategoryTitle}
        </p>

        <h1 className="text-3xl md:text-4xl font-extrabold text-amber-950 tracking-tight font-serif uppercase my-2">
          {certMainTitle}
        </h1>

        <p className="text-xs text-amber-900 italic my-2">This is to certify that</p>

        <div className="inline-block relative my-1">
          <p className="text-2xl md:text-3xl font-extrabold text-amber-900 border-b-2 border-amber-600 px-8 py-1 tracking-wide">
            {recipient?.fullName || 'Recipient Name'}
          </p>
        </div>

        <p className="text-xs md:text-sm text-amber-900/90 max-w-2xl mx-auto leading-relaxed mt-3">
          {isWinner
            ? `has demonstrated exceptional mastery and secured First Place distinction in `
            : isRunner
            ? `has demonstrated outstanding skill and secured Runner-Up distinction in `
            : `has successfully fulfilled all requirements and participated in `}
          <span className="font-bold text-amber-950">{event?.name || 'Event Title'}</span>
          {event?.startDate && ` held on ${event.startDate}`}.
          {isWinner && (
            <span className="block mt-2 font-bold text-amber-800 text-sm">
              🏆 Awarded Distinction: {roleLabel}
            </span>
          )}
          {isRunner && (
            <span className="block mt-2 font-bold text-purple-800 text-sm">
              🥈 Awarded Distinction: {roleLabel}
            </span>
          )}
          {!isWinner && !isRunner && recipient?.achievement && recipient.achievement !== 'Participant' && (
            <span className="block mt-1 font-bold text-amber-800">Awarded: {recipient.achievement}</span>
          )}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex justify-between items-end border-t border-amber-300/80 pt-3">
        <div className="text-xs text-amber-900 space-y-0.5">
          <p><span className="font-bold">Issued:</span> {certificate.generatedAt ? new Date(certificate.generatedAt).toLocaleDateString() : 'N/A'}</p>
          <p className="text-[10px] text-amber-800">{org?.footerText}</p>
        </div>

        {qrCodeUrl && (
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt="Verify QR Code" className="w-14 h-14 bg-white p-1 rounded border border-amber-400 shadow-sm" />
            <span className="text-[8px] font-mono text-amber-800 mt-0.5">Scan to Verify</span>
          </div>
        )}

        <div className="text-right flex flex-col items-end">
          {org?.signatureDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.signatureDataUrl} alt="Signature" className="h-10 w-auto max-w-[130px] object-contain mb-1" />
          ) : (
            <div className="h-8 border-b border-amber-600 w-32 mb-1 text-xs italic text-amber-700 flex items-center justify-center">
              Signature
            </div>
          )}
          <p className="text-xs font-bold text-amber-950">{org?.signatoryName || 'Signatory Name'}</p>
          <p className="text-[10px] text-amber-800">{org?.signatoryDesignation || 'Designation'}</p>
        </div>
      </div>
    </div>
  );
};
