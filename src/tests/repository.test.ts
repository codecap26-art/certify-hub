import { describe, it, expect, beforeEach } from 'vitest';
import { certificateRepository } from '../lib/storage/certificateRepository';
import { eventRepository } from '../lib/storage/eventRepository';
import { recipientRepository } from '../lib/storage/recipientRepository';
import { CertificateRecord, EventItem, Recipient } from '../types';
import { demoOrganization } from '../lib/demo-data';

describe('LocalStorage Repositories & Revocation Logic', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should save and retrieve events', () => {
    const event: EventItem = {
      id: 'test-evt-01',
      name: 'Test Workshop',
      eventType: 'Workshop',
      description: 'Description',
      startDate: '2026-03-01',
      endDate: '2026-03-02',
      location: 'Main Hall',
      certificateType: 'Participation',
      coordinatorName: 'Test Coord',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    eventRepository.save(event);
    const retrieved = eventRepository.getById('test-evt-01');
    expect(retrieved?.name).toBe('Test Workshop');
  });

  it('should save and revoke certificates', () => {
    const cert: CertificateRecord = {
      id: 'cert-test-100',
      certificateCode: 'TEST-2026-X1Y2Z3',
      verificationToken: 'token-uuid-12345',
      eventId: 'test-evt-01',
      recipientId: 'test-rec-01',
      templateId: 'modern-blue',
      organizationSnapshot: demoOrganization,
      eventSnapshot: {
        id: 'test-evt-01',
        name: 'Test Event',
        eventType: 'Workshop',
        description: 'Test',
        startDate: '2026-01-01',
        endDate: '',
        location: 'Lab',
        certificateType: 'Participation',
        coordinatorName: 'Coord',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      recipientSnapshot: {
        id: 'test-rec-01',
        eventId: 'test-evt-01',
        fullName: 'Test Recipient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      status: 'Valid',
      generatedAt: new Date().toISOString(),
    };

    certificateRepository.save(cert);
    expect(certificateRepository.getById('cert-test-100')?.status).toBe('Valid');

    // Test verification lookup by token
    const found = certificateRepository.getByTokenOrCode('token-uuid-12345');
    expect(found?.id).toBe('cert-test-100');

    // Test revocation
    const revoked = certificateRepository.revoke('cert-test-100', 'Withdrawn by student');
    expect(revoked?.status).toBe('Revoked');
    expect(revoked?.revocationReason).toBe('Withdrawn by student');
  });
});
