'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, PlusCircle, Users, Eye } from 'lucide-react';
import { eventRepository } from '@/lib/storage/eventRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { EventItem } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    setEvents(eventRepository.getAll());
  }, []);

  const columns: Column<EventItem>[] = [
    {
      key: 'name',
      header: 'Event / Program Name',
      sortable: true,
      render: (evt) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
            {evt.name}
          </p>
          <p className="text-[10px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
            {evt.description}
          </p>
        </div>
      ),
    },
    {
      key: 'eventType',
      header: 'Type',
      sortable: true,
      render: (evt) => (
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            borderColor: 'var(--primary-border)',
          }}
        >
          {evt.eventType}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Date & Location',
      sortable: true,
      render: (evt) => (
        <div className="space-y-0.5">
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {evt.startDate}
          </p>
          <p className="text-[10px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
            {evt.location}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (evt) => <StatusBadge status={evt.status} />,
    },
    {
      key: 'recipientsCount',
      header: 'Roster',
      render: (evt) => {
        const count = recipientRepository.getByEventId(evt.id).length;
        return (
          <span
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Users className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
            <span>{count}</span>
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (evt) => (
        <Link
          href={`/events/${evt.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-[11px] font-semibold py-1.5 px-2.5 rounded-lg border transition-all"
          style={{
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            borderColor: 'var(--primary-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-light)';
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.borderColor = 'var(--primary-border)';
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Manage</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events & Academic Programs"
        description="Manage workshops, courses, hackathons, and internship programs."
        icon={Calendar}
        breadcrumbs={[{ label: 'Events' }]}
        action={
          <Link
            href="/events/new"
            className="flex items-center gap-2 font-bold py-2 px-4 rounded-xl text-xs text-white transition-all"
            style={{
              backgroundColor: 'var(--primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              e.currentTarget.style.boxShadow = 'var(--shadow-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        }
      />

      <DataTable
        data={events}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search event name or coordinator..."
        filterKey="status"
        filterOptions={[
          { label: 'Active', value: 'Active' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Draft', value: 'Draft' },
        ]}
        onRowClick={(evt) => router.push(`/events/${evt.id}`)}
        emptyTitle="No Events Created"
        emptyDescription="Create your first workshop or academic program to begin adding student rosters."
      />
    </div>
  );
}
