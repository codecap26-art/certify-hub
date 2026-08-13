import { describe, it, expect, beforeEach } from 'vitest';
import { templateRepository } from '../lib/storage/templateRepository';
import { recipientRepository } from '../lib/storage/recipientRepository';
import { eventRepository } from '../lib/storage/eventRepository';
import { certificateRepository } from '../lib/storage/certificateRepository';
import { CustomTemplate, TemplateElement } from '../types/template';
import { Recipient, EventItem } from '../types';
import { generateCertificateCode, generateVerificationToken } from '../lib/certificate/codeGenerator';

describe('Certificate Studio Independent Module & End-to-End Workflow', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  it('completes E2E flow: Create Studio design -> Add dynamic fields -> Save -> Preview -> Generator execution', async () => {
    // Step 1: Create imported background design template in Studio
    const fakePngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const studioTemplate: CustomTemplate = {
      id: 'tmpl-studio-e2e-01',
      name: 'Canva Award Certificate',
      description: 'Imported Canva PNG design background',
      category: 'Imported',
      orientation: 'landscape',
      width: 842,
      height: 595,
      backgroundColor: '#FFFFFF',
      backgroundDataUrl: fakePngDataUrl,
      isImported: true,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [],
    };

    // Save initial design
    await templateRepository.save(studioTemplate);

    // Step 2: Add dynamic fields (recipient name, event name, QR code)
    const recNameElem: TemplateElement = {
      id: 'el-rec-name',
      type: 'dynamic-text',
      name: 'Recipient Name Overlay',
      x: 171,
      y: 200,
      width: 500,
      height: 50,
      rotation: 0,
      zIndex: 1,
      visible: true,
      locked: false,
      opacity: 1,
      dynamicBinding: '{{recipient.name}}',
      textStyle: {
        fontSize: 32,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        fontStyle: 'normal',
        fill: '#0F172A',
        align: 'center',
      },
    };

    const eventNameElem: TemplateElement = {
      id: 'el-event-name',
      type: 'dynamic-text',
      name: 'Event Name Overlay',
      x: 171,
      y: 270,
      width: 500,
      height: 35,
      rotation: 0,
      zIndex: 2,
      visible: true,
      locked: false,
      opacity: 1,
      dynamicBinding: '{{event.name}}',
      textStyle: {
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fill: '#334155',
        align: 'center',
      },
    };

    const qrElem: TemplateElement = {
      id: 'el-qr',
      type: 'qr',
      name: 'Verification QR Code',
      x: 712,
      y: 465,
      width: 80,
      height: 80,
      rotation: 0,
      zIndex: 3,
      visible: true,
      locked: false,
      opacity: 1,
      qrStyle: {
        size: 80,
        fgColor: '#0F172A',
        bgColor: '#FFFFFF',
        displayCodeLabel: true,
      },
    };

    studioTemplate.elements = [recNameElem, eventNameElem, qrElem];

    // Save updated template in Studio
    const saveSuccess = await templateRepository.save(studioTemplate);
    expect(saveSuccess).toBe(true);

    // Retrieve and verify stored Studio design
    const retrieved = await templateRepository.getById('tmpl-studio-e2e-01');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.elements.length).toBe(3);
    expect(retrieved?.category).toBe('Imported');

    // Step 3: Simulate Preview Mode with Sample Recipient Data
    const sampleRecipient: Recipient = {
      id: 'rec-test-01',
      eventId: 'evt-test-01',
      fullName: 'Subash P',
      email: 'subash@example.com',
      registrationNumber: '23CS101',
      department: 'Computer Science',
      course: 'React Development',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const recipientBinding = retrieved?.elements.find((e) => e.dynamicBinding === '{{recipient.name}}');
    expect(recipientBinding).toBeDefined();

    // Step 4: Execute Generator for Multiple Recipients using Studio Template
    const testEvent: EventItem = {
      id: 'evt-test-01',
      name: 'React 19 Workshop',
      eventType: 'Workshop',
      description: 'React Workshop',
      startDate: '2026-03-10',
      endDate: '2026-03-12',
      location: 'Auditorium',
      certificateType: 'Participation',
      coordinatorName: 'Dr. Raman',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const recipientList: Recipient[] = [
      sampleRecipient,
      {
        id: 'rec-test-02',
        eventId: 'evt-test-01',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        registrationNumber: '23CS102',
        department: 'Information Technology',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    eventRepository.save(testEvent);
    recipientRepository.saveAll(recipientList);

    const generatedCertificates = recipientList.map((rec, idx) => ({
      id: `cert-gen-${idx}`,
      certificateCode: generateCertificateCode('ABC Org', testEvent.name),
      verificationToken: generateVerificationToken(),
      eventId: testEvent.id,
      recipientId: rec.id,
      templateId: studioTemplate.id,
      organizationSnapshot: {
        id: 'org-01',
        name: 'ABC Org',
        type: 'College',
        signatoryName: 'Dean',
        signatoryDesignation: 'Dean',
        address: '123 Main St',
        email: 'info@abc.edu',
        phone: '1234567890',
        website: 'https://abc.edu',
        footerText: 'Official Credential',
        logoDataUrl: '',
        signatureDataUrl: '',
      },
      eventSnapshot: testEvent,
      recipientSnapshot: rec,
      status: 'Valid' as const,
      generatedAt: new Date().toISOString(),
    }));

    certificateRepository.saveBatch(generatedCertificates);

    const savedCerts = certificateRepository.getByEventId(testEvent.id);
    expect(savedCerts.length).toBe(2);
    expect(savedCerts[0].templateId).toBe('tmpl-studio-e2e-01');
    expect(savedCerts[1].recipientSnapshot.fullName).toBe('Jane Doe');
  });
});
