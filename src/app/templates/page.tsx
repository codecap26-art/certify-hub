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
  const [selectedBuiltInId, setSelectedBuiltInId] = useState<TemplateId>('modern-blue');

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
      <div className="bg-white border border-slate-200 p-2 rounded-2xl flex flex-wrap items-center gap-2 shadow-xs">
        {[
          { id: 'built-in', label: 'Method 1: Built-in Templates' },
          { id: 'imported', label: 'Method 2: Imported Canva/PDF' },
          { id: 'custom', label: 'Method 3: Custom Canvas' },
          { id: 'smart', label: 'Method 4: Smart Assistant' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition text-center min-w-[140px] ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Method 1: Built-in Code Templates */}
      {activeTab === 'built-in' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedBuiltInId(tmpl.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition space-y-3 ${
                  selectedBuiltInId === tmpl.id
                    ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div
                  className="h-28 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                  style={{ backgroundColor: tmpl.theme.cardBg, color: tmpl.theme.primary }}
                >
                  {tmpl.name}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900">{tmpl.name}</h3>
                    {selectedBuiltInId === tmpl.id && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{tmpl.description}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateBuiltIn(tmpl.id);
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 px-3 rounded-lg text-[11px] border border-slate-200 transition"
                  >
                    <Palette className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customize in Studio</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900">
                Active Code Template:{' '}
                <span className="text-blue-600 font-mono">
                  {TEMPLATES.find((t) => t.id === selectedBuiltInId)?.name}
                </span>
              </span>

              <Link
                href="/generate"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Use in Certificate Generator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <CertificateRenderer certificate={sampleCertificate} templateId={selectedBuiltInId} />
            </div>
          </div>
        </div>
      )}

      {/* Methods 2, 3, 4: Custom / Imported / Smart Templates List */}
      {activeTab !== 'built-in' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search custom templates..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={orientationFilter}
                onChange={(e) => setOrientationFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none"
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
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        {tmpl.category}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{tmpl.orientation}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">{tmpl.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{tmpl.description}</p>
                    <p className="text-[10px] text-slate-400">{tmpl.elements.length} elements</p>
                  </div>

                  {/* Template Card Controls */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                    <Link
                      href={`/studio/editor/${tmpl.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs shadow-xs transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit in Studio</span>
                    </Link>

                    <button
                      onClick={() => handleDuplicate(tmpl.id)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleExport(tmpl.id)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                      title="Export Package"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(tmpl.id)}
                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900">No Custom Templates Found</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Import a Canva design background, generate with Smart Assistant, or create a layout from scratch.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/studio/import"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs"
                >
                  Import Design
                </Link>
                <Link
                  href="/studio/new"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs"
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

