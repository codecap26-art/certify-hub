// ============================================================================
// Certificate Renderer Component — Unified Live Preview & Rendering System
// Supports Built-in, Custom, Imported (PNG/JPG/WebP/PDF), and Smart Templates
// ============================================================================

'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import QRCode from 'qrcode';
import { AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { CertificateRecord, TemplateId } from '@/types';
import { CustomTemplate } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import { ModernBlueTemplate } from './ModernBlueTemplate';
import { ClassicGoldTemplate } from './ClassicGoldTemplate';
import { MinimalGreenTemplate } from './MinimalGreenTemplate';
import { AcademicMaroonTemplate } from './AcademicMaroonTemplate';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import {
  getNormalizedCategory,
  getCertificateCategoryTitle,
  getCertificateMainTitle,
  getCertificateRoleLabel,
  getCertificateRankLabel,
  getCategoryDisplayTitle,
} from '@/lib/participantUtils';

// SSR-disabled Konva canvas stage for dynamic document rendering
const CanvasStage = dynamic(
  () => import('../editor/CanvasStage').then((mod) => mod.CanvasStage),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Initializing Canvas Renderer...</span>
      </div>
    ),
  }
);

interface Props {
  certificate: Partial<CertificateRecord>;
  templateId?: string;
  template?: CustomTemplate;
}

export const CertificateRenderer: React.FC<Props> = ({ certificate, templateId, template }) => {
  const [currentTemplate, setCurrentTemplate] = useState<CustomTemplate | null>(template || null);
  const [legacyId, setLegacyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!template);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const activeTemplateId = templateId || certificate.templateId || 'modern-blue';
  const requestIdRef = useRef<number>(0);

  // 1. Asynchronously resolve selected template and its IndexedDB assets
  const loadTemplateData = async (targetId: string) => {
    const currentReqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setLegacyId(null);

    try {
      if (template) {
        if (requestIdRef.current === currentReqId) {
          setCurrentTemplate(template);
          setLoading(false);
        }
        return;
      }

      const fetched = await templateRepository.getById(targetId);
      if (requestIdRef.current !== currentReqId) return; // Stale request check

      if (fetched) {
        setCurrentTemplate(fetched);
        setLoading(false);
      } else {
        // Fallback for legacy static template strings if not found in repository
        if (['modern-blue', 'classic-gold', 'minimal-green', 'academic-maroon'].includes(targetId)) {
          setCurrentTemplate(null);
          setLegacyId(targetId);
          setLoading(false);
        } else {
          setError(`Template layout "${targetId}" could not be loaded.`);
          setLoading(false);
        }
      }
    } catch (err) {
      if (requestIdRef.current === currentReqId) {
        console.error('Failed to load template layout:', err);
        setError('Error loading template assets from local storage.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTemplateData(activeTemplateId);
  }, [activeTemplateId, template]);

  // 2. Generate QR Code Data URL for sample preview
  useEffect(() => {
    let isMounted = true;
    const token = certificate.verificationToken || certificate.certificateCode || 'demo-token';

    if (typeof window !== 'undefined') {
      const verifyUrl = `${window.location.origin}/verify/${token}`;
      QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 })
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [certificate.verificationToken, certificate.certificateCode]);

  // Merge organization snapshot with fallback for missing assets
  const currentOrg = organizationRepository.get();
  const mergedCertificate: Partial<CertificateRecord> = {
    ...certificate,
    organizationSnapshot: {
      ...currentOrg,
      ...certificate.organizationSnapshot,
      logoDataUrl: certificate.organizationSnapshot?.logoDataUrl || currentOrg.logoDataUrl,
      signatureDataUrl: certificate.organizationSnapshot?.signatureDataUrl || currentOrg.signatureDataUrl,
    },
  };

  // 3. Render Loading Overlay State
  if (loading) {
    return (
      <div className="w-full min-h-[400px] bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center text-xs text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-800 text-sm">Loading Selected Template Preview...</p>
        <p className="text-[11px] text-slate-400 font-mono">ID: {activeTemplateId}</p>
      </div>
    );
  }

  // 4. Render Error State
  if (error || (!currentTemplate && !legacyId)) {
    return (
      <div className="w-full min-h-[300px] bg-rose-50/60 border border-rose-200 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center text-xs">
        <AlertTriangle className="w-8 h-8 text-rose-600" />
        <p className="font-bold text-slate-900 text-sm">{error || 'Unable to load this template preview.'}</p>
        <p className="text-[11px] text-slate-500 max-w-sm">
          The background asset or element definition could not be read from browser local storage.
        </p>
        <button
          onClick={() => loadTemplateData(activeTemplateId)}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
        </button>
      </div>
    );
  }

  // 5. Render Normalized Custom / Imported / Built-in / Smart Template Document
  if (currentTemplate) {
    const isPortrait = currentTemplate.orientation === 'portrait';
    const docWidth = currentTemplate.width || (isPortrait ? 595 : 842);
    const docHeight = currentTemplate.height || (isPortrait ? 842 : 595);

    const recCat = getNormalizedCategory(mergedCertificate.recipientSnapshot || {});
    const catTitle = getCertificateCategoryTitle(recCat, mergedCertificate.eventSnapshot?.certificateType);
    const catMainTitle = getCertificateMainTitle(recCat, mergedCertificate.eventSnapshot?.certificateType);
    const catRole = getCertificateRoleLabel(recCat, mergedCertificate.recipientSnapshot?.achievement);
    const catRank = getCertificateRankLabel(recCat, mergedCertificate.recipientSnapshot?.achievement);

    // Compute sample dynamic binding values for on-screen live preview
    const sampleData: Record<string, string> = {
      '{{recipient.name}}': mergedCertificate.recipientSnapshot?.fullName || 'SUBASH P',
      '{{recipient.email}}': mergedCertificate.recipientSnapshot?.email || 'subash@example.com',
      '{{recipient.registrationNumber}}': mergedCertificate.recipientSnapshot?.registrationNumber || '23CS101',
      '{{recipient.department}}': mergedCertificate.recipientSnapshot?.department || 'Computer Science & Engineering',
      '{{recipient.course}}': mergedCertificate.recipientSnapshot?.course || mergedCertificate.eventSnapshot?.name || 'React Development Workshop',
      '{{recipient.achievement}}': catRole,
      '{{recipient.category}}': getCategoryDisplayTitle(recCat),
      '{{recipient.role}}': catRole,
      '{{recipient.rank}}': catRank,

      '{{organization.name}}': mergedCertificate.organizationSnapshot?.name || 'ABC ENGINEERING COLLEGE',
      '{{organization.address}}': mergedCertificate.organizationSnapshot?.address || 'Autonomous Institution Affiliated to State University',
      '{{organization.affiliation}}': (mergedCertificate.organizationSnapshot as any)?.affiliation || 'Autonomous Institution Affiliated to State University',
      '{{organization.accreditation}}': (mergedCertificate.organizationSnapshot as any)?.accreditation || 'Accredited with NAAC A+ Grade',
      '{{organization.slogan}}': (mergedCertificate.organizationSnapshot as any)?.slogan || 'Excellence in Technology',
      '{{organization.logo}}': mergedCertificate.organizationSnapshot?.logoDataUrl || '',

      '{{event.name}}': mergedCertificate.eventSnapshot?.name || 'React Development Workshop 2026',
      '{{event.organizer}}': mergedCertificate.eventSnapshot?.coordinatorName || 'Department of Computer Science',
      '{{event.department}}': mergedCertificate.eventSnapshot?.coordinatorName || 'Department of Computer Science',
      '{{event.venue}}': mergedCertificate.eventSnapshot?.location || 'Auditorium Hall B',
      '{{event.startDate}}': mergedCertificate.eventSnapshot?.startDate || '2026-03-10',
      '{{event.endDate}}': mergedCertificate.eventSnapshot?.endDate || '2026-03-12',
      '{{event.dateRange}}': mergedCertificate.eventSnapshot?.startDate ? `${mergedCertificate.eventSnapshot.startDate} - ${mergedCertificate.eventSnapshot.endDate}` : 'March 10-12, 2026',
      '{{event.date}}': mergedCertificate.eventSnapshot?.startDate || '2026-03-12',

      '{{certificate.type}}': catTitle.toUpperCase().replace(/^CERTIFICATE\s+/, ''),
      '{{certificate.title}}': catMainTitle,
      '{{certificate.issueDate}}': mergedCertificate.generatedAt ? mergedCertificate.generatedAt.slice(0, 10) : '2026-03-12',
      '{{certificate.code}}': mergedCertificate.certificateCode || 'ABC-REACT-2026-0001',
      '{{certificate.verificationUrl}}': mergedCertificate.verificationToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${mergedCertificate.verificationToken}` : '',
      '{{certificate.qrCode}}': qrDataUrl,

      '{{signatory.name}}': mergedCertificate.organizationSnapshot?.signatoryName || 'Dr. R. Sundaram',
      '{{signatory.designation}}': mergedCertificate.organizationSnapshot?.signatoryDesignation || 'Principal & Dean of Academics',
      '{{signatory.1.name}}': 'Dr. R. Sundaram',
      '{{signatory.1.designation}}': 'Convener & Professor',
      '{{signatory.2.name}}': 'Dr. M. Lakshmi',
      '{{signatory.2.designation}}': 'Head of Department',
      '{{signatory.3.name}}': 'Prof. V. Anand',
      '{{signatory.3.designation}}': 'Dean of Academics',
    };

    const zoomLevel = isPortrait ? 0.65 : 0.78;

    return (
      <div className="w-full flex flex-col items-center justify-center p-2">
        <div
          key={currentTemplate.id}
          className="rounded-xl overflow-hidden shadow-xl border border-slate-300 bg-white transition-all duration-150 flex items-center justify-center"
        >
          <CanvasStage
            width={docWidth}
            height={docHeight}
            backgroundColor={currentTemplate.backgroundColor || '#FFFFFF'}
            backgroundImageUrl={currentTemplate.backgroundDataUrl}
            elements={currentTemplate.elements as any}
            zoomLevel={zoomLevel}
            isPreviewMode={true}
            sampleData={sampleData}
          />
        </div>
      </div>
    );
  }

  // 6. Render Legacy Hardcoded Component Fallback
  const renderLegacy = () => {
    switch (legacyId) {
      case 'classic-gold':
        return <ClassicGoldTemplate certificate={mergedCertificate} qrCodeUrl={qrDataUrl} />;
      case 'minimal-green':
        return <MinimalGreenTemplate certificate={mergedCertificate} qrCodeUrl={qrDataUrl} />;
      case 'academic-maroon':
        return <AcademicMaroonTemplate certificate={mergedCertificate} qrCodeUrl={qrDataUrl} />;
      case 'modern-blue':
      default:
        return <ModernBlueTemplate certificate={mergedCertificate} qrCodeUrl={qrDataUrl} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl border border-slate-700/50">
      {renderLegacy()}
    </div>
  );
};
