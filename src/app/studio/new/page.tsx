'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, Check, Sparkles, Layout } from 'lucide-react';
import { CustomTemplate, Orientation, TemplateElement } from '@/types/template';
import { templateRepository } from '@/lib/storage/templateRepository';
import { PageHeader } from '@/components/ui/PageHeader';

type PresetType = 'minimal' | 'academic' | 'corporate' | 'achievement';

interface PresetOption {
  id: PresetType;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

const PRESETS: PresetOption[] = [
  {
    id: 'minimal',
    name: 'Minimal Preset',
    description: 'Clean modern typography with generous negative space and subtle geometric accents.',
    primaryColor: '#0F172A',
    secondaryColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  {
    id: 'academic',
    name: 'Academic Preset',
    description: 'Formal traditional layout with maroon & gold decorative borders suited for diplomas.',
    primaryColor: '#881337',
    secondaryColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  {
    id: 'corporate',
    name: 'Corporate Preset',
    description: 'Professional navy blue frame with structured sections for seals, logos and signatures.',
    primaryColor: '#1E3A8A',
    secondaryColor: '#0284C7',
    backgroundColor: '#F8FAFC',
  },
  {
    id: 'achievement',
    name: 'Achievement Preset',
    description: 'Bold vibrant styling for hackathons, sports, and award competitions.',
    primaryColor: '#065F46',
    secondaryColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
];

export default function CreateFromScratchPage() {
  const router = useRouter();

  const [designName, setDesignName] = useState('Untitled Certificate');
  const [description, setDescription] = useState('Custom certificate design built from scratch');
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('minimal');

  const [primaryColor, setPrimaryColor] = useState('#0F172A');
  const [secondaryColor, setSecondaryColor] = useState('#2563EB');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  const handleSelectPreset = (preset: PresetOption) => {
    setSelectedPreset(preset.id);
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setBackgroundColor(preset.backgroundColor);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const isLandscape = orientation === 'landscape';
    const width = isLandscape ? 842 : 595;
    const height = isLandscape ? 595 : 842;

    const initialElements: TemplateElement[] = [
      // Decorative Border / Frame
      {
        id: 'el-border-outer',
        type: 'shape',
        name: 'Outer Border Frame',
        x: 20,
        y: 20,
        width: width - 40,
        height: height - 40,
        rotation: 0,
        zIndex: 1,
        visible: true,
        locked: false,
        opacity: 1,
        shapeStyle: {
          shapeType: 'rectangle',
          fill: 'transparent',
          stroke: primaryColor,
          strokeWidth: 3,
        },
      },
      {
        id: 'el-border-inner',
        type: 'shape',
        name: 'Inner Border Line',
        x: 28,
        y: 28,
        width: width - 56,
        height: height - 56,
        rotation: 0,
        zIndex: 2,
        visible: true,
        locked: false,
        opacity: 1,
        shapeStyle: {
          shapeType: 'rectangle',
          fill: 'transparent',
          stroke: secondaryColor,
          strokeWidth: 1,
        },
      },
      // Title
      {
        id: 'el-title',
        type: 'text',
        name: 'Certificate Header',
        x: width / 2 - 250,
        y: 70,
        width: 500,
        height: 45,
        rotation: 0,
        zIndex: 3,
        visible: true,
        locked: false,
        opacity: 1,
        textValue: 'CERTIFICATE OF ACHIEVEMENT',
        textStyle: {
          fontSize: 26,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fontStyle: 'normal',
          fill: primaryColor,
          align: 'center',
          letterSpacing: 2,
        },
      },
      // Subtitle
      {
        id: 'el-subtitle',
        type: 'text',
        name: 'Presentation Text',
        x: width / 2 - 200,
        y: 130,
        width: 400,
        height: 25,
        rotation: 0,
        zIndex: 4,
        visible: true,
        locked: false,
        opacity: 1,
        textValue: 'THIS IS PROUDLY PRESENTED TO',
        textStyle: {
          fontSize: 12,
          fontFamily: 'Helvetica',
          fontWeight: 'normal',
          fontStyle: 'normal',
          fill: '#64748B',
          align: 'center',
          letterSpacing: 1.5,
        },
      },
      // Recipient Name Dynamic Placeholder
      {
        id: 'el-rec-name',
        type: 'dynamic-text',
        name: 'Recipient Full Name',
        x: width / 2 - 275,
        y: 175,
        width: 550,
        height: 50,
        rotation: 0,
        zIndex: 5,
        visible: true,
        locked: false,
        opacity: 1,
        dynamicBinding: '{{recipient.name}}',
        textStyle: {
          fontSize: 34,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fontStyle: 'normal',
          fill: primaryColor,
          align: 'center',
        },
      },
      // Divider Line
      {
        id: 'el-divider',
        type: 'shape',
        name: 'Accent Line',
        x: width / 2 - 120,
        y: 235,
        width: 240,
        height: 2,
        rotation: 0,
        zIndex: 6,
        visible: true,
        locked: false,
        opacity: 1,
        shapeStyle: {
          shapeType: 'line',
          fill: secondaryColor,
          stroke: secondaryColor,
          strokeWidth: 2,
        },
      },
      // Achievement / Course Text
      {
        id: 'el-course-text',
        type: 'dynamic-text',
        name: 'Course / Achievement Detail',
        x: width / 2 - 300,
        y: 260,
        width: 600,
        height: 35,
        rotation: 0,
        zIndex: 7,
        visible: true,
        locked: false,
        opacity: 1,
        dynamicBinding: '{{event.name}}',
        textStyle: {
          fontSize: 16,
          fontFamily: 'Helvetica',
          fontWeight: 'normal',
          fontStyle: 'italic',
          fill: '#334155',
          align: 'center',
        },
      },
      // Signatory Name
      {
        id: 'el-sig-name',
        type: 'dynamic-text',
        name: 'Signatory Name',
        x: 80,
        y: height - 100,
        width: 240,
        height: 25,
        rotation: 0,
        zIndex: 8,
        visible: true,
        locked: false,
        opacity: 1,
        dynamicBinding: '{{signatory.name}}',
        textStyle: {
          fontSize: 14,
          fontFamily: 'Helvetica',
          fontWeight: 'bold',
          fontStyle: 'normal',
          fill: primaryColor,
          align: 'center',
        },
      },
      // Signatory Designation
      {
        id: 'el-sig-desig',
        type: 'dynamic-text',
        name: 'Signatory Designation',
        x: 80,
        y: height - 75,
        width: 240,
        height: 20,
        rotation: 0,
        zIndex: 9,
        visible: true,
        locked: false,
        opacity: 1,
        dynamicBinding: '{{signatory.designation}}',
        textStyle: {
          fontSize: 11,
          fontFamily: 'Helvetica',
          fontWeight: 'normal',
          fontStyle: 'normal',
          fill: '#64748B',
          align: 'center',
        },
      },
      // Verification QR Code
      {
        id: 'el-qr',
        type: 'qr',
        name: 'Verification QR Code',
        x: width - 150,
        y: height - 140,
        width: 85,
        height: 85,
        rotation: 0,
        zIndex: 10,
        visible: true,
        locked: false,
        opacity: 1,
        qrStyle: {
          size: 85,
          fgColor: primaryColor,
          bgColor: backgroundColor,
          displayCodeLabel: true,
        },
      },
    ];

    const newTemplate: CustomTemplate = {
      id: `tmpl-scratch-${Date.now()}`,
      name: designName || 'Untitled Custom Certificate',
      description,
      category: 'Custom',
      orientation,
      width,
      height,
      backgroundColor,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: initialElements,
    };

    await templateRepository.save(newTemplate);
    router.push(`/studio/editor/${newTemplate.id}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Create Blank Certificate Design"
        description="Set up canvas dimensions, color palette, and layout orientation before opening Studio Workspace."
        icon={PlusCircle}
        breadcrumbs={[
          { label: 'Certificate Studio', href: '/studio' },
          { label: 'Create Blank Design' },
        ]}
      />

      <form onSubmit={handleCreate} className="space-y-8">
        {/* Step 1: Design Meta Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
            1. Design Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Design Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="e.g. Annual Excellence Award 2026"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of certificate purpose..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Canvas Orientation */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
            2. Canvas Orientation (A4 Standard)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setOrientation('landscape')}
              className={`p-5 rounded-2xl border cursor-pointer transition space-y-3 flex items-center gap-4 ${
                orientation === 'landscape'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-16 h-12 bg-slate-200 border-2 border-slate-400 rounded-md shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-600">
                842 x 595
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">A4 Landscape</h3>
                  {orientation === 'landscape' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500">Recommended standard for awards, diplomas & participation.</p>
              </div>
            </div>

            <div
              onClick={() => setOrientation('portrait')}
              className={`p-5 rounded-2xl border cursor-pointer transition space-y-3 flex items-center gap-4 ${
                orientation === 'portrait'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-12 h-16 bg-slate-200 border-2 border-slate-400 rounded-md shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-600">
                595 x 842
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">A4 Portrait</h3>
                  {orientation === 'portrait' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500">Suited for vertical accreditations, transcripts & badges.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Presets & Color Themes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
            3. Choose Starting Theme Preset
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 ${
                  selectedPreset === preset.id
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">{preset.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-inner inline-block"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-inner inline-block"
                      style={{ backgroundColor: preset.secondaryColor }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{preset.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Secondary Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Background Canvas Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/studio"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return to Studio</span>
          </Link>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Design & Open Studio Workspace</span>
          </button>
        </div>
      </form>
    </div>
  );
}
