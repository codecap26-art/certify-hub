'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, PlusCircle } from 'lucide-react';
import { eventRepository } from '@/lib/storage/eventRepository';
import { EventItem } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';

const eventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  eventType: z.enum(['Workshop', 'Course', 'Internship', 'Competition', 'Seminar', 'Conference'] as const),
  description: z.string().min(5, 'Description is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(2, 'Location is required'),
  certificateType: z.enum(['Completion', 'Participation', 'Excellence', 'Merit', 'Achievement'] as const),
  coordinatorName: z.string().min(2, 'Coordinator name is required'),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventType: 'Workshop',
      certificateType: 'Participation',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: EventFormData) => {
    const newEvent: EventItem = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    eventRepository.save(newEvent);
    router.push(`/events/${newEvent.id}`);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <PageHeader
        title="Create New Event or Workshop"
        description="Configure program parameters, dates, coordinator, and default certificate classification."
        icon={Calendar}
        breadcrumbs={[{ label: 'Events', href: '/events' }, { label: 'Create New' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="evt-name">
              Event / Program Name *
            </label>
            <input
              id="evt-name"
              {...register('name')}
              placeholder="e.g. React 19 & Next.js App Router Workshop 2026"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="evt-type">
              Event Type *
            </label>
            <select
              id="evt-type"
              {...register('eventType')}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Workshop">Workshop</option>
              <option value="Course">Course</option>
              <option value="Internship">Internship</option>
              <option value="Competition">Competition</option>
              <option value="Seminar">Seminar</option>
              <option value="Conference">Conference</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cert-type">
              Certificate Title Type *
            </label>
            <select
              id="cert-type"
              {...register('certificateType')}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Participation">Certificate of Participation</option>
              <option value="Completion">Certificate of Completion</option>
              <option value="Excellence">Certificate of Excellence</option>
              <option value="Merit">Certificate of Merit</option>
              <option value="Achievement">Certificate of Achievement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="start-date">
              Start Date *
            </label>
            <input
              id="start-date"
              type="date"
              {...register('startDate')}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="end-date">
              End Date *
            </label>
            <input
              id="end-date"
              type="date"
              {...register('endDate')}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="location">
              Venue / Location *
            </label>
            <input
              id="location"
              {...register('location')}
              placeholder="Auditorium Hall B / Online"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="coord-name">
              Program Coordinator Name *
            </label>
            <input
              id="coord-name"
              {...register('coordinatorName')}
              placeholder="Prof. K. Ramanathan"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.coordinatorName && <p className="text-xs text-rose-600 mt-1">{errors.coordinatorName.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="description">
              Event Description *
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="Brief description of event goals and syllabus covered..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => router.push('/events')}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-xs transition text-xs disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event & Continue</span>
          </button>
        </div>
      </form>
    </div>
  );
}
