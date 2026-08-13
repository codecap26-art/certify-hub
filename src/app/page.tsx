'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  ArrowRight,
  CheckCircle2,
  Layers,
  Building2,
  Users,
  Zap,
} from 'lucide-react';
import { APP_NAME, TEMPLATES } from '@/lib/constants';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';
import { demoOrganization } from '@/lib/demo-data';
import { CertificateRecord, TemplateId } from '@/types';

const heroCertificate: CertificateRecord = {
  id: 'cert-hero-demo',
  certificateCode: 'ABC-REACT-2026-HERO',
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

export default function LandingPage() {
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<TemplateId>('modern-blue');

  return (
    <div className="space-y-24 py-8">
      {/* HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Client-Side PDF & Verification Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
        >
          Create professional certificates{' '}
          <span className="text-blue-600">in minutes.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
          className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Design, generate, download, and verify certificates for workshops, courses, events, and achievements — fast, accessible, and zero server configuration required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition text-sm"
          >
            <span>Open Demo Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/verify"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-8 rounded-xl border border-slate-200 shadow-xs transition text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Verify Certificate</span>
          </Link>
        </motion.div>

        {/* HERO INTERACTIVE CERTIFICATE MOCKUP */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4, ease: 'easeOut' }}
          className="pt-6"
        >
          <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-2">
              <span className="text-xs font-bold text-slate-700">Live Certificate Code Preview</span>
              <div className="flex gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActivePreviewTemplate(t.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                      activePreviewTemplate === t.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl border border-slate-200">
              <CertificateRenderer certificate={heroCertificate} templateId={activePreviewTemplate} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Four Simple Steps to Issued Credentials</h2>
          <p className="text-slate-600 text-xs sm:text-sm">From student roster to verifiable PDF download bundle in minutes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Configure Organization',
              desc: 'Set up institution name, address, default footer, and upload logo & signature branding images.',
              icon: Building2,
            },
            {
              step: '02',
              title: 'Create Event',
              desc: 'Configure workshop or course parameters, dates, coordinator, and certificate title.',
              icon: Users,
            },
            {
              step: '03',
              title: 'Add Recipients',
              desc: 'Import participant rosters manually or via CSV with header mapping and duplicate warnings.',
              icon: Layers,
            },
            {
              step: '04',
              title: 'Generate Certificates',
              desc: 'Generate individual PDFs or bulk ZIP packages with embedded verification QR code tokens.',
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-blue-300 transition shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {item.step}
                  </span>
                  <Icon className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="space-y-8">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Built for Colleges, Universities & Training Providers</h2>
          <p className="text-slate-600 text-xs sm:text-sm">High-speed client-side architecture with zero database dependencies</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Bulk CSV Import Engine</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Import rosters with header mapping, automatic duplicate detection, and valid/invalid row validation summaries.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">QR Code Verification</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Embedded vector QR code tokens linking directly to client-side verification lookup pages.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Bulk ZIP Packages</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Bundle hundreds of generated PDF certificates into a single organized ZIP file instantly in the browser.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Branding & Signatures</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Upload organization logos and authorized signatory signatures with automatic canvas compression.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Revocation Audit Trail</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Locally revoke credentials with mandatory audit reasons while maintaining historical records.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="p-2.5 w-fit rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Local Storage Repository</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Versioned client repository architecture (`certifyhub:v1:`) with automatic quota-exceeded exception handling.
            </p>
          </div>
        </div>
      </section>

      {/* TEMPLATE SHOWCASE SECTION */}
      <section className="space-y-6 bg-white border border-slate-200 p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">4 Original Code-Based Templates</h2>
            <p className="text-slate-600 text-xs mt-0.5">Rendered with crisp vector elements and dynamic typography</p>
          </div>
          <Link href="/templates" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>Explore All Templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((tmpl) => (
            <div key={tmpl.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-slate-300 transition">
              <div className="h-32 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner" style={{ backgroundColor: tmpl.theme.cardBg, color: tmpl.theme.primary }}>
                {tmpl.name}
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">{tmpl.name}</h3>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{tmpl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-gradient-to-r from-blue-50 via-teal-50 to-blue-50 border border-blue-200 p-10 rounded-3xl text-center space-y-5 shadow-xs">
        <h2 className="text-3xl font-extrabold text-slate-900">Ready to Generate Official Certificates?</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Open the live interactive demo dashboard to test event creation, CSV import, template rendering, and bulk PDF download.
        </p>

        <div className="flex justify-center pt-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition text-sm"
          >
            <span>Launch Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 pt-8 pb-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">{APP_NAME} — Frontend Prototype</p>
        <p>Built with Next.js App Router, TypeScript, Tailwind CSS, @react-pdf/renderer, and LocalStorage repository pattern.</p>
        <p className="text-[10px] text-slate-400">Verification and storage operate within browser environment for demonstration purposes.</p>
      </footer>
    </div>
  );
}
