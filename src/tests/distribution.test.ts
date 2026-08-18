import { describe, it, expect, beforeEach } from 'vitest';
import {
  replaceVariables,
  generateSafeAttachmentFilename,
  renderFullHtmlEmail,
  TemplateContext,
} from '@/lib/email/templateEngine';
import { MockTransactionalProvider } from '@/lib/email/providers/MockTransactionalProvider';
import { EmailQueueEngine } from '@/lib/email/queue/EmailQueueEngine';
import { distributionRepository } from '@/lib/storage/distributionRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { eventRepository } from '@/lib/storage/eventRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { resetDemoData } from '@/lib/demo-data';
import { DistributionCampaign, EmailDeliveryJob, EmailTemplate } from '@/types/distribution';
import { Recipient, CertificateRecord, EventItem, Organization } from '@/types';

describe('Certificate Email Distribution System', () => {
  beforeEach(() => {
    resetDemoData();
  });

  const mockOrg: Organization = {
    id: 'org-test',
    name: 'ABC Engineering College',
    type: 'College / University',
    address: 'Chennai, TN',
    email: 'contact@abccollege.edu',
    phone: '1234567890',
    website: 'https://abccollege.edu',
    logoDataUrl: '',
    signatoryName: 'Dr. Principal',
    signatoryDesignation: 'Dean',
    signatureDataUrl: '',
    footerText: 'Official Digital Credential',
  };

  const mockEvent: EventItem = {
    id: 'evt-test-101',
    name: 'AI Innovation Workshop 2026',
    eventType: 'Workshop',
    description: 'Intensive workshop',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    location: 'Tech Hub',
    certificateType: 'Achievement',
    coordinatorName: 'Prof. Coordinator',
    status: 'Active',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  };

  const mockRecipient: Recipient = {
    id: 'rec-subash-test',
    eventId: 'evt-test-101',
    fullName: 'Subash P',
    email: 'subash@example.com',
    registrationNumber: '23CS101',
    department: 'Computer Science',
    course: 'AI Workshop',
    category: 'winner',
    achievement: 'First Place',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  };

  const mockCertificate: CertificateRecord = {
    id: 'cert-test-001',
    certificateCode: 'ABC-AI-2026-0001',
    verificationToken: 'token-subash-001',
    eventId: 'evt-test-101',
    recipientId: 'rec-subash-test',
    templateId: 'modern-blue',
    organizationSnapshot: mockOrg,
    eventSnapshot: mockEvent,
    recipientSnapshot: mockRecipient,
    status: 'Valid',
    generatedAt: '2026-03-12T10:00:00.000Z',
  };

  describe('1. Template Engine & Dynamic Token Substitution', () => {
    it('correctly substitutes dynamic variables into email subject and body', () => {
      const context: TemplateContext = {
        recipient: mockRecipient,
        event: mockEvent,
        organization: mockOrg,
        certificate: mockCertificate,
        downloadLink: 'https://certifyhub.edu/verify/token-subash-001?download=true',
        portalLink: 'https://certifyhub.edu/portal?email=subash@example.com',
      };

      const templateString =
        'Hello {{recipient.name}} ({{recipient.register_number}}), your certificate for {{event.name}} from {{institution.name}} is ready.';

      const result = replaceVariables(templateString, context);

      expect(result).toContain('Hello Subash P (23CS101)');
      expect(result).toContain('AI Innovation Workshop 2026');
      expect(result).toContain('ABC Engineering College');
    });

    it('generates a clean and safe attachment filename from recipient and event', () => {
      const filename = generateSafeAttachmentFilename(
        'Subash P',
        'AI & Machine Learning Workshop 2026'
      );
      expect(filename).toBe('Subash_P_AI_Machine_Learning_Workshop_2026.pdf');
    });

    it('renders responsive HTML email with brand kit header and footer', () => {
      const context: TemplateContext = {
        recipient: mockRecipient,
        event: mockEvent,
        organization: mockOrg,
        certificate: mockCertificate,
      };

      const config = {
        fromName: 'CertifyHub Issuer',
        replyTo: 'contact@abccollege.edu',
        subject: 'Certificate Delivery for {{recipient.name}}',
        body: '<p>Congratulations {{recipient.name}}!</p>',
        ctaButtonText: 'Download Certificate',
        includeLogo: true,
        includeSignatory: true,
        footerText: 'Custom footer statement',
      };

      const html = renderFullHtmlEmail(config, context);
      expect(html).toContain('ABC Engineering College');
      expect(html).toContain('Congratulations Subash P!');
      expect(html).toContain('Your certificate is attached to this email as a PDF');
      expect(html).toContain('Custom footer statement');
    });
  });

  describe('2. Email Provider Abstraction & Validation', () => {
    it('validates email addresses and successfully sends emails via mock provider', async () => {
      const provider = new MockTransactionalProvider();

      const successRes = await provider.sendEmail({
        to: 'subash@example.com',
        from: 'contact@abccollege.edu',
        subject: 'Your Certificate',
        html: '<p>Test</p>',
      });

      expect(successRes.success).toBe(true);
      expect(successRes.messageId).toBeDefined();

      const statusRes = await provider.getDeliveryStatus(successRes.messageId!);
      expect(statusRes.status).toBe('DELIVERED');
    });

    it('flags invalid email addresses with proper error categories', async () => {
      const provider = new MockTransactionalProvider();

      const invalidRes = await provider.sendEmail({
        to: 'invalid-email-address',
        from: 'contact@abccollege.edu',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(invalidRes.success).toBe(false);
      expect(invalidRes.errorCategory).toBe('INVALID_EMAIL');

      const missingRes = await provider.sendEmail({
        to: '',
        from: 'contact@abccollege.edu',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(missingRes.success).toBe(false);
      expect(missingRes.errorCategory).toBe('MISSING_EMAIL');
    });
  });

  describe('3. Pre-Flight Recipient Validation Engine', () => {
    it('identifies ready, missing email, invalid email, and missing certificate records', () => {
      const engine = new EmailQueueEngine();

      const mixedRecipients: Recipient[] = [
        {
          id: 'rec-valid-01',
          eventId: 'evt-test-101',
          fullName: 'Valid User',
          email: 'valid@example.com',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'rec-no-email-02',
          eventId: 'evt-test-101',
          fullName: 'No Email User',
          email: '',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'rec-bad-email-03',
          eventId: 'evt-test-101',
          fullName: 'Bad Email User',
          email: 'bad@format',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'rec-no-cert-04',
          eventId: 'evt-test-101',
          fullName: 'No Cert User',
          email: 'nocert@example.com',
          createdAt: '',
          updatedAt: '',
        },
      ];

      const certs: CertificateRecord[] = [
        {
          ...mockCertificate,
          id: 'cert-v1',
          recipientId: 'rec-valid-01',
        },
        {
          ...mockCertificate,
          id: 'cert-v2',
          recipientId: 'rec-no-email-02',
        },
        {
          ...mockCertificate,
          id: 'cert-v3',
          recipientId: 'rec-bad-email-03',
        },
      ];

      const report = engine.validateRecipients(mixedRecipients, certs);

      expect(report.totalSelected).toBe(4);
      expect(report.readyCount).toBe(1);
      expect(report.missingEmailCount).toBe(1);
      expect(report.invalidEmailCount).toBe(1);
      expect(report.missingCertCount).toBe(1);
      expect(report.validRecipientIds).toEqual(['rec-valid-01']);
      expect(report.issues.length).toBe(3);
    });
  });

  describe('4. Queue Engine & Batch Campaign Execution', () => {
    it('launches a campaign and processes delivery jobs asynchronously', async () => {
      const engine = new EmailQueueEngine();

      const campaign: DistributionCampaign = {
        id: 'camp-test-unit-01',
        institutionId: 'org-test',
        name: 'Unit Test Campaign',
        eventId: mockEvent.id,
        eventName: mockEvent.name,
        templateId: 'tmpl-default',
        subject: 'Your AI Workshop Certificate',
        deliveryMethod: 'both',
        status: 'queued',
        createdAt: new Date().toISOString(),
        createdBy: 'admin@abccollege.edu',
        totalRecipients: 1,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        failedCount: 0,
        queuedCount: 1,
        batchSize: 10,
        rateLimitPerSecond: 10,
        emailConfig: {
          fromName: 'CertifyHub Test',
          replyTo: 'contact@abccollege.edu',
          subject: 'Your AI Workshop Certificate',
          body: '<p>Hello {{recipient.name}}</p>',
          ctaButtonText: 'View Cert',
          includeLogo: true,
          includeSignatory: true,
          footerText: 'Test footer',
        },
      };

      const launched = await engine.launchCampaign(
        campaign,
        [mockRecipient],
        [mockCertificate]
      );

      expect(launched.status).toBe('processing');

      // Wait briefly for queue batch runner to complete
      await new Promise((r) => setTimeout(r, 250));

      const updatedCampaign = distributionRepository.getCampaignById(campaign.id);
      expect(updatedCampaign).toBeDefined();
      expect(updatedCampaign?.deliveredCount).toBe(1);
      expect(updatedCampaign?.failedCount).toBe(0);
      expect(updatedCampaign?.status).toBe('completed');

      const deliveries = distributionRepository.getDeliveries(campaign.id);
      expect(deliveries.length).toBe(1);
      expect(deliveries[0].status).toBe('DELIVERED');
      expect(deliveries[0].providerMessageId).toBeDefined();
    });
  });

  describe('5. Duplicate Protection & Idempotency', () => {
    it('prevents accidental duplicate email deliveries for the same recipient and campaign', async () => {
      const engine = new EmailQueueEngine();

      const existingJob: EmailDeliveryJob = {
        id: 'job-existing-01',
        campaignId: 'camp-idempotency-test',
        institutionId: 'org-test',
        recipientId: mockRecipient.id,
        certificateId: mockCertificate.id,
        recipientName: mockRecipient.fullName,
        email: mockRecipient.email || '',
        status: 'DELIVERED',
        attemptCount: 1,
        maxAttempts: 3,
        queuedAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
      };

      distributionRepository.saveDeliveries([existingJob]);

      const report = engine.validateRecipients(
        [mockRecipient],
        [mockCertificate],
        'camp-idempotency-test'
      );

      expect(report.duplicateCount).toBe(1);
      expect(report.readyCount).toBe(0);
      expect(report.issues[0].category).toBe('DUPLICATE_SEND');
    });
  });

  describe('6. Retry Mechanism & Smart Resend', () => {
    it('retries failed deliveries and increments attempt counters', async () => {
      const engine = new EmailQueueEngine();

      const failedJob: EmailDeliveryJob = {
        id: 'job-retry-test-01',
        campaignId: 'camp-retry-test',
        institutionId: 'org-test',
        recipientId: mockRecipient.id,
        certificateId: mockCertificate.id,
        recipientName: mockRecipient.fullName,
        email: 'subash@example.com',
        status: 'FAILED',
        attemptCount: 1,
        maxAttempts: 3,
        lastError: 'Temporary network glitch',
        errorCategory: 'NETWORK_ERROR',
        queuedAt: new Date().toISOString(),
      };

      const campaign: DistributionCampaign = {
        id: 'camp-retry-test',
        institutionId: 'org-test',
        name: 'Retry Test Campaign',
        eventId: mockEvent.id,
        eventName: mockEvent.name,
        templateId: 'tmpl-default',
        subject: 'Retry Subject',
        deliveryMethod: 'both',
        status: 'completed',
        createdAt: new Date().toISOString(),
        createdBy: 'admin@abccollege.edu',
        totalRecipients: 1,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        failedCount: 1,
        queuedCount: 0,
        batchSize: 10,
        rateLimitPerSecond: 10,
        emailConfig: {
          fromName: 'CertifyHub',
          replyTo: 'contact@abccollege.edu',
          subject: 'Retry Subject',
          body: '<p>Retry</p>',
          ctaButtonText: 'View',
          includeLogo: true,
          includeSignatory: true,
          footerText: '',
        },
      };

      distributionRepository.saveCampaign(campaign);
      distributionRepository.saveDeliveries([failedJob]);

      await engine.retryDeliveries([failedJob.id]);

      await new Promise((r) => setTimeout(r, 100));

      const refreshedDeliveries = distributionRepository.getDeliveries(campaign.id);
      expect(refreshedDeliveries[0].status).toBe('DELIVERED');
      expect(refreshedDeliveries[0].attemptCount).toBe(2);
    });

    it('performs smart resend to failed or never-sent recipients', async () => {
      const engine = new EmailQueueEngine();

      const campaign: DistributionCampaign = {
        id: 'camp-smart-resend-test',
        institutionId: 'org-test',
        name: 'Smart Resend Test',
        eventId: mockEvent.id,
        eventName: mockEvent.name,
        templateId: 'tmpl-default',
        subject: 'Smart Resend',
        deliveryMethod: 'both',
        status: 'completed',
        createdAt: new Date().toISOString(),
        createdBy: 'admin@abccollege.edu',
        totalRecipients: 2,
        sentCount: 1,
        deliveredCount: 1,
        openedCount: 0,
        failedCount: 1,
        queuedCount: 0,
        batchSize: 10,
        rateLimitPerSecond: 10,
        emailConfig: {
          fromName: 'CertifyHub',
          replyTo: 'contact@abccollege.edu',
          subject: 'Subject',
          body: '<p>Body</p>',
          ctaButtonText: 'CTA',
          includeLogo: true,
          includeSignatory: true,
          footerText: '',
        },
      };

      const deliveredJob: EmailDeliveryJob = {
        id: 'job-sr-delivered',
        campaignId: campaign.id,
        institutionId: 'org-test',
        recipientId: 'rec-01',
        certificateId: 'cert-01',
        recipientName: 'Delivered User',
        email: 'del@example.com',
        status: 'DELIVERED',
        attemptCount: 1,
        maxAttempts: 3,
        queuedAt: new Date().toISOString(),
      };

      const failedJob: EmailDeliveryJob = {
        id: 'job-sr-failed',
        campaignId: campaign.id,
        institutionId: 'org-test',
        recipientId: mockRecipient.id,
        certificateId: mockCertificate.id,
        recipientName: mockRecipient.fullName,
        email: mockRecipient.email || '',
        status: 'FAILED',
        attemptCount: 1,
        maxAttempts: 3,
        queuedAt: new Date().toISOString(),
      };

      distributionRepository.saveCampaign(campaign);
      distributionRepository.saveDeliveries([deliveredJob, failedJob]);

      const count = await engine.smartResend(campaign.id, 'failed_only');
      expect(count).toBe(1);

      await new Promise((r) => setTimeout(r, 100));

      const updatedFailedJob = distributionRepository.getDeliveryById('job-sr-failed');
      expect(updatedFailedJob?.status).toBe('DELIVERED');
    });
  });

  describe('7. Recipient Portal & Notification Synchronization', () => {
    it('ensures failed email delivery does not revoke portal certificate access', () => {
      // Recipient has valid certificate record
      certificateRepository.save(mockCertificate);

      // Failed delivery job exists for email
      const failedJob: EmailDeliveryJob = {
        id: 'job-failed-portal-test',
        campaignId: 'camp-portal-test',
        institutionId: 'org-test',
        recipientId: mockRecipient.id,
        certificateId: mockCertificate.id,
        recipientName: mockRecipient.fullName,
        email: 'wrong@address',
        status: 'FAILED',
        attemptCount: 1,
        maxAttempts: 3,
        queuedAt: new Date().toISOString(),
      };
      distributionRepository.saveDeliveries([failedJob]);

      // Recipient queries portal by register number or name
      const cert = certificateRepository.getByTokenOrCode(mockCertificate.verificationToken);
      expect(cert).toBeDefined();
      expect(cert?.status).toBe('Valid');
    });

    it('creates in-portal notifications on certificate delivery', () => {
      distributionRepository.addNotification({
        recipientEmail: 'subash@example.com',
        recipientId: 'rec-subash-test',
        certificateId: 'cert-test-001',
        eventId: 'evt-test-101',
        eventName: 'AI Workshop 2026',
        title: 'New Certificate Available',
        message: 'Your certificate for AI Workshop 2026 is ready.',
        isRead: false,
      });

      const notifs = distributionRepository.getNotifications('subash@example.com');
      expect(notifs.length).toBeGreaterThanOrEqual(1);
      expect(notifs[0].title).toBe('New Certificate Available');
    });
  });

  describe('8. Multi-Student Independent Email Routing (Bug Prevention)', () => {
    it('sends certificates strictly to each individual student email and never redirects to admin email', async () => {
      const recordedEmails: { to: string; from: string; replyTo?: string; subject: string; html: string }[] = [];

      class TrackingProvider extends MockTransactionalProvider {
        override async sendEmail(payload: any) {
          recordedEmails.push(payload);
          return super.sendEmail(payload);
        }
      }

      const trackingProvider = new TrackingProvider();
      const engine = new EmailQueueEngine(trackingProvider);

      const studentA: Recipient = {
        id: 'rec-student-a',
        eventId: mockEvent.id,
        fullName: 'Subash Student',
        email: 'subash.student@gmail.com',
        registrationNumber: '23CS001',
        createdAt: '',
        updatedAt: '',
      };
      const studentB: Recipient = {
        id: 'rec-student-b',
        eventId: mockEvent.id,
        fullName: 'Arun Student',
        email: 'arun.student@gmail.com',
        registrationNumber: '23CS002',
        createdAt: '',
        updatedAt: '',
      };
      const studentC: Recipient = {
        id: 'rec-student-c',
        eventId: mockEvent.id,
        fullName: 'Priya Student',
        email: 'priya.student@gmail.com',
        registrationNumber: '23CS003',
        createdAt: '',
        updatedAt: '',
      };

      recipientRepository.saveBatch([studentA, studentB, studentC]);

      const certA: CertificateRecord = {
        ...mockCertificate,
        id: 'cert-student-a',
        certificateCode: 'CERT-CODE-A',
        recipientId: studentA.id,
        recipientSnapshot: studentA,
      };
      const certB: CertificateRecord = {
        ...mockCertificate,
        id: 'cert-student-b',
        certificateCode: 'CERT-CODE-B',
        recipientId: studentB.id,
        recipientSnapshot: studentB,
      };
      const certC: CertificateRecord = {
        ...mockCertificate,
        id: 'cert-student-c',
        certificateCode: 'CERT-CODE-C',
        recipientId: studentC.id,
        recipientSnapshot: studentC,
      };

      certificateRepository.saveBatch([certA, certB, certC]);

      const multiCampaign: DistributionCampaign = {
        id: 'camp-3-students-test',
        institutionId: 'org-test',
        name: '3 Student Multi-Account Test Campaign',
        eventId: mockEvent.id,
        eventName: mockEvent.name,
        templateId: 'tmpl-default',
        subject: 'Your Certificate for {{event.name}}',
        deliveryMethod: 'both',
        status: 'queued',
        createdAt: new Date().toISOString(),
        createdBy: 'subashp2255@gmail.com', // Admin email
        totalRecipients: 3,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        failedCount: 0,
        queuedCount: 3,
        batchSize: 10,
        rateLimitPerSecond: 10,
        emailConfig: {
          fromName: 'ABC College Admin',
          replyTo: 'subashp2255@gmail.com', // Admin reply-to
          subject: 'Your Certificate for {{event.name}}',
          body: '<p>Hello {{recipient.name}}, your code is {{certificate.code}}.</p>',
          ctaButtonText: 'Download',
          includeLogo: true,
          includeSignatory: true,
          footerText: 'Verified',
        },
      };

      await engine.launchCampaign(
        multiCampaign,
        [studentA, studentB, studentC],
        [certA, certB, certC]
      );

      await new Promise((r) => setTimeout(r, 150));

      // Assert exactly 3 emails were sent
      expect(recordedEmails.length).toBe(3);

      // Verify Student A
      const emailA = recordedEmails.find((e) => e.to === 'subash.student@gmail.com');
      expect(emailA).toBeDefined();
      expect(emailA?.html).toContain('CERT-CODE-A');
      expect(emailA?.html).toContain('Subash Student');
      expect(emailA?.replyTo).toBe('subashp2255@gmail.com');

      // Verify Student B
      const emailB = recordedEmails.find((e) => e.to === 'arun.student@gmail.com');
      expect(emailB).toBeDefined();
      expect(emailB?.html).toContain('CERT-CODE-B');
      expect(emailB?.html).toContain('Arun Student');

      // Verify Student C
      const emailC = recordedEmails.find((e) => e.to === 'priya.student@gmail.com');
      expect(emailC).toBeDefined();
      expect(emailC?.html).toContain('CERT-CODE-C');
      expect(emailC?.html).toContain('Priya Student');

      // Crucial: None of the destination 'to' fields should be the admin email!
      expect(recordedEmails.some((e) => e.to === 'subashp2255@gmail.com')).toBe(false);
    });

    it('rejects delivery if certificate recipient ID does not match recipient ID', async () => {
      const engine = new EmailQueueEngine();

      const student: Recipient = {
        id: 'rec-legit-user',
        eventId: mockEvent.id,
        fullName: 'Legitimate User',
        email: 'legit@example.com',
        createdAt: '',
        updatedAt: '',
      };
      recipientRepository.save(student);

      const mismatchedCert: CertificateRecord = {
        ...mockCertificate,
        id: 'cert-other-user',
        recipientId: 'rec-someone-else',
      };
      certificateRepository.save(mismatchedCert);

      const mismatchedJob: EmailDeliveryJob = {
        id: 'job-mismatch-test',
        campaignId: 'camp-mismatch-test',
        institutionId: 'org-test',
        recipientId: student.id,
        certificateId: mismatchedCert.id,
        recipientName: student.fullName,
        email: student.email || '',
        status: 'QUEUED',
        attemptCount: 0,
        maxAttempts: 3,
        queuedAt: new Date().toISOString(),
      };

      const camp: DistributionCampaign = {
        id: 'camp-mismatch-test',
        institutionId: 'org-test',
        name: 'Mismatch Test',
        eventId: mockEvent.id,
        eventName: mockEvent.name,
        templateId: 'tmpl-default',
        subject: 'Test',
        deliveryMethod: 'both',
        status: 'processing',
        createdAt: new Date().toISOString(),
        createdBy: 'admin@abccollege.edu',
        totalRecipients: 1,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        failedCount: 0,
        queuedCount: 1,
        batchSize: 10,
        rateLimitPerSecond: 10,
        emailConfig: {
          fromName: 'Admin',
          replyTo: 'admin@abccollege.edu',
          subject: 'Test',
          body: 'Test',
          ctaButtonText: 'View',
          includeLogo: true,
          includeSignatory: true,
          footerText: '',
        },
      };

      distributionRepository.saveCampaign(camp);
      distributionRepository.saveDeliveries([mismatchedJob]);

      await engine.processQueue(camp.id);

      const updatedJob = distributionRepository.getDeliveryById('job-mismatch-test');
      expect(updatedJob?.status).toBe('FAILED');
      expect(updatedJob?.lastError).toContain('Security Alert: Certificate recipient ID mismatch');
    });
  });
});
