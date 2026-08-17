'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Sparkles,
  Upload,
  PlusCircle,
  Search,
  Filter,
  Check,
  ArrowRight,
  Copy,
  Trash2,
  Download,
  Edit3,
  Palette,
} from 'lucide-react';
import { TEMPLATES } from '@/lib/constants';
import { BUILT_IN_TEMPLATES } from '@/lib/template/builtInTemplates';
import { TemplateId, CertificateRecord } from '@/types';
import { CustomTemplate } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import { PageHeader } from '@/components/ui/PageHeader';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';
import { demoOrganization } from '@/lib/demo-data';
import { SmartDesignModal } from '@/components/templates/SmartDesignModal';

const sampleCertificate: CertificateRecord = {
  id: 'cert-template-demo',
  certificateCode: 'ABC-REACT-2026-DEMO',
  verificationToken: '550e8400-e29b-41d4-a716-446655440000',
  eventId: 'evt-react-2026',
  recipientId: 'rec-subash-01',
  templateId: 'modern-blue',
  organizationSnapshot: demoOrganization,
  eventSnapshot: {
    id: 'evt-react-2026',
    name: 'React Development Workshop 2026',
    eventType: 'Workshop',
    description: '3-day intensive workshop on React 19 & Next.js App Router.',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    location: 'Auditorium Hall B, ABC Engineering College',
    certificateType: 'Participation',
    coordinatorName: 'Prof. K. Ramanathan',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  recipientSnapshot: {
    id: 'rec-subash-01',
    eventId: 'evt-react-2026',
    fullName: 'Subash P',
    email: 'subash@example.com',
    registrationNumber: '23CS101',
    department: 'Computer Science & Engineering',
    course: 'React Development Workshop',
    achievement: 'First Place - Hackathon',
    category: 'winner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  status: 'Valid',
  generatedAt: new Date().toISOString(),
};

type TabType = 'built-in' | 'imported' | 'custom' | 'smart';

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('built-in');
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [selectedBuiltInId, setSelectedBuiltInId] = useState<string>('tmpl-competition-winner');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [orientationFilter, setOrientationFilter] = useState<string>('ALL');

  // Modals
  const [showSmartModal, setShowSmartModal] = useState(false);

  const loadCustomTemplates = async () => {
    const list = templateRepository.getAll();
    setCustomTemplates(list);
  };

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  // Filtered Custom Templates
  const filteredCustomTemplates = customTemplates.filter((t) => {
    const matchesTab =
      activeTab === 'imported'
        ? t.category === 'Imported'
        : activeTab === 'smart'
        ? t.category === 'Smart Design'
        : activeTab === 'custom'
        ? t.category === 'Custom' || (!t.isBuiltIn && t.category !== 'Imported' && t.category !== 'Smart Design')
        : true;

    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrientation =
      orientationFilter === 'ALL' || t.orientation === orientationFilter;

    return matchesTab && matchesSearch && matchesOrientation;
  });

  const handleDuplicateBuiltIn = async (builtInId: string) => {
    const richBuiltIn = BUILT_IN_TEMPLATES.find((t) => t.id === builtInId);
    if (richBuiltIn) {
      const copyId = `tmpl-custom-${Date.now()}`;
      const copy: CustomTemplate = {
        ...richBuiltIn,
        id: copyId,
        name: `${richBuiltIn.name} (Custom Copy)`,
        description: `Customized copy of built-in ${richBuiltIn.name} template`,
        category: 'Custom',
        isBuiltIn: false,
        elements: richBuiltIn.elements.map((el) => ({ ...el, id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await templateRepository.save(copy);
      router.push(`/studio/editor/${copy.id}`);
      return;
    }

    const builtIn = TEMPLATES.find((t) => t.id === builtInId);
    if (!builtIn) return;

    const copyId = `tmpl-custom-${Date.now()}`;
    const copy: CustomTemplate = {
      id: copyId,
      name: `${builtIn.name} (Custom Copy)`,
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
          name: 'Certificate Header',
          x: 221,
          y: 80,
          width: 400,
          height: 45,
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
      ],
    };

    await templateRepository.save(copy);
    router.push(`/studio/editor/${copy.id}`);
  };

  const handleDuplicate = async (id: string) => {
    await templateRepository.duplicate(id);
    loadCustomTemplates();
  };

  const handleDelete = async (id: string) => {
    await templateRepository.delete(id);
    loadCustomTemplates();
  };

  const handleExport = async (id: string) => {
    const pkgJson = await templateRepository.exportPackage(id);
    if (!pkgJson) return;

    const blob = new Blob([pkgJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CertifyHub_Template_${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Certificate Design Templates"
        description="Browse built-in vector themes, import Canva designs, or edit layouts in Certificate Studio."
        icon={Layers}
        breadcrumbs={[{ label: 'Templates' }]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/studio/import"
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-3.5 rounded-lg border border-slate-200 shadow-xs transition"
            >
              <Upload className="w-4 h-4 text-teal-600" />
              <span>Import Design</span>
            </Link>

            <button
              onClick={() => setShowSmartModal(true)}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs py-2.5 px-3.5 rounded-lg border border-blue-200 shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Smart Assistant</span>
            </button>

            <Link
              href="/studio/new"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create from Scratch</span>
            </Link>
          </div>
        }
      />

      {/* 4 Method Tabs Header */}
      <div
        className="p-2 rounded-2xl flex flex-wrap items-center gap-2 border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {[
          { id: 'built-in', label: 'Method 1: Built-in Templates' },
          { id: 'imported', label: 'Method 2: Imported Canva/PDF' },
          { id: 'custom', label: 'Method 3: Custom Canvas' },
          { id: 'smart', label: 'Method 4: Smart Assistant' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition text-center min-w-[140px]"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Method 1: Built-in Templates */}
      {activeTab === 'built-in' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Specialized Role & Achievement Templates (Winner, Runner, Participated)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BUILT_IN_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedBuiltInId(tmpl.id)}
                  className="p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3"
                  style={{
                    backgroundColor: selectedBuiltInId === tmpl.id ? 'var(--surface-elevated)' : 'var(--surface)',
                    borderColor: selectedBuiltInId === tmpl.id ? 'var(--primary)' : 'var(--border)',
                    boxShadow: selectedBuiltInId === tmpl.id ? '0 0 0 2px var(--primary)' : 'var(--shadow-xs)',
                  }}
                >
                  <div className="space-y-2">
                    <div
                      className="h-24 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner p-2 text-center"
                      style={{ backgroundColor: tmpl.backgroundColor || '#FFFFFF', color: '#0F172A' }}
                    >
                      {tmpl.name}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</h4>
                        {selectedBuiltInId === tmpl.id && (
                          <span
                            className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{tmpl.description}</p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1.5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <Link
                      href={`/generate?templateId=${tmpl.id}`}
                      className="w-full flex items-center justify-center gap-1.5 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] transition shadow-xs"
                      style={{ backgroundColor: 'var(--primary)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Use in Generator</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateBuiltIn(tmpl.id);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 font-semibold py-1.5 px-3 rounded-lg text-[11px] border transition"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Palette className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                      <span>Customize in Studio</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Classic Built-in Vector Themes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedBuiltInId(tmpl.id)}
                  className="p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3"
                  style={{
                    backgroundColor: selectedBuiltInId === tmpl.id ? 'var(--surface-elevated)' : 'var(--surface)',
                    borderColor: selectedBuiltInId === tmpl.id ? 'var(--primary)' : 'var(--border)',
                    boxShadow: selectedBuiltInId === tmpl.id ? '0 0 0 2px var(--primary)' : 'var(--shadow-xs)',
                  }}
                >
                  <div className="space-y-2">
                    <div
                      className="h-20 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                      style={{ backgroundColor: tmpl.theme.cardBg, color: tmpl.theme.primary }}
                    >
                      {tmpl.name}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</h4>
                        {selectedBuiltInId === tmpl.id && (
                          <span
                            className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{tmpl.description}</p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-1.5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <Link
                      href={`/generate?templateId=${tmpl.id}`}
                      className="w-full flex items-center justify-center gap-1.5 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] transition shadow-xs"
                      style={{ backgroundColor: 'var(--primary)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Use in Generator</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateBuiltIn(tmpl.id);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 font-semibold py-1.5 px-3 rounded-lg text-[11px] border transition"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Palette className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                      <span>Customize in Studio</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-6 rounded-2xl space-y-4 border shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                Active Preview Template:{' '}
                <span className="font-mono" style={{ color: 'var(--primary)' }}>
                  {BUILT_IN_TEMPLATES.find((t) => t.id === selectedBuiltInId)?.name ||
                    TEMPLATES.find((t) => t.id === selectedBuiltInId)?.name ||
                    selectedBuiltInId}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/studio/editor/${selectedBuiltInId}`}
                  className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg border transition"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Palette className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                  <span>Customize in Studio</span>
                </Link>
                <Link
                  href={`/generate?templateId=${selectedBuiltInId}`}
                  className="text-xs font-bold text-white flex items-center gap-1 px-3 py-1.5 rounded-lg transition shadow-xs"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <span>Use in Bulk Generator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border flex justify-center"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <CertificateRenderer certificate={sampleCertificate} templateId={selectedBuiltInId as TemplateId} />
            </div>
          </div>
        </div>
      )}

      {/* Methods 2, 3, 4: Custom / Imported / Smart Templates List */}
      {activeTab !== 'built-in' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search custom templates..."
                className="w-full rounded-xl pl-10 pr-4 py-2 text-xs border focus:outline-none transition"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <select
                value={orientationFilter}
                onChange={(e) => setOrientationFilter(e.target.value)}
                className="text-xs rounded-xl px-3 py-2 border focus:outline-none transition"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="ALL">All Orientations</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>

          {filteredCustomTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="rounded-2xl p-5 space-y-4 border shadow-xs transition flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: 'var(--primary-light)',
                          borderColor: 'var(--primary-border)',
                          color: 'var(--primary)',
                        }}
                      >
                        {tmpl.category}
                      </span>
                      <span className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>{tmpl.orientation}</span>
                    </div>

                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</h3>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{tmpl.description}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tmpl.elements.length} elements</p>
                  </div>

                  {/* Template Card Controls */}
                  <div className="pt-3 flex items-center justify-between gap-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <Link
                      href={`/studio/editor/${tmpl.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-white font-bold py-2 rounded-lg text-xs shadow-xs transition"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit in Studio</span>
                    </Link>

                    <button
                      onClick={() => handleDuplicate(tmpl.id)}
                      className="p-2 rounded-lg border transition"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleExport(tmpl.id)}
                      className="p-2 rounded-lg border transition"
                      style={{
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                      title="Export Package"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(tmpl.id)}
                      className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-12 rounded-2xl text-center space-y-4 border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No Custom Templates Found</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Import a Canva design background, generate with Smart Assistant, or create a layout from scratch.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/studio/import"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-xs transition"
                >
                  Import Design
                </Link>
                <Link
                  href="/studio/new"
                  className="text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-xs transition"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Create from Scratch
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Smart Design Modal */}
      <SmartDesignModal
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onSuccessOpenEditor={(tmpl) => {
          router.push(`/studio/editor/${tmpl.id}`);
        }}
      />
    </div>
  );
}

