'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit3,
  Download,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { CustomTemplate } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { Recipient } from '@/types';
import dynamic from 'next/dynamic';

const CanvasStage = dynamic(
  () => import('@/components/editor/CanvasStage').then((mod) => mod.CanvasStage),
  { ssr: false }
);

interface Props {
  params: Promise<{ templateId: string }>;
}

const defaultPreviewRecipient: Recipient = {
  id: 'preview-sample-01',
  eventId: 'preview-evt',
  fullName: 'Recipient Name',
  email: 'student@example.com',
  registrationNumber: 'REG-001',
  department: 'Computer Science',
  course: 'Certification Course',
  achievement: 'Excellence Award',
  category: 'participant',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function StudioPreviewPage({ params }: Props) {
  const { templateId } = use(params);
  const router = useRouter();

  const [template, setTemplate] = useState<CustomTemplate | null>(null);
  const [recipientsList, setRecipientsList] = useState<Recipient[]>([defaultPreviewRecipient]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>(defaultPreviewRecipient);
  const [zoomLevel, setZoomLevel] = useState(0.85);

  useEffect(() => {
    async function fetchTmpl() {
      const t = await templateRepository.getById(templateId);
      if (t) {
        setTemplate(t);
      } else {
        router.push('/studio');
      }
    }
    fetchTmpl();

    const storedRecipients = recipientRepository.getAll();
    if (storedRecipients.length > 0) {
      setRecipientsList(storedRecipients);
      setSelectedRecipient(storedRecipients[0]);
    }
  }, [templateId, router]);

  if (!template) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading certificate preview...</div>;
  }

  // Generate dynamic sample data object based on selected recipient
  const sampleData: Record<string, string> = {
    '{{recipient.name}}': selectedRecipient.fullName,
    '{{recipient.email}}': selectedRecipient.email || '',
    '{{recipient.registrationNumber}}': selectedRecipient.registrationNumber || '',
    '{{recipient.department}}': selectedRecipient.department || 'Computer Science',
    '{{recipient.course}}': selectedRecipient.course || 'React 19 & Next.js App Router Workshop',
    '{{recipient.achievement}}': selectedRecipient.achievement || 'First Place',
    '{{organization.name}}': 'ABC Engineering College',
    '{{event.name}}': 'React Development Workshop 2026',
    '{{event.date}}': 'March 12, 2026',
    '{{event.venue}}': 'Auditorium Hall B',
    '{{certificate.type}}': 'Certificate of Participation',
    '{{certificate.code}}': 'ABC-REACT-2026-0001',
    '{{certificate.issueDate}}': '2026-03-12',
    '{{signatory.name}}': 'Dr. R. Sundaram',
    '{{signatory.designation}}': 'Principal & Dean of Academics',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/studio/editor/${template.id}`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Return to Editor"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>Preview: {template.name}</span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 uppercase">
                {template.category}
              </span>
            </h1>
            <p className="text-xs text-slate-500">Live dynamic field replacement preview</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Recipient Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedRecipient.id}
              onChange={(e) => {
                const rec = recipientsList.find((r) => r.id === e.target.value);
                if (rec) setSelectedRecipient(rec);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {recipientsList.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.fullName} {rec.registrationNumber ? `(${rec.registrationNumber})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))}
              className="p-1 rounded text-slate-600 hover:bg-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-600">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.1))}
              className="p-1 rounded text-slate-600 hover:bg-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(0.85)}
              className="p-1 rounded text-slate-600 hover:bg-white ml-1 border-l border-slate-200"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href={`/studio/editor/${template.id}`}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </Link>
        </div>
      </div>

      {/* Canvas Display Viewport */}
      <div className="bg-slate-200 p-8 rounded-2xl border border-slate-300 flex items-center justify-center min-h-[500px] overflow-auto shadow-inner">
        <CanvasStage
          width={template.width}
          height={template.height}
          backgroundColor={template.backgroundColor}
          backgroundImageUrl={template.backgroundDataUrl}
          elements={template.elements}
          selectedId={null}
          onSelect={() => {}}
          onUpdateElement={() => {}}
          zoomLevel={zoomLevel}
          isPreviewMode={true}
          sampleData={sampleData}
        />
      </div>
    </div>
  );
}
