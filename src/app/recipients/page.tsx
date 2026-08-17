'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, Calendar, Mail, FileSpreadsheet, Plus, ArrowRight } from 'lucide-react';
import { Recipient, EventItem } from '@/types';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { eventRepository } from '@/lib/storage/eventRepository';
import { PageHeader } from '@/components/ui/PageHeader';

import { getNormalizedCategory, getCategoryBadgeStyle, getCategoryDisplayTitle } from '@/lib/participantUtils';

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
            placeholder="Search by name, email, roll number, or course..."
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
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 border focus:outline-none max-w-xs truncate transition"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>
              All Events ({recipients.length})
            </option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id} style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div
        className="rounded-2xl border overflow-hidden shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {filteredRecipients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
              <thead
                className="border-b text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <tr>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Reg / Roll No</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Department / Program</th>
                  <th className="py-3 px-4">Role / Status</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {filteredRecipients.map((rec) => {
                  const cat = getNormalizedCategory(rec);
                  const style = getCategoryBadgeStyle(cat);
                  const display = getCategoryDisplayTitle(cat);

                  return (
                    <tr
                      key={rec.id}
                      className="transition"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="py-3 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>{rec.fullName}</td>
                      <td className="py-3 px-4 font-mono" style={{ color: 'var(--text-muted)' }}>{rec.registrationNumber || '-'}</td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          <span>{rec.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{rec.department || rec.course || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                          {cat === 'participant' ? 'Participated' : display}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: 'var(--surface-subtle)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <Calendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          <span className="truncate max-w-[150px]">{getEventName(rec.eventId)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/generate?eventId=${rec.eventId}`}
                          className="font-semibold flex items-center justify-end gap-1 transition"
                          style={{ color: 'var(--primary)' }}
                        >
                          <span>Issue Cert</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div
              className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No Recipients Found</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Add participants directly inside an Event or import a CSV roster.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-block text-white font-bold py-2.5 px-4 rounded-lg text-xs transition"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Go to Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
