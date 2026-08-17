'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Building2,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { eventRepository } from '@/lib/storage/eventRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { CertificateRecord, EventItem } from '@/types';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    const allEvents = eventRepository.getAll();
    const allRecipients = recipientRepository.getAll();
    const allCerts = certificateRepository.getAll();
    const org = organizationRepository.get();

    setEvents(allEvents);
    setTotalRecipients(allRecipients.length);
    setCertificates(allCerts);
    setOrgName(org.name);
  }, []);

  const validCertsCount = certificates.filter((c) => c.status === 'Valid').length;
  const revokedCertsCount = certificates.filter((c) => c.status === 'Revoked').length;

  const recentEvents = events.slice(0, 3);
  const recentCertificates = certificates.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={orgName || 'ABC Engineering College'}
        description="Overview of active programs, student rosters, and certificate credentials."
        icon={Building2}
        action={
          <div className="flex items-center gap-2.5">
            <Link
              href="/events/new"
              className="flex items-center gap-2 text-xs font-semibold py-2 px-3.5 rounded-xl border transition-all"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <PlusCircle className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              <span>Create Event</span>
            </Link>

            <Link
              href="/generate"
              className="flex items-center gap-2 text-xs font-bold text-white py-2 px-3.5 rounded-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-primary)';
                e.currentTarget.style.filter = 'brightness(1.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.filter = '';
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Certificates</span>
            </Link>
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Events"      value={events.length}       icon={Calendar}    color="blue" />
        <MetricCard label="Recipients"        value={totalRecipients}     icon={Users}       color="teal" />
        <MetricCard label="Certificates"      value={certificates.length} icon={FileCheck}   color="indigo" />
        <MetricCard label="Valid Credentials" value={validCertsCount}     icon={ShieldCheck} color="emerald" />
        <MetricCard label="Revoked Records"   value={revokedCertsCount}   icon={ShieldAlert} color="rose" />
      </div>

      {/* Quick Actions */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--text-muted)' }}>
          QUICK ACTIONS
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { href: '/events/new',  icon: PlusCircle,    label: 'New Event',          color: 'var(--primary)' },
            { href: '/templates',   icon: FileSpreadsheet, label: 'Templates',         color: 'var(--info)' },
            { href: '/certificates', icon: FileCheck,    label: 'Audit History',      color: 'var(--warning)' },
            { href: '/studio',      icon: Layers,        label: 'Certificate Studio', color: 'var(--success)' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-medium"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                  e.currentTarget.style.borderColor = 'var(--primary-border)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Recent Events ── */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Recent Programs & Workshops
            </h2>
            <Link
              href="/events"
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentEvents.length > 0 ? (
              recentEvents.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="group rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                        style={{
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          borderColor: 'var(--primary-border)',
                        }}
                      >
                        {evt.eventType}
                      </span>
                      <StatusBadge status={evt.status} />
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {evt.startDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {evt.name}
                    </h3>
                    <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                      {evt.description}
                    </p>
                  </div>

                  <Link
                    href={`/events/${evt.id}`}
                    className="shrink-0 text-xs font-semibold py-1.5 px-3.5 rounded-xl border transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                      e.currentTarget.style.borderColor = 'var(--primary-border)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    Manage →
                  </Link>
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="No Active Events Found"
                description="Create your first workshop or academic program to begin managing rosters and issuing certificates."
                action={
                  <Link
                    href="/events/new"
                    className="inline-flex items-center gap-2 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all"
                    style={{
                      backgroundColor: 'var(--primary)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary)';
                    }}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create Event</span>
                  </Link>
                }
              />
            )}
          </div>
        </div>

        {/* ── Right: Recent Certificates ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Issued Credentials
            </h2>
            <Link
              href="/certificates"
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
            >
              <span>History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {recentCertificates.length > 0 ? (
              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {recentCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs transition-colors"
                    style={{ '--border-subtle': 'var(--border)' } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {cert.recipientSnapshot.fullName}
                      </p>
                      <p
                        className="text-[10px] font-mono mt-0.5 truncate"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {cert.certificateCode}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <StatusBadge status={cert.status} />
                      <Link
                        href={`/certificates/${cert.id}`}
                        className="block text-[10px] font-semibold transition-colors"
                        style={{ color: 'var(--primary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-hover)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-xs text-center py-10"
                style={{ color: 'var(--text-muted)' }}
              >
                No certificates generated yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
