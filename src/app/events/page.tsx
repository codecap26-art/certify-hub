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
        <div>
          <p className="font-bold text-slate-900 text-xs">{evt.name}</p>
          <p className="text-[10px] text-slate-500 line-clamp-1">{evt.description}</p>
        </div>
      ),
    },
    {
      key: 'eventType',
      header: 'Type',
      sortable: true,
      render: (evt) => (
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full">
          {evt.eventType}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Date & Location',
      sortable: true,
      render: (evt) => (
        <div>
          <p className="text-xs text-slate-800 font-medium">{evt.startDate}</p>
          <p className="text-[10px] text-slate-500 line-clamp-1">{evt.location}</p>
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
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-teal-600" />
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
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Manage</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events & Academic Programs"
        description="Manage workshops, courses, hackathons, and internship programs."
        icon={Calendar}
        breadcrumbs={[{ label: 'Events' }]}
        action={
          <Link
            href="/events/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-xs transition"
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
