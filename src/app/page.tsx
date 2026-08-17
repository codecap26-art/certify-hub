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
    <div className="space-y-16 py-8" style={{ color: 'var(--text-primary)' }}>
      {/* 1. HERO SECTION WITH DYNAMIC THEME GLOW & GLASSMORPHISM */}
      <section
        className="relative text-center max-w-5xl mx-auto space-y-8 pt-6 rounded-3xl p-6 sm:p-10 border transition-all duration-300 backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 0 80px -20px var(--primary-ring), 0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        {/* Ambient Top Glow Sphere */}
        <div
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--primary)' }}
        />

        {/* Glowing Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold shadow-lg transition-all"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            borderColor: 'var(--primary-border)',
            color: 'var(--primary)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--secondary)' }} />
          <span>Institutional Certificate & Credential Engine</span>
        </motion.div>

        {/* Gradient Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15]"
          style={{ color: 'var(--text-primary)' }}
        >
          Design & Issue Credentials with{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            }}
          >
            Institutional Elegance.
          </span>
        </motion.h1>

        {/* Subtitle with Role Badges */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-normal"
          style={{ color: 'var(--text-secondary)' }}
        >
          Auto-categorize certificates for{' '}
          <strong className="px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: 'var(--winner-soft)', color: 'var(--winner-text)', border: '1px solid var(--winner-border)' }}>
            Winners 🏆
          </strong>
          ,{' '}
          <strong className="px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: 'var(--runner-soft)', color: 'var(--runner-text)', border: '1px solid var(--runner-border)' }}>
            Runners 🥈
          </strong>
          , and{' '}
          <strong className="px-2 py-0.5 rounded-md font-bold" style={{ backgroundColor: 'var(--participant-soft)', color: 'var(--participant-text)', border: '1px solid var(--participant-border)' }}>
            Participants 📜
          </strong>{' '}
          with zero backend latency and instant ZIP package exports.
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition text-xs sm:text-sm hover:brightness-110"
            style={{
              backgroundColor: 'var(--primary)',
              boxShadow: '0 8px 24px -4px var(--primary-ring)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Batch Generator Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/studio"
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-3.5 px-8 rounded-xl border transition text-xs sm:text-sm"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <Layout className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
            <span>Explore Visual Canvas Studio</span>
          </Link>

          <Link
            href="/verify"
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-xl border text-xs sm:text-sm transition"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
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
          <div
            className="border p-4 sm:p-6 rounded-3xl shadow-2xl space-y-4 text-left backdrop-blur-md"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border-strong)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 px-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Live Role Preview:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentRoleBadge.bg} ${currentRoleBadge.text} ${currentRoleBadge.border}`}>
                  {currentRoleBadge.icon} {currentRoleBadge.label} Certificate
                </span>
              </div>

              {/* Role Category Selector Tabs */}
              <div
                className="flex items-center gap-1.5 p-1 rounded-xl border"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('winner');
                    setActivePreviewTemplateId('tmpl-competition-winner');
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: selectedRoleTab === 'winner' ? 'var(--winner-soft)' : 'transparent',
                    color: selectedRoleTab === 'winner' ? 'var(--winner-text)' : 'var(--text-muted)',
                    border: selectedRoleTab === 'winner' ? '1px solid var(--winner-border)' : '1px solid transparent',
                  }}
                >
                  <span>🏆 Winner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('runner');
                    setActivePreviewTemplateId('tmpl-institutional-appreciation');
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: selectedRoleTab === 'runner' ? 'var(--runner-soft)' : 'transparent',
                    color: selectedRoleTab === 'runner' ? 'var(--runner-text)' : 'var(--text-muted)',
                    border: selectedRoleTab === 'runner' ? '1px solid var(--runner-border)' : '1px solid transparent',
                  }}
                >
                  <span>🥈 Runner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab('participant');
                    setActivePreviewTemplateId('tmpl-institutional-appreciation');
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: selectedRoleTab === 'participant' ? 'var(--participant-soft)' : 'transparent',
                    color: selectedRoleTab === 'participant' ? 'var(--participant-text)' : 'var(--text-muted)',
                    border: selectedRoleTab === 'participant' ? '1px solid var(--participant-border)' : '1px solid transparent',
                  }}
                >
                  <span>📜 Participated</span>
                </button>
              </div>
            </div>

            {/* Certificate Renderer Box */}
            <div
              className="p-2 sm:p-4 rounded-2xl border flex justify-center overflow-x-auto"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
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
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--primary-border)',
              color: 'var(--primary)',
            }}
          >
            <Palette className="w-3.5 h-3.5" style={{ color: 'var(--secondary)' }} />
            <span>Interactive Color Theme Engine</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            }}
          >
            Custom Visual Theme Palettes
          </h2>
          <p className="text-xs sm:text-sm max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Choose from 5 curated color themes designed for modern institutional branding. Click any palette below to transform the site theme live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {THEME_CONFIGS.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -3 }}
              onClick={() => setTheme(t.id)}
              className="p-4 rounded-2xl border cursor-pointer transition space-y-3 shadow-md"
              style={{
                backgroundColor: theme === t.id ? 'var(--surface-elevated)' : 'var(--surface)',
                borderColor: theme === t.id ? 'var(--primary)' : 'var(--border)',
                boxShadow: theme === t.id ? '0 0 0 1px var(--primary), 0 8px 20px -4px var(--primary-ring)' : 'var(--shadow-xs)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`w-6 h-6 rounded-full ${t.previewBg} ring-2 ring-black/40 shadow-sm shrink-0`} />
                {theme === t.id ? (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      borderColor: 'var(--primary-border)',
                      color: 'var(--primary)',
                    }}
                  >
                    <Check className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{t.badge}</span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{t.name}</h3>
                <p className="text-[11px] line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. REAL-TIME STATS & METRICS BAR */}
      <section
        className="border rounded-3xl p-7 sm:p-10 max-w-5xl mx-auto"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 4px 40px -12px var(--primary-ring)',
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold" style={{ color: 'var(--secondary)' }}>100%</p>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Client-Side Architecture</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Zero backend server requirement</p>
          </div>
          <div className="space-y-1 pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>⚡ Instant</p>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Role Auto-Updating</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Winner, Runner & Participated</p>
          </div>
          <div className="space-y-1 pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold" style={{ color: 'var(--winner-text)' }}>📦 1,000+</p>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Bulk ZIP Engine</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>High-speed client PDF bundling</p>
          </div>
          <div className="space-y-1 pt-4 sm:pt-0">
            <p className="text-3xl font-extrabold" style={{ color: 'var(--secondary)' }}>🔒 QR Tokens</p>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Cryptographic Verification</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Embedded code validation</p>
          </div>
        </div>
      </section>

      {/* 4. FOUR STEP WORKFLOW */}
      <section id="how-it-works" className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>Simple Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Four Steps to Issued Credentials</h2>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>From student roster import to verifiable ZIP download packages</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Configure Organization',
              desc: 'Set up institution name, address, signatories, accreditation, and branding logos.',
              icon: Building2,
              color: 'var(--primary)',
              bgColor: 'var(--primary-light)',
              borderColor: 'var(--primary-border)',
            },
            {
              step: '02',
              title: 'Create Event Program',
              desc: 'Configure workshop dates, event type, coordinator, and certificate headers.',
              icon: Users,
              color: 'var(--secondary)',
              bgColor: 'var(--participant-soft)',
              borderColor: 'var(--participant-border)',
            },
            {
              step: '03',
              title: 'Import Recipient Roster',
              desc: 'Import rosters manually or via CSV with automatic Winner, Runner & Participated role detection.',
              icon: Layers,
              color: 'var(--winner-text)',
              bgColor: 'var(--winner-soft)',
              borderColor: 'var(--winner-border)',
            },
            {
              step: '04',
              title: 'Generate & Download ZIP',
              desc: 'Auto-update category templates and export print-quality PDF packages with QR codes.',
              icon: ShieldCheck,
              color: 'var(--runner-text)',
              bgColor: 'var(--runner-soft)',
              borderColor: 'var(--runner-border)',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="p-6 rounded-2xl space-y-3 transition border shadow-md"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-9 h-9 rounded-xl border flex items-center justify-center font-extrabold text-xs"
                    style={{
                      backgroundColor: item.bgColor,
                      borderColor: item.borderColor,
                      color: item.color,
                    }}
                  >
                    {item.step}
                  </span>
                  <Icon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. BUILT-IN TEMPLATES SHOWCASE */}
      <section
        className="space-y-6 p-7 sm:p-10 rounded-3xl max-w-5xl mx-auto border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 4px 40px -12px var(--primary-ring)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Official Code-Native Vector Templates</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Rendered with crisp vector elements and dynamic bindings</p>
          </div>
          <Link href="/templates" className="text-xs font-bold hover:underline flex items-center gap-1" style={{ color: 'var(--secondary)' }}>
            <span>Explore Template Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="border rounded-2xl p-4 space-y-3 transition shadow-xs"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div
                className="h-28 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                style={{ backgroundColor: tmpl.theme.cardBg, color: tmpl.theme.primary }}
              >
                {tmpl.name}
              </div>
              <div>
                <h3 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</h3>
                <p className="text-[11px] line-clamp-2 mt-1" style={{ color: 'var(--text-muted)' }}>{tmpl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section
        className="border text-white p-10 sm:p-14 rounded-3xl text-center space-y-6 max-w-5xl mx-auto relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--surface-elevated) 0%, var(--surface) 100%)',
          borderColor: 'var(--primary-border)',
          boxShadow: '0 0 80px -20px var(--primary-ring)',
        }}
      >
        <div
          className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: 'var(--primary)' }}
        />

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Ready to Issue Official Certificates?
        </h2>
        <p className="text-xs sm:text-sm max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Open the batch generator wizard to create events, import CSV recipients, auto-map Winner/Runner/Participated templates, and generate PDF packages instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
          <Link
            href="/generate"
            className="flex items-center justify-center gap-2 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition text-sm hover:brightness-110"
            style={{
              backgroundColor: 'var(--primary)',
              boxShadow: '0 8px 24px -4px var(--primary-ring)',
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Launch Batch Generator</span>
          </Link>

          <Link
            href="/certificates/new"
            className="flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-xl border transition text-sm"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <Award className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
            <span>Create Single Certificate</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t pt-8 pb-6 max-w-5xl mx-auto" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Award className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{APP_NAME}</span>
            <span style={{ color: 'var(--border-strong)' }}>—</span>
            <span style={{ color: 'var(--text-muted)' }}>Client-Side Certificate Studio</span>
          </div>
          <div className="flex items-center gap-4" style={{ color: 'var(--text-muted)' }}>
            <span>Next.js 16</span>
            <span>·</span>
            <span>TypeScript</span>
            <span>·</span>
            <span>Tailwind CSS v4</span>
            <span>·</span>
            <span style={{ color: 'var(--text-secondary)' }}>All data stays local</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
