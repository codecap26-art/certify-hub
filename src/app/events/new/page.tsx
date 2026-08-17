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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 rounded-2xl space-y-6 border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="evt-name">
              Event / Program Name *
            </label>
            <input
              id="evt-name"
              {...register('name')}
              placeholder="e.g. React 19 & Next.js App Router Workshop 2026"
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="evt-type">
              Event Type *
            </label>
            <select
              id="evt-type"
              {...register('eventType')}
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Workshop" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Workshop</option>
              <option value="Course" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Course</option>
              <option value="Internship" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Internship</option>
              <option value="Competition" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Competition</option>
              <option value="Seminar" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Seminar</option>
              <option value="Conference" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Conference</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="cert-type">
              Certificate Title Type *
            </label>
            <select
              id="cert-type"
              {...register('certificateType')}
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Participation" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Certificate of Participation</option>
              <option value="Completion" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Certificate of Completion</option>
              <option value="Excellence" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Certificate of Excellence</option>
              <option value="Merit" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Certificate of Merit</option>
              <option value="Achievement" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Certificate of Achievement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="start-date">
              Start Date *
            </label>
            <input
              id="start-date"
              type="date"
              {...register('startDate')}
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="end-date">
              End Date *
            </label>
            <input
              id="end-date"
              type="date"
              {...register('endDate')}
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="location">
              Venue / Location *
            </label>
            <input
              id="location"
              {...register('location')}
              placeholder="Auditorium Hall B / Online"
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="coord-name">
              Program Coordinator Name *
            </label>
            <input
              id="coord-name"
              {...register('coordinatorName')}
              placeholder="Prof. K. Ramanathan"
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {errors.coordinatorName && <p className="text-xs text-rose-500 mt-1">{errors.coordinatorName.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }} htmlFor="description">
              Event Description *
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="Brief description of event goals and syllabus covered..."
              className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none border transition"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => router.push('/events')}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold border transition"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-lg shadow-xs transition text-xs disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event & Continue</span>
          </button>
        </div>
      </form>
    </div>
  );
}
