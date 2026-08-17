import { CertificateRecord, EventItem, Organization, Recipient } from '@/types';
import { defaultOrganization, organizationRepository } from './storage/organizationRepository';
import { eventRepository } from './storage/eventRepository';
import { recipientRepository } from './storage/recipientRepository';
import { certificateRepository } from './storage/certificateRepository';
import { clearAllCertifyHubKeys } from './storage/repository';

export const demoOrganization: Organization = { ...defaultOrganization };

export const demoEvents: EventItem[] = [
  {
    id: 'evt-react-2026',
    name: 'React Development Workshop 2026',
    eventType: 'Workshop',
    description:
      'Hands-on 3-day intensive workshop covering React 19, Next.js App Router, TypeScript, state management, and modern component architecture.',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    location: 'Auditorium Hall B, ABC Engineering College',
    certificateType: 'Participation',
    coordinatorName: 'Prof. K. Ramanathan',
    status: 'Active',
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'evt-fullstack-2026',
    name: 'Full-Stack Web Internship 2026',
    eventType: 'Internship',
    description:
      'Comprehensive 8-week virtual internship program on building production-grade web applications.',
    startDate: '2026-01-05',
    endDate: '2026-02-28',
    location: 'Online / Remote',
    certificateType: 'Completion',
    coordinatorName: 'Dr. S. Meenakshi',
    status: 'Completed',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
];

export const demoRecipients: Recipient[] = [
  {
    id: 'rec-subash-01',
    eventId: 'evt-react-2026',
    fullName: 'Subash P',
    email: 'subash@example.com',
    registrationNumber: '23CS101',
    department: 'Computer Science & Engineering',
    course: 'React Development Workshop',
    achievement: 'First Place',
    category: 'winner',
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-02T10:00:00.000Z',
  },
  {
    id: 'rec-arun-02',
    eventId: 'evt-react-2026',
    fullName: 'Arun Kumar',
    email: 'arun@example.com',
    registrationNumber: '23CS102',
    department: 'Computer Science & Engineering',
    course: 'React Development Workshop',
    achievement: 'First Place',
    category: 'winner',
    createdAt: '2026-03-02T10:05:00.000Z',
    updatedAt: '2026-03-02T10:05:00.000Z',
  },
  {
    id: 'rec-priya-03',
    eventId: 'evt-react-2026',
    fullName: 'Priya S',
    email: 'priya@example.com',
    registrationNumber: '23CS103',
    department: 'Information Technology',
    course: 'React Development Workshop',
    achievement: 'First Place',
    category: 'winner',
    createdAt: '2026-03-02T10:10:00.000Z',
    updatedAt: '2026-03-02T10:10:00.000Z',
  },
  {
    id: 'rec-rahul-04',
    eventId: 'evt-react-2026',
    fullName: 'Rahul K',
    email: 'rahul@example.com',
    registrationNumber: '23CS104',
    department: 'Computer Science & Engineering',
    course: 'React Development Workshop',
    achievement: 'Second Place',
    category: 'runner',
    createdAt: '2026-03-02T10:15:00.000Z',
    updatedAt: '2026-03-02T10:15:00.000Z',
  },
  {
    id: 'rec-karthik-05',
    eventId: 'evt-react-2026',
    fullName: 'Karthik S',
    email: 'karthik@example.com',
    registrationNumber: '23CS105',
    department: 'Electronics & Communication',
    course: 'React Development Workshop',
    achievement: 'Second Place',
    category: 'runner',
    createdAt: '2026-03-02T10:20:00.000Z',
    updatedAt: '2026-03-02T10:20:00.000Z',
  },
  {
    id: 'rec-kavin-06',
    eventId: 'evt-react-2026',
    fullName: 'Kavin R',
    email: 'kavin@example.com',
    registrationNumber: '23CS106',
    department: 'Electronics & Communication',
    course: 'React Development Workshop',
    achievement: 'Participant',
    category: 'participant',
    createdAt: '2026-03-02T10:25:00.000Z',
    updatedAt: '2026-03-02T10:25:00.000Z',
  },
  {
    id: 'rec-divya-07',
    eventId: 'evt-react-2026',
    fullName: 'Divya M',
    email: 'divya@example.com',
    registrationNumber: '23CS107',
    department: 'Computer Science & Engineering',
    course: 'React Development Workshop',
    achievement: 'Participant',
    category: 'participant',
    createdAt: '2026-03-02T10:30:00.000Z',
    updatedAt: '2026-03-02T10:30:00.000Z',
  },
  {
    id: 'rec-meera-08',
    eventId: 'evt-react-2026',
    fullName: 'Meera N',
    email: 'meera@example.com',
    registrationNumber: '23CS108',
    department: 'Information Technology',
    course: 'React Development Workshop',
    achievement: 'Participant',
    category: 'participant',
    createdAt: '2026-03-02T10:35:00.000Z',
    updatedAt: '2026-03-02T10:35:00.000Z',
  },
  {
    id: 'rec-sanjay-09',
    eventId: 'evt-react-2026',
    fullName: 'Sanjay V',
    email: 'sanjay@example.com',
    registrationNumber: '23CS109',
    department: 'Mechanical Engineering',
    course: 'React Development Workshop',
    achievement: 'Participant',
    category: 'participant',
    createdAt: '2026-03-02T10:40:00.000Z',
    updatedAt: '2026-03-02T10:40:00.000Z',
  },
  {
    id: 'rec-ananya-10',
    eventId: 'evt-react-2026',
    fullName: 'Ananya R',
    email: 'ananya@example.com',
    registrationNumber: '23CS110',
    department: 'Computer Science & Engineering',
    course: 'React Development Workshop',
    achievement: 'Participant',
    category: 'participant',
    createdAt: '2026-03-02T10:45:00.000Z',
    updatedAt: '2026-03-02T10:45:00.000Z',
  },
];

export const demoCertificates: CertificateRecord[] = [
  {
    id: 'cert-demo-001',
    certificateCode: 'ABC-REACT-2026-A7B9C2',
    verificationToken: '550e8400-e29b-41d4-a716-446655440000',
    eventId: 'evt-react-2026',
    recipientId: 'rec-subash-01',
    templateId: 'modern-blue',
    organizationSnapshot: demoOrganization,
    eventSnapshot: demoEvents[0],
    recipientSnapshot: demoRecipients[0],
    status: 'Valid',
    generatedAt: '2026-03-12T16:30:00.000Z',
  },
];

export function seedDemoDataIfNeeded(): void {
  const existingEvents = eventRepository.getAll();
  if (existingEvents.length === 0) {
    organizationRepository.save(demoOrganization);
    eventRepository.saveAll(demoEvents);
    recipientRepository.saveAll(demoRecipients);
    certificateRepository.saveAll(demoCertificates);
  }
}

export function resetDemoData(): void {
  clearAllCertifyHubKeys();
  organizationRepository.save(demoOrganization);
  eventRepository.saveAll(demoEvents);
  recipientRepository.saveAll(demoRecipients);
  certificateRepository.saveAll(demoCertificates);
}
