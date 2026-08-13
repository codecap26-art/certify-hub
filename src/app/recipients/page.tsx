'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, Calendar, Mail, FileSpreadsheet, Plus, ArrowRight } from 'lucide-react';
import { Recipient, EventItem } from '@/types';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { eventRepository } from '@/lib/storage/eventRepository';
import { PageHeader } from '@/components/ui/PageHeader';

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');

  useEffect(() => {
    setRecipients(recipientRepository.getAll());
    setEvents(eventRepository.getAll());
  }, []);

  const filteredRecipients = recipients.filter((r) => {
    const matchesEvent = selectedEventId === 'ALL' || r.eventId === selectedEventId;
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.course && r.course.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesEvent && matchesSearch;
  });

  const getEventName = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    return ev ? ev.name : 'General Roster';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        title="Recipients & Participants Management"
        description="View and manage participant rosters across all registered organization events."
        icon={Users}
        breadcrumbs={[{ label: 'Recipients' }]}
        action={
          <Link
            href="/events"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Event Rosters</span>
          </Link>
        }
      />

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, roll number, or course..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2 focus:outline-none max-w-xs truncate"
          >
            <option value="ALL">All Events ({recipients.length})</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredRecipients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Reg / Roll No</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Department / Program</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecipients.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{rec.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{rec.registrationNumber || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{rec.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{rec.department || rec.course || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[150px]">{getEventName(rec.eventId)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/generate?eventId=${rec.eventId}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-end gap-1"
                      >
                        <span>Issue Cert</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900">No Recipients Found</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add participants directly inside an Event or import a CSV roster.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs"
            >
              Go to Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
