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
        <div
          className="rounded-2xl p-6 space-y-4 border shadow-xs transition flex flex-col justify-between group"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="space-y-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-105 transition"
              style={{
                backgroundColor: 'var(--primary-light)',
                borderColor: 'var(--primary-border)',
                color: 'var(--primary)',
              }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Guided Certificate Builder</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Step-by-step wizard guiding beginners through 10 steps to build an institutional certificate.
            </p>
          </div>
          <button
            onClick={() => setShowGuidedBuilder(true)}
            className="w-full inline-flex items-center justify-center gap-2 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span>Launch Guided Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Import Organization Template */}
        <div
          className="rounded-2xl p-6 space-y-4 border shadow-xs transition flex flex-col justify-between group"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-105 transition"
            style={{
              backgroundColor: 'var(--secondary-light)',
              borderColor: 'var(--border)',
              color: 'var(--secondary)',
            }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Import Organization Template</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Upload PNG/JPG/PDF background from Canva, Figma or Illustrator & add dynamic fields.
          </p>
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition"
          >
            <span>Import Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Use Ready Template */}
        <div
          className="rounded-2xl p-6 space-y-4 border shadow-xs transition flex flex-col justify-between group"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="space-y-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-105 transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Use Ready Template</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Browse 8 built-in institutional templates including Institutional Appreciation.
            </p>
          </div>
          <Link
            href="/templates"
            className="w-full inline-flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition border"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <span>Browse Ready Presets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Create from Scratch */}
        <div
          className="rounded-2xl p-6 space-y-4 border shadow-xs transition flex flex-col justify-between group"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="space-y-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-105 transition"
              style={{
                backgroundColor: 'var(--warning-light)',
                borderColor: 'var(--warning-border)',
                color: 'var(--warning)',
              }}
            >
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Create from Scratch</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
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
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <span>Recent Designs</span>
            </h2>
            <Link href="/studio/designs" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              View All My Designs ({customTemplates.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDesigns.map((tmpl) => (
              <div
                key={tmpl.id}
                className="rounded-2xl p-4 space-y-3 border shadow-xs transition flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="space-y-2">
                  <div
                    className="h-24 rounded-xl flex items-center justify-center border overflow-hidden relative"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    {tmpl.thumbnailDataUrl && !tmpl.thumbnailDataUrl.startsWith('indexeddb:') ? (
                      <img src={tmpl.thumbnailDataUrl} alt={tmpl.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <Layout className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>{tmpl.orientation}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: 'var(--primary-light)',
                          borderColor: 'var(--primary-border)',
                          color: 'var(--primary)',
                        }}
                      >
                        {tmpl.category}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {new Date(tmpl.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs truncate mt-1" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</h3>
                  </div>
                </div>

                <Link
                  href={`/studio/editor/${tmpl.id}`}
                  className="w-full flex items-center justify-center gap-1.5 font-bold py-2 rounded-lg text-xs transition border"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--primary)',
                  }}
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
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Layout className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
            <span>Quick-Start Built-in Presets</span>
          </h2>
          <Link href="/templates" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
            Browse Full Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((builtIn) => (
            <div
              key={builtIn.id}
              className="rounded-2xl p-4 space-y-3 border shadow-xs transition flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="space-y-2">
                <div
                  className="h-24 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                  style={{ backgroundColor: builtIn.theme.cardBg, color: builtIn.theme.primary }}
                >
                  {builtIn.name}
                </div>
                <div>
                  <h3 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{builtIn.name}</h3>
                  <p className="text-[11px] line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{builtIn.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleDuplicateBuiltIn(builtIn.id)}
                className="w-full flex items-center justify-center gap-1.5 font-semibold py-2 rounded-lg text-xs transition border"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Customize in Studio</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Section 3: Browser Storage Summary */}
      <div
        className="rounded-2xl p-6 space-y-4 border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Local Browser Storage Summary</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Studio saves designs client-side in localStorage & IndexedDB (`certifyhub:v1:`).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 font-semibold text-xs py-2 px-3 rounded-lg border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup JSON</span>
            </button>
            <Link
              href="/studio/designs"
              className="flex items-center gap-1.5 font-semibold text-xs py-2 px-3.5 rounded-lg border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              <span>Manage Templates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div
            className="p-3.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Saved Designs</p>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{customTemplates.length}</p>
          </div>
          <div
            className="p-3.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Imported Designs</p>
            <p className="text-lg font-bold text-teal-400 mt-1">
              {customTemplates.filter((t) => t.category === 'Imported').length}
            </p>
          </div>
          <div
            className="p-3.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Smart-Generated</p>
            <p className="text-lg font-bold text-amber-400 mt-1">
              {customTemplates.filter((t) => t.category === 'Smart Design').length}
            </p>
          </div>
          <div
            className="p-3.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Approx Storage</p>
            <p className="text-lg font-bold mt-1" style={{ color: 'var(--secondary)' }}>{storageUsageStr}</p>
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
