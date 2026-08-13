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
    <div className="space-y-8">
      {/* Standardized Page Header */}
      <PageHeader
        title={orgName || 'ABC Engineering College'}
        description="Overview of active programs, student rosters, and certificate credentials."
        icon={Building2}
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/events/new"
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-lg border border-slate-200 shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Create Event</span>
            </Link>

            <Link
              href="/generate"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Certificates</span>
            </Link>
          </div>
        }
      />

      {/* KPI Metric Cards Grid with Single-Run Viewport Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Events" value={events.length} icon={Calendar} color="blue" />
        <MetricCard label="Recipients" value={totalRecipients} icon={Users} color="teal" />
        <MetricCard label="Certificates" value={certificates.length} icon={FileCheck} color="indigo" />
        <MetricCard label="Valid Credentials" value={validCertsCount} icon={ShieldCheck} color="emerald" />
        <MetricCard label="Revoked Records" value={revokedCertsCount} icon={ShieldAlert} color="rose" />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-700">Quick Actions</span>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            href="/events/new"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition font-medium"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>New Event</span>
          </Link>
          <Link
            href="/organization"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition font-medium"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Organization Branding</span>
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Showcase Templates</span>
          </Link>
          <Link
            href="/certificates"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition font-medium"
          >
            <FileCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Audit History</span>
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Programs & Workshops</h2>
            <Link href="/events" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((evt) => (
                <motion.div
                  key={evt.id}
                  whileHover={{ x: 2, transition: { duration: 0.15 } }}
                  className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {evt.eventType}
                      </span>
                      <StatusBadge status={evt.status} />
                      <span className="text-xs text-slate-500">{evt.startDate}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{evt.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{evt.description}</p>
                  </div>

                  <Link
                    href={`/events/${evt.id}`}
                    className="shrink-0 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-lg border border-slate-200 transition"
                  >
                    Manage Event
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
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg text-xs shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Event</span>
                  </Link>
                }
              />
            )}
          </div>
        </div>

        {/* Right Column: Recently Issued Certificates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Issued Credentials</h2>
            <Link href="/certificates" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            {recentCertificates.length > 0 ? (
              recentCertificates.map((cert) => (
                <div key={cert.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{cert.recipientSnapshot.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{cert.certificateCode}</p>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={cert.status} />
                    <Link
                      href={`/certificates/${cert.id}`}
                      className="block text-[10px] font-semibold text-blue-600 hover:underline mt-1"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No certificates generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
