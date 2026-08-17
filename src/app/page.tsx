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
  Palette,
  Check,
  Layout,
  Star,
  Globe,
} from 'lucide-react';
import { APP_NAME, TEMPLATES } from '@/lib/constants';
import { CertificateRenderer } from '@/components/templates/CertificateRenderer';
import { demoOrganization } from '@/lib/demo-data';
import { CertificateRecord, TemplateId } from '@/types';
import { useTheme, THEME_CONFIGS } from '@/context/ThemeContext';
import { getCategoryRoleBadge } from '@/lib/template/categoryTemplateUtils';

const winnerSampleCert: CertificateRecord = {
  id: 'cert-hero-winner',
  certificateCode: 'CERT-2026-WINNER-01',
  verificationToken: '550e8400-e29b-41d4-a716-446655440000',
  eventId: 'evt-hackathon-2026',
  recipientId: 'rec-subash-01',
  templateId: 'tmpl-competition-winner' as TemplateId,
  organizationSnapshot: demoOrganization,
  eventSnapshot: {
    id: 'evt-hackathon-2026',
    name: 'GLOBAL AI & SOFTWARE HACKATHON 2026',
    eventType: 'Hackathon',
    description: '48-Hour National AI & Full-Stack Development Challenge',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    location: 'Main Technology Auditorium',
    certificateType: 'Winner',
    coordinatorName: 'Dr. V. Ramanathan',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  recipientSnapshot: {
    id: 'rec-subash-01',
    eventId: 'evt-hackathon-2026',
    fullName: 'SUBASH P',
    email: 'subash@example.com',
    registrationNumber: '23CS101',
    department: 'Computer Science & Engineering',
    course: 'Artificial Intelligence & Systems',
    achievement: '1st Place Winner - Grand Hackathon Champion',
    category: 'winner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  status: 'Valid',
  generatedAt: new Date().toISOString(),
};

const runnerSampleCert: CertificateRecord = {
  ...winnerSampleCert,
  id: 'cert-hero-runner',
  certificateCode: 'CERT-2026-RUNNER-02',
  templateId: 'tmpl-institutional-appreciation' as TemplateId,
  recipientSnapshot: {
    ...winnerSampleCert.recipientSnapshot,
    fullName: 'ARUN KUMAR',
    registrationNumber: '23CS102',
    achievement: '2nd Place Runner Up',
    category: 'runner',
  },
};

const participantSampleCert: CertificateRecord = {
  ...winnerSampleCert,
  id: 'cert-hero-participant',
  certificateCode: 'CERT-2026-PART-03',
  templateId: 'tmpl-institutional-appreciation' as TemplateId,
  recipientSnapshot: {
    ...winnerSampleCert.recipientSnapshot,
    fullName: 'PRIYA SHARMA',
    registrationNumber: '23CS103',
    achievement: 'Participant',
    category: 'participant',
  },
};

export default function LandingPage() {
  const { theme, setTheme, activeThemeConfig } = useTheme();
  const [selectedRoleTab, setSelectedRoleTab] = useState<'winner' | 'runner' | 'participant'>('winner');
  const [activePreviewTemplateId, setActivePreviewTemplateId] = useState<string>('tmpl-competition-winner');

  const currentRoleCertificate =
    selectedRoleTab === 'winner'
      ? winnerSampleCert
      : selectedRoleTab === 'runner'
      ? runnerSampleCert
      : participantSampleCert;

  const currentRoleBadge = getCategoryRoleBadge(selectedRoleTab);

  return (
    <div className="space-y-16 py-8 text-slate-100">
      {/* 1. HERO SECTION WITH DARK VIOLET & SKY BLUE GLOW */}
      <section className="relative text-center max-w-5xl mx-auto space-y-8 pt-6 mesh-glow-bg rounded-3xl p-6 sm:p-10 border border-purple-500/20" style={{ boxShadow: '0 0 60px -20px rgba(139,92,246,0.3), 0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        {/* Glowing Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold shadow-lg shadow-purple-900/30"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Dark Violet & Sky Blue High-Vibrancy Certificate Engine</span>
        </motion.div>

        {/* Gradient Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.12]"
        >
          Design & Issue Credentials{' '}
          <span className="bg-gradient-to-r from-purple-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            in Dark Violet & Sky Blue.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal"
        >
          Auto-categorize templates for <strong className="text-amber-400">Winners 🏆</strong>, <strong className="text-purple-300">Runners 🥈</strong>, and <strong className="text-sky-300">Participants 📜</strong> with zero backend latency.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link
            href="/generate"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-purple-900/40 transition text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Batch Generator Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/studio"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-purple-300 font-bold py-3.5 px-8 rounded-xl border border-purple-500/30 shadow-md transition text-xs sm:text-sm"
          >
            <Layout className="w-4 h-4 text-sky-400" />
            <span>Explore Visual Canvas Studio</span>
          </Link>

          <Link
            href="/verify"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold py-3.5 px-6 rounded-xl border border-slate-700 text-xs sm:text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Verify Credential</span>
          </Link>
        </motion.div>

        {/* INTERACTIVE ROLE-BASED CERTIFICATE SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-6"
        >
          <div className="bg-[#131927]/90 border border-purple-500/30 p-4 sm:p-6 rounded-3xl shadow-2xl space-y-4 text-left backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-300">Live Role Preview:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentRoleBadge.bg} ${currentRoleBadge.text} ${currentRoleBadge.border}`}>
                  {currentRoleBadge.icon} {currentRoleBadge.label} Certificate
                </span>
              </div>

              {/* Role Category Selector Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('winner');
                    setActivePreviewTemplateId('tmpl-competition-winner');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedRoleTab === 'winner'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🏆 Winner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('runner');
                    setActivePreviewTemplateId('tmpl-institutional-appreciation');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedRoleTab === 'runner'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🥈 Runner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('participant');
                    setActivePreviewTemplateId('tmpl-institutional-appreciation');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedRoleTab === 'participant'
                      ? 'bg-sky-950/80 text-sky-300 border border-sky-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>📜 Participated</span>
                </button>
              </div>
            </div>

            {/* Certificate Renderer Box */}
            <div className="bg-[#0B0F19] p-2 sm:p-4 rounded-2xl border border-slate-800 flex justify-center overflow-x-auto">
              <CertificateRenderer
                key={`${selectedRoleTab}-${activePreviewTemplateId}`}
                certificate={currentRoleCertificate}
                templateId={activePreviewTemplateId as TemplateId}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. DYNAMIC COLOR THEME CUSTOMIZER SHOWCASE */}
      <section className="space-y-6 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            <span>Interactive Color Theme Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-300 to-sky-300 bg-clip-text text-transparent">
            Custom Visual Theme Palettes
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Choose from 5 curated color themes designed for modern institutional branding. Click any palette below to transform the site theme live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {THEME_CONFIGS.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -3 }}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition space-y-3 shadow-md ${
                theme === t.id
                  ? 'bg-purple-950/60 border-purple-400 ring-2 ring-purple-500/30 text-white'
                  : 'bg-[#131927] border-slate-800 hover:border-purple-500/40 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-6 h-6 rounded-full ${t.previewBg} ring-2 ring-slate-800 shadow-sm shrink-0`} />
                {theme === t.id ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-950 px-2 py-0.5 rounded-full border border-sky-500/40">
                    <Check className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-semibold">{t.badge}</span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-xs text-white">{t.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{t.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. REAL-TIME STATS & METRICS BAR */}
      <section className="bg-[#131927] border border-purple-500/20 rounded-3xl p-7 sm:p-10 max-w-5xl mx-auto" style={{ boxShadow: '0 4px 40px -12px rgba(139,92,246,0.2)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-sky-400">100%</p>
            <p className="text-xs font-bold text-white">Client-Side Architecture</p>
            <p className="text-[11px] text-slate-400">Zero backend server requirement</p>
          </div>
          <div className="space-y-1 pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold text-purple-400">⚡ Instant</p>
            <p className="text-xs font-bold text-white">Role Auto-Updating</p>
            <p className="text-[11px] text-slate-400">Winner, Runner & Participated</p>
          </div>
          <div className="space-y-1 pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold text-amber-400">📦 1,000+</p>
            <p className="text-xs font-bold text-white">Bulk ZIP Engine</p>
            <p className="text-[11px] text-slate-400">High-speed client PDF bundling</p>
          </div>
          <div className="space-y-1 pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold text-indigo-400">🔒 QR Tokens</p>
            <p className="text-xs font-bold text-white">Cryptographic Verification</p>
            <p className="text-[11px] text-slate-400">Embedded code validation</p>
          </div>
        </div>
      </section>

      {/* 4. FOUR STEP WORKFLOW */}
      <section id="how-it-works" className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Simple Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Four Steps to Issued Credentials</h2>
          <p className="text-slate-400 text-xs sm:text-sm">From student roster import to verifiable ZIP download packages</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Configure Organization',
              desc: 'Set up institution name, address, signatories, accreditation, and branding logos.',
              icon: Building2,
              color: 'text-purple-300 bg-purple-950/80 border-purple-500/40',
            },
            {
              step: '02',
              title: 'Create Event Program',
              desc: 'Configure workshop dates, event type, coordinator, and certificate headers.',
              icon: Users,
              color: 'text-sky-300 bg-sky-950/80 border-sky-500/40',
            },
            {
              step: '03',
              title: 'Import Recipient Roster',
              desc: 'Import rosters manually or via CSV with automatic Winner, Runner & Participated role detection.',
              icon: Layers,
              color: 'text-amber-300 bg-amber-950/80 border-amber-500/40',
            },
            {
              step: '04',
              title: 'Generate & Download ZIP',
              desc: 'Auto-update category templates and export print-quality PDF packages with QR codes.',
              icon: ShieldCheck,
              color: 'text-indigo-300 bg-indigo-950/80 border-indigo-500/40',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="bg-[#131927] border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-purple-500/40 transition shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className={`w-9 h-9 rounded-xl border flex items-center justify-center font-extrabold text-xs ${item.color}`}>
                    {item.step}
                  </span>
                  <Icon className="w-5 h-5 text-slate-500" />
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. BUILT-IN TEMPLATES SHOWCASE */}
      <section className="space-y-6 bg-[#131927] border border-purple-500/20 p-7 sm:p-10 rounded-3xl max-w-5xl mx-auto" style={{ boxShadow: '0 4px 40px -12px rgba(139,92,246,0.2)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Official Code-Native Vector Templates</h2>
            <p className="text-slate-400 text-xs mt-0.5">Rendered with crisp vector elements and dynamic bindings</p>
          </div>
          <Link href="/templates" className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <span>Explore Template Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((tmpl) => (
            <div key={tmpl.id} className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-purple-500/40 transition">
              <div
                className="h-28 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                style={{ backgroundColor: tmpl.theme.cardBg, color: tmpl.theme.primary }}
              >
                {tmpl.name}
              </div>
              <div>
                <h3 className="font-bold text-xs text-white">{tmpl.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{tmpl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 text-white p-10 sm:p-14 rounded-3xl text-center space-y-6 max-w-5xl mx-auto" style={{ boxShadow: '0 0 80px -20px rgba(139,92,246,0.4)' }}>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Issue Official Certificates?</h2>
        <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto leading-relaxed">
          Open the batch generator wizard to create events, import CSV recipients, auto-map Winner/Runner/Participated templates, and generate PDF packages instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Link
            href="/generate"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-sky-400 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition text-sm hover:brightness-110"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Launch Batch Generator</span>
          </Link>

          <Link
            href="/certificates/new"
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-6 rounded-xl border border-slate-600 transition text-sm"
          >
            <Award className="w-4 h-4 text-sky-400" />
            <span>Create Single Certificate</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/60 pt-8 pb-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-sky-500 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-300">{APP_NAME}</span>
            <span className="text-slate-600">—</span>
            <span className="text-slate-500">Client-Side Certificate Studio</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Next.js 16</span>
            <span>·</span>
            <span>TypeScript</span>
            <span>·</span>
            <span>Tailwind CSS v4</span>
            <span>·</span>
            <span className="text-slate-700">All data stays local</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
