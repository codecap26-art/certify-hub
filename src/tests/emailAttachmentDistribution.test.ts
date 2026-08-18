import { describe, it, expect, beforeEach } from 'vitest';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import {
  replaceVariables,
  renderFullHtmlEmail,
  generateSafeAttachmentFilename,
  TemplateContext,
} from '@/lib/email/templateEngine';
import { EmailQueueEngine } from '@/lib/email/queue/EmailQueueEngine';
import { MockTransactionalProvider } from '@/lib/email/providers/MockTransactionalProvider';
import { CertificateRecord, Recipient, EventItem, Organization } from '@/types';
import { DistributionCampaign } from '@/types/distribution';
import { resetDemoData } from '@/lib/demo-data';
import { generateSingleCertificatePdfBuffer } from '@/lib/certificate/pdfGenerator';
import { sendSmtpMail } from '@/lib/email/server/smtpTransport';

describe('Email Certificate PDF Attachment Distribution System', () => {
  beforeEach(() => {
    resetDemoData();
  });

  const mockOrg: Organization = {
    id: 'org-bit',
    name: 'Bannari Amman Institute of Technology',
    type: 'Engineering College',
    address: 'Sathyamangalam, Erode, TN',
    email: 'principal@bitsathy.ac.in',
    phone: '04295-226000',
    website: 'https://bitsathy.ac.in',
    logoDataUrl: '',
    signatoryName: 'Dr. C. Palanisamy',
    signatoryDesignation: 'Principal',
    signatureDataUrl: '',
    footerText: 'Official Digital Credential',
  };

  const mockEvent: EventItem = {
    id: 'evt-technova-2026',
    name: 'TECHNOVA 2026',
    eventType: 'Hackathon',
    description: 'National Level Technical Hackathon',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    location: 'Main Auditorium',
    certificateType: 'Achievement',
    coordinatorName: 'Dr. Hackathon Chair',
    status: 'Active',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  };

  const studentA: Recipient = {
    id: 'rec-abinesh-01',
    eventId: mockEvent.id,
    fullName: 'ABINESH K',
    email: 'abineshk2007@gmail.com',
    registrationNumber: '23CS001',
    department: 'Computer Science',
    course: 'TECHNOVA',
    achievement: 'First Prize',
    createdAt: '',
    updatedAt: '',
  };

  const studentB: Recipient = {
    id: 'rec-priya-02',
    eventId: mockEvent.id,
    fullName: 'PRIYA S',
    email: 'priya@gmail.com',
    registrationNumber: '23CS002',
    department: 'Information Technology',
    course: 'TECHNOVA',
    achievement: 'Second Prize',
    createdAt: '',
    updatedAt: '',
  };

  const studentC: Recipient = {
    id: 'rec-arun-03',
    eventId: mockEvent.id,
    fullName: 'ARUN K',
    email: 'arun@gmail.com',
    registrationNumber: '23CS003',
    department: 'Electrical Engineering',
    course: 'TECHNOVA',
    achievement: 'Third Prize',
    createdAt: '',
    updatedAt: '',
  };

  describe('1. Server-Side PDF Buffer Generation', () => {
    it('generates a valid binary PDF buffer for a certificate record', async () => {
      const certA: CertificateRecord = {
        id: 'cert-abinesh-01',
        certificateCode: 'BIT-TECH-001',
        verificationToken: 'vtoken-abinesh-001',
        downloadToken: 'dl_abinesh_001',
        eventId: mockEvent.id,
        recipientId: studentA.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentA,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
      };

      const buffer = await generateSingleCertificatePdfBuffer(certA);
      expect(buffer).toBeDefined();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(1000);
      // Valid PDF files start with '%PDF-' header
      const header = buffer.toString('utf-8', 0, 5);
      expect(header).toBe('%PDF-');
    });
  });

  describe('2. Direct PDF Attachment Notice in Email Template', () => {
    it('renders clean PDF attachment notice card in email body without broken button redirects', () => {
      const certA: CertificateRecord = {
        id: 'cert-abinesh-01',
        certificateCode: 'BIT-TECH-001',
        verificationToken: 'vtoken-abinesh-001',
        eventId: mockEvent.id,
        recipientId: studentA.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentA,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
      };

      const context: TemplateContext = {
        recipient: studentA,
        event: mockEvent,
        organization: mockOrg,
        certificate: certA,
      };

      const emailConfig = {
        fromName: 'BIT Issuer',
        replyTo: 'principal@bitsathy.ac.in',
        subject: 'Your {{event.name}} Certificate',
        body: '<p>Hello <strong>{{recipient.name}}</strong>,</p><p>Congratulations! Your certificate for <strong>{{event.name}}</strong> has been issued by <strong>{{institution.name}}</strong>.</p>',
        includeLogo: true,
        includeSignatory: true,
        footerText: 'BIT Official',
      };

      const renderedHtml = renderFullHtmlEmail(emailConfig, context);

      expect(renderedHtml).toContain('Your certificate is attached to this email as a PDF');
      expect(renderedHtml).toContain('Open the attached certificate in Gmail / Chrome');
      expect(renderedHtml).toContain('ABINESH K');
      expect(renderedHtml).toContain('TECHNOVA 2026');
    });

    it('generates clean sanitized PDF filenames', () => {
      const filenameA = generateSafeAttachmentFilename('ABINESH K', 'TECHNOVA 2026');
      expect(filenameA).toBe('ABINESH_K_TECHNOVA_2026.pdf');

      const filenameB = generateSafeAttachmentFilename('PRIYA / S* (CSE)', 'AI Workshop: 2026?');
      expect(filenameB).toBe('PRIYA_S_CSE_AI_Workshop_2026.pdf');
    });
  });

  describe('3. Three-Recipient Email Attachment Routing', () => {
    it('dispatches 3 distinct emails where each recipient receives exclusively their own certificate attachment', async () => {
      const deliveredEmails: any[] = [];

      class MockTestAttachmentProvider extends MockTransactionalProvider {
        override async sendEmail(payload: any) {
          deliveredEmails.push(payload);
          return super.sendEmail(payload);
        }
      }

      const provider = new MockTestAttachmentProvider();
      const engine = new EmailQueueEngine(provider);

      recipientRepository.saveBatch([studentA, studentB, studentC]);

      const certA: CertificateRecord = {
        id: 'cert-abinesh-01',
        certificateCode: 'BIT-TECH-001',
        verificationToken: 'vtok-a',
        downloadToken: 'dl_abinesh_a',
        eventId: mockEvent.id,
        recipientId: studentA.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentA,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
      };

      const certB: CertificateRecord = {
        id: 'cert-priya-02',
        certificateCode: 'BIT-TECH-002',
        verificationToken: 'vtok-b',
        downloadToken: 'dl_priya_b',
        eventId: mockEvent.id,
        recipientId: studentB.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentB,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
      };

      const certC: CertificateRecord = {
        id: 'cert-arun-03',
        certificateCode: 'BIT-TECH-003',
        verificationToken: 'vtok-c',
        downloadToken: 'dl_arun_c',
        eventId: mockEvent.id,
        recipientId: studentC.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentC,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
      };

      certificateRepository.saveBatch([certA, certB, certC]);

      const campaign: DistributionCampaign = {
        id: 'camp-attachments-test',
        institutionId: mockOrg.id,
        name: 'Attachments Campaign',
        eventId: mockEvent.id,
        eventName: mockEvent.name,
        templateId: 'tmpl-default',
        subject: 'Your Certificate for {{event.name}}',
        deliveryMethod: 'attachment',
        status: 'queued',
        createdAt: new Date().toISOString(),
        createdBy: 'principal@bitsathy.ac.in',
        totalRecipients: 3,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        failedCount: 0,
        queuedCount: 3,
        batchSize: 10,
        rateLimitPerSecond: 10,
        emailConfig: {
          fromName: 'BIT Issuer',
          replyTo: 'principal@bitsathy.ac.in',
          subject: 'Your Certificate for {{event.name}}',
          body: '<p>Dear {{recipient.name}}, your certificate is attached.</p>',
          includeLogo: true,
          includeSignatory: true,
          footerText: 'Official',
        },
      };

      await engine.launchCampaign(
        campaign,
        [studentA, studentB, studentC],
        [certA, certB, certC],
        'https://certifyhub.com'
      );

      await new Promise((r) => setTimeout(r, 200));

      expect(deliveredEmails.length).toBe(3);

      // 1. Abinesh
      const emailA = deliveredEmails.find((e) => e.to === 'abineshk2007@gmail.com');
      expect(emailA).toBeDefined();
      expect(emailA.attachments).toBeDefined();
      expect(emailA.attachments[0].filename).toBe('ABINESH_K_TECHNOVA_2026.pdf');
      expect(emailA.attachments[0].contentType).toBe('application/pdf');
      expect(emailA.metadata.recipientId).toBe(studentA.id);

      // 2. Priya
      const emailB = deliveredEmails.find((e) => e.to === 'priya@gmail.com');
      expect(emailB).toBeDefined();
      expect(emailB.attachments).toBeDefined();
      expect(emailB.attachments[0].filename).toBe('PRIYA_S_TECHNOVA_2026.pdf');
      expect(emailB.attachments[0].contentType).toBe('application/pdf');
      expect(emailB.metadata.recipientId).toBe(studentB.id);

      // 3. Arun
      const emailC = deliveredEmails.find((e) => e.to === 'arun@gmail.com');
      expect(emailC).toBeDefined();
      expect(emailC.attachments).toBeDefined();
      expect(emailC.attachments[0].filename).toBe('ARUN_K_TECHNOVA_2026.pdf');
      expect(emailC.attachments[0].contentType).toBe('application/pdf');
      expect(emailC.metadata.recipientId).toBe(studentC.id);
    });
  });
});
