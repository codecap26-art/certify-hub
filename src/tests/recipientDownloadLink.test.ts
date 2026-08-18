import { describe, it, expect, beforeEach } from 'vitest';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { eventRepository } from '@/lib/storage/eventRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
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

describe('Recipient-Specific Certificate Download Links From Email', () => {
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
    name: 'TECHNOVA HACKATHON 2026',
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

  describe('1. Unique Recipient Download Link & Token Generation', () => {
    it('creates distinct, secure download tokens for each recipient certificate', () => {
      const certA: CertificateRecord = {
        id: 'cert-abinesh-01',
        certificateCode: 'BIT-TECH-001',
        verificationToken: 'vtoken-abinesh-001',
        downloadToken: 'dl_abinesh_secure_tok_111',
        eventId: mockEvent.id,
        recipientId: studentA.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentA,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
        downloadCount: 0,
      };

      const certB: CertificateRecord = {
        id: 'cert-priya-02',
        certificateCode: 'BIT-TECH-002',
        verificationToken: 'vtoken-priya-002',
        downloadToken: 'dl_priya_secure_tok_222',
        eventId: mockEvent.id,
        recipientId: studentB.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentB,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
        downloadCount: 0,
      };

      certificateRepository.saveBatch([certA, certB]);

      // Abinesh token retrieves only Abinesh certificate
      const retrievedA = certificateRepository.getByDownloadToken('dl_abinesh_secure_tok_111');
      expect(retrievedA).toBeDefined();
      expect(retrievedA?.recipientSnapshot.fullName).toBe('ABINESH K');
      expect(retrievedA?.certificateCode).toBe('BIT-TECH-001');

      // Priya token retrieves only Priya certificate
      const retrievedB = certificateRepository.getByDownloadToken('dl_priya_secure_tok_222');
      expect(retrievedB).toBeDefined();
      expect(retrievedB?.recipientSnapshot.fullName).toBe('PRIYA S');
      expect(retrievedB?.certificateCode).toBe('BIT-TECH-002');

      // Invalid token returns undefined (no leaking)
      const invalid = certificateRepository.getByDownloadToken('dl_non_existent_token');
      expect(invalid).toBeUndefined();
    });
  });

  describe('2. Email Template Button Link Resolution', () => {
    it('injects the exact recipient-specific URL into the View & Download Certificate button', () => {
      const certA: CertificateRecord = {
        id: 'cert-abinesh-01',
        certificateCode: 'BIT-TECH-001',
        verificationToken: 'vtoken-abinesh-001',
        downloadToken: 'dl_abinesh_secure_tok_111',
        eventId: mockEvent.id,
        recipientId: studentA.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentA,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
      };

      const origin = 'https://certifyhub.com';
      const expectedUrl = `${origin}/c/dl_abinesh_secure_tok_111`;

      const context: TemplateContext = {
        recipient: studentA,
        event: mockEvent,
        organization: mockOrg,
        certificate: certA,
        downloadLink: expectedUrl,
      };

      const emailConfig = {
        fromName: 'BIT Issuer',
        replyTo: 'principal@bitsathy.ac.in',
        subject: 'Certificate for {{recipient.name}} - {{event.name}}',
        body: '<p>Dear {{recipient.name}}, download your certificate here: <a href="{{certificate.download_url}}">Direct Link</a></p>',
        ctaButtonText: 'View & Download Certificate',
        includeLogo: true,
        includeSignatory: true,
        footerText: 'BIT Official',
      };

      const renderedHtml = renderFullHtmlEmail(emailConfig, context);

      // Verify the dynamic token replaced in body and attachment card present
      expect(renderedHtml).toContain(`href="${expectedUrl}"`);
      expect(renderedHtml).toContain('Your certificate is attached to this email as a PDF');
      expect(renderedHtml).toContain('ABINESH K');
      expect(renderedHtml).toContain('TECHNOVA HACKATHON 2026');
    });

    it('substitutes {{certificate.download_url}} and {{download_link}} tokens with unique links', () => {
      const uniqueUrl = 'https://certifyhub.com/c/dl_unique_token_xyz';
      const context: TemplateContext = {
        recipient: studentA,
        event: mockEvent,
        organization: mockOrg,
        downloadLink: uniqueUrl,
      };

      const raw = 'Download: {{certificate.download_url}} or {{download_link}}';
      const replaced = replaceVariables(raw, context);

      expect(replaced).toBe(`Download: ${uniqueUrl} or ${uniqueUrl}`);
    });
  });

  describe('3. Three-Recipient Distribution Test (End-to-End)', () => {
    it('sends 3 unique certificate emails where each button points exclusively to that recipient own certificate', async () => {
      const deliveredEmails: { to: string; subject: string; html: string }[] = [];

      class MockTestProvider extends MockTransactionalProvider {
        override async sendEmail(payload: any) {
          deliveredEmails.push(payload);
          return super.sendEmail(payload);
        }
      }

      const provider = new MockTestProvider();
      const engine = new EmailQueueEngine(provider);

      recipientRepository.saveBatch([studentA, studentB, studentC]);

      const certA: CertificateRecord = {
        id: 'cert-abinesh-01',
        certificateCode: 'BIT-TECH-001',
        verificationToken: 'vtok-a',
        downloadToken: 'dl_abinesh_tok_a',
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
        downloadToken: 'dl_priya_tok_b',
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
        downloadToken: 'dl_arun_tok_c',
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
        id: 'camp-3-recipients-dl-test',
        institutionId: mockOrg.id,
        name: '3 Recipients Download Link Campaign',
        eventId: mockEvent.id,
        eventName: mockEvent.name,
        templateId: 'tmpl-default',
        subject: 'Your Certificate for {{event.name}}',
        deliveryMethod: 'both',
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
          body: '<p>Dear {{recipient.name}}, congratulations! <a href="{{certificate.download_url}}">Certificate Link</a></p>',
          includeLogo: true,
          includeSignatory: true,
          footerText: 'Official',
        },
      };

      const origin = 'https://certifyhub.com';
      await engine.launchCampaign(
        campaign,
        [studentA, studentB, studentC],
        [certA, certB, certC],
        origin
      );

      await new Promise((r) => setTimeout(r, 200));

      expect(deliveredEmails.length).toBe(3);

      // Email 1 -> Abinesh
      const emailA = deliveredEmails.find((e) => e.to === 'abineshk2007@gmail.com');
      expect(emailA).toBeDefined();
      expect(emailA?.html).toContain('href="https://certifyhub.com/c/dl_abinesh_tok_a?download=true"');
      expect(emailA?.html).not.toContain('dl_priya_tok_b');
      expect(emailA?.html).not.toContain('dl_arun_tok_c');

      // Email 2 -> Priya
      const emailB = deliveredEmails.find((e) => e.to === 'priya@gmail.com');
      expect(emailB).toBeDefined();
      expect(emailB?.html).toContain('href="https://certifyhub.com/c/dl_priya_tok_b?download=true"');
      expect(emailB?.html).not.toContain('dl_abinesh_tok_a');
      expect(emailB?.html).not.toContain('dl_arun_tok_c');

      // Email 3 -> Arun
      const emailC = deliveredEmails.find((e) => e.to === 'arun@gmail.com');
      expect(emailC).toBeDefined();
      expect(emailC?.html).toContain('href="https://certifyhub.com/c/dl_arun_tok_c?download=true"');
      expect(emailC?.html).not.toContain('dl_abinesh_tok_a');
      expect(emailC?.html).not.toContain('dl_priya_tok_b');
    });
  });

  describe('4. Token Regeneration & Download Tracking', () => {
    it('regenerates download tokens and invalidates the old one', () => {
      const cert: CertificateRecord = {
        id: 'cert-regen-test',
        certificateCode: 'BIT-TECH-999',
        verificationToken: 'vtok-regen-999',
        downloadToken: 'dl_initial_token_123',
        eventId: mockEvent.id,
        recipientId: studentA.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentA,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
      };

      certificateRepository.save(cert);

      const oldCert = certificateRepository.getByDownloadToken('dl_initial_token_123');
      expect(oldCert).toBeDefined();

      // Regenerate token
      const regenerated = certificateRepository.regenerateDownloadToken(cert.id);
      expect(regenerated?.downloadToken).not.toBe('dl_initial_token_123');
      expect(regenerated?.downloadToken).toContain('dl_');

      // Old token no longer works
      const lookupOld = certificateRepository.getByDownloadToken('dl_initial_token_123');
      expect(lookupOld).toBeUndefined();

      // New token resolves certificate
      const lookupNew = certificateRepository.getByDownloadToken(regenerated!.downloadToken!);
      expect(lookupNew).toBeDefined();
      expect(lookupNew?.id).toBe(cert.id);
    });

    it('increments downloadCount and updates download timestamps', () => {
      const cert: CertificateRecord = {
        id: 'cert-track-test',
        certificateCode: 'BIT-TECH-888',
        verificationToken: 'vtok-track-888',
        downloadToken: 'dl_track_token_888',
        eventId: mockEvent.id,
        recipientId: studentA.id,
        templateId: 'modern-blue',
        organizationSnapshot: mockOrg,
        eventSnapshot: mockEvent,
        recipientSnapshot: studentA,
        status: 'Valid',
        generatedAt: '2026-03-22T10:00:00.000Z',
        downloadCount: 0,
      };

      certificateRepository.save(cert);

      const updated = certificateRepository.recordDownload(cert.id);
      expect(updated?.downloadCount).toBe(1);
      expect(updated?.firstDownloadedAt).toBeDefined();
      expect(updated?.lastDownloadedAt).toBeDefined();

      const secondDownload = certificateRepository.recordDownload(cert.id);
      expect(secondDownload?.downloadCount).toBe(2);
    });

    it('generates safe, sanitized filenames for PDF downloads', () => {
      const filename = generateSafeAttachmentFilename(
        'ABINESH K',
        'TECHNOVA HACKATHON 2026'
      );
      expect(filename).toBe('ABINESH_K_TECHNOVA_HACKATHON_2026.pdf');
    });
  });
});
