'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Palette,
  PlusCircle,
  Upload,
  Sparkles,
  Layers,
  ArrowRight,
  HardDrive,
  Copy,
  Edit3,
  Clock,
  Layout,
  Check,
  Download,
} from 'lucide-react';
import { CustomTemplate } from '@/types/template';
import { TEMPLATES } from '@/lib/constants';
import { templateRepository } from '@/lib/storage/templateRepository';
import { PageHeader } from '@/components/ui/PageHeader';
import { SmartDesignModal } from '@/components/templates/SmartDesignModal';
import { GuidedCertificateBuilder } from '@/components/studio/GuidedCertificateBuilder';
import { ImportTemplateModal } from '@/components/studio/ImportTemplateModal';

export default function StudioLandingPage() {
  const router = useRouter();
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [showGuidedBuilder, setShowGuidedBuilder] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [storageUsageStr, setStorageUsageStr] = useState<string>('0 KB');

  const loadData = async () => {
    const list = templateRepository.getAll();
    setCustomTemplates(list);

    // Calculate approximate storage usage
    let bytes = 0;
    try {
      const raw = localStorage.getItem('certifyhub:v1:custom_templates') || '';
      bytes = raw.length * 2;
    } catch {
      bytes = 0;
    }
    if (bytes < 1024) setStorageUsageStr(`${bytes} Bytes`);
    else if (bytes < 1024 * 1024) setStorageUsageStr(`${(bytes / 1024).toFixed(1)} KB`);
    else setStorageUsageStr(`${(bytes / (1024 * 1024)).toFixed(1)} MB`);
  };

  useEffect(() => {
    loadData();
  }, []);

  const recentDesigns = [...customTemplates]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const handleDuplicateBuiltIn = async (builtInId: string) => {
    const builtIn = TEMPLATES.find((t) => t.id === builtInId);
    if (!builtIn) return;

    const copyId = `tmpl-custom-${Date.now()}`;
    const copy: CustomTemplate = {
      id: copyId,
      name: `${builtIn.name} Customized`,
      description: `Customized copy of built-in ${builtIn.name} template`,
      category: 'Custom',
      orientation: 'landscape',
      width: 842,
      height: 595,
      backgroundColor: builtIn.theme.cardBg || '#FFFFFF',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [
        {
          id: 'el-title',
          type: 'text',
          name: 'Certificate Title',
          x: 221,
          y: 80,
          width: 400,
          height: 50,
          rotation: 0,
          zIndex: 1,
          visible: true,
          locked: false,
          opacity: 1,
          textValue: builtIn.name.toUpperCase(),
          textStyle: {
            fontSize: 28,
            fontFamily: 'Helvetica',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fill: builtIn.theme.primary,
            align: 'center',
          },
        },
        {
          id: 'el-name',
          type: 'dynamic-text',
          name: 'Recipient Name',
          x: 171,
          y: 200,
          width: 500,
          height: 45,
          rotation: 0,
          zIndex: 2,
          visible: true,
          locked: false,
          opacity: 1,
          dynamicBinding: '{{recipient.name}}',
          textStyle: {
            fontSize: 32,
            fontFamily: 'Helvetica',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fill: builtIn.theme.primary,
            align: 'center',
          },
        },
      ],
    };

    await templateRepository.save(copy);
    router.push(`/studio/editor/${copy.id}`);
  };

  const handleExportBackup = async () => {
    const all = templateRepository.getAll();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CertifyHub_Studio_Designs_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Certificate Studio"
        description="Create, import and customize professional certificate designs."
        icon={Palette}
        breadcrumbs={[{ label: 'Certificate Studio' }]}
      />

      {/* 4 Large Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Guided Certificate Builder */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Guided Certificate Builder</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Step-by-step wizard guiding beginners through 10 steps to build an institutional certificate.
            </p>
          </div>
          <button
            onClick={() => setShowGuidedBuilder(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
          >
            <span>Launch Guided Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Import Organization Template */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs hover:shadow-md hover:border-teal-300 transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Import Organization Template</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload PNG/JPG/PDF background from Canva, Figma or Illustrator & add dynamic fields.
            </p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
          >
            <span>Import Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Use Ready Template */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Use Ready Template</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse 8 built-in institutional templates including Institutional Appreciation.
            </p>
          </div>
          <Link
            href="/templates"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
          >
            <span>Browse Ready Presets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Create from Scratch */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Create from Scratch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start with a blank A4 canvas and construct your custom certificate element by element.
            </p>
          </div>
          <Link
            href="/studio/new"
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
          >
            <span>Create Blank Design</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Dashboard Section 1: Recent Designs */}
      {recentDesigns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Recent Designs</span>
            </h2>
            <Link href="/studio/designs" className="text-xs font-semibold text-blue-600 hover:underline">
              View All My Designs ({customTemplates.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDesigns.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-24 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 overflow-hidden relative">
                    {tmpl.thumbnailDataUrl && !tmpl.thumbnailDataUrl.startsWith('indexeddb:') ? (
                      <img src={tmpl.thumbnailDataUrl} alt={tmpl.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <Layout className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{tmpl.orientation}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                        {tmpl.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(tmpl.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 truncate mt-1">{tmpl.name}</h3>
                  </div>
                </div>

                <Link
                  href={`/studio/editor/${tmpl.id}`}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 rounded-lg text-xs transition border border-blue-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Open Editor</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Section 2: Quick-Start Built-in Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layout className="w-4 h-4 text-indigo-600" />
            <span>Quick-Start Built-in Presets</span>
          </h2>
          <Link href="/templates" className="text-xs font-semibold text-blue-600 hover:underline">
            Browse Full Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((builtIn) => (
            <div
              key={builtIn.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div
                  className="h-24 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                  style={{ backgroundColor: builtIn.theme.cardBg, color: builtIn.theme.primary }}
                >
                  {builtIn.name}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{builtIn.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{builtIn.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleDuplicateBuiltIn(builtIn.id)}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-lg text-xs transition border border-slate-200"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Customize in Studio</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Section 3: Browser Storage Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Local Browser Storage Summary</h3>
              <p className="text-xs text-slate-500">
                Studio saves designs client-side in localStorage & IndexedDB (`certifyhub:v1:`).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2 px-3 rounded-lg border border-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup JSON</span>
            </button>
            <Link
              href="/studio/designs"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition shadow-xs"
            >
              <span>Manage Saved Designs</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Saved Designs</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{customTemplates.length}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Imported Designs</p>
            <p className="text-lg font-bold text-teal-700 mt-1">
              {customTemplates.filter((t) => t.category === 'Imported').length}
            </p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Smart-Generated</p>
            <p className="text-lg font-bold text-amber-700 mt-1">
              {customTemplates.filter((t) => t.category === 'Smart Design').length}
            </p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approx Storage</p>
            <p className="text-lg font-bold text-indigo-700 mt-1">{storageUsageStr}</p>
          </div>
        </div>
      </div>

      {/* Smart Design Modal */}
      <SmartDesignModal
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onSuccessOpenEditor={(tmpl) => {
          router.push(`/studio/editor/${tmpl.id}`);
        }}
      />

      {/* Guided Certificate Builder Modal */}
      <GuidedCertificateBuilder
        isOpen={showGuidedBuilder}
        onClose={() => setShowGuidedBuilder(false)}
        onComplete={(doc) => {
          router.push(`/studio/editor/${doc.id}`);
        }}
      />

      {/* Import Organization Template Modal */}
      <ImportTemplateModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={(doc) => {
          router.push(`/studio/editor/${doc.id}`);
        }}
      />
    </div>
  );
}
