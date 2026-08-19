import {
  DistributionCampaign,
  EmailDeliveryJob,
  PreFlightValidationReport,
  ValidationIssue,
} from '@/types/distribution';
import { Recipient, CertificateRecord, EventItem, Organization } from '@/types';
import { distributionRepository } from '@/lib/storage/distributionRepository';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { recipientRepository } from '@/lib/storage/recipientRepository';
import { eventRepository } from '@/lib/storage/eventRepository';
import { organizationRepository } from '@/lib/storage/organizationRepository';
import { EmailProvider } from '../providers/EmailProvider';
import { defaultSmtpProvider } from '../providers/ServerSmtpProvider';
import {
  renderFullHtmlEmail,
  replaceVariables,
  generateSafeAttachmentFilename,
  TemplateContext,
} from '../templateEngine';
import { generateCertificatePdfBase64 } from '@/lib/certificate/pdfGenerator';

export class EmailQueueEngine {
  private provider: EmailProvider;
  private activeCampaignIds = new Set<string>();

  constructor(provider: EmailProvider = defaultSmtpProvider) {
    this.provider = provider;
  }

  /**
   * Pre-Flight Validation Engine:
   * Validates recipients before launching campaign.
   * Checks: email exists, valid email syntax, certificate exists & matches recipient, recipient record exists, duplicate check.
   */
  validateRecipients(
    recipients: Recipient[],
    certificates: CertificateRecord[],
    campaignId?: string
  ): PreFlightValidationReport {
    const issues: ValidationIssue[] = [];
    const validRecipientIds: string[] = [];
    const existingDeliveries = distributionRepository.getDeliveries();

    let missingEmailCount = 0;
    let invalidEmailCount = 0;
    let missingCertCount = 0;
    let duplicateCount = 0;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const rec of recipients) {
      // 1. Missing Email
      if (!rec.email || !rec.email.trim()) {
        issues.push({
          recipientId: rec.id,
          name: rec.fullName,
          email: '',
          registerNumber: rec.registrationNumber,
          category: 'MISSING_EMAIL',
          reason: 'No email address specified for recipient',
        });
        missingEmailCount++;
        continue;
      }

      // 2. Invalid Email Format
      if (!emailRegex.test(rec.email.trim())) {
        issues.push({
          recipientId: rec.id,
          name: rec.fullName,
          email: rec.email,
          registerNumber: rec.registrationNumber,
          category: 'INVALID_EMAIL',
          reason: `Invalid email format "${rec.email}"`,
        });
        invalidEmailCount++;
        continue;
      }

      // 3. Check matching certificate
      const matchingCert = certificates.find((c) => c.recipientId === rec.id);
      if (!matchingCert) {
        issues.push({
          recipientId: rec.id,
          name: rec.fullName,
          email: rec.email,
          registerNumber: rec.registrationNumber,
          category: 'MISSING_CERTIFICATE',
          reason: 'No generated certificate record found for recipient',
        });
        missingCertCount++;
        continue;
      }

      // 4. Check for duplicate send if campaignId provided
      if (campaignId) {
        const isDuplicate = existingDeliveries.some(
          (d) =>
            d.campaignId === campaignId &&
            d.recipientId === rec.id &&
            d.certificateId === matchingCert.id &&
            (d.status === 'DELIVERED' || d.status === 'SENT' || d.status === 'QUEUED')
        );

        if (isDuplicate) {
          issues.push({
            recipientId: rec.id,
            name: rec.fullName,
            email: rec.email,
            registerNumber: rec.registrationNumber,
            category: 'DUPLICATE_SEND',
            reason: 'Certificate already delivered or queued for this recipient in this campaign',
          });
          duplicateCount++;
          continue;
        }
      }

      // Record is valid
      validRecipientIds.push(rec.id);
    }

    return {
      totalSelected: recipients.length,
      readyCount: validRecipientIds.length,
      missingEmailCount,
      invalidEmailCount,
      missingCertCount,
      duplicateCount,
      issues,
      validRecipientIds,
    };
  }

  /**
   * Launch Campaign:
   * Creates delivery jobs, marks campaign as queued/processing, and triggers batch worker.
   */
  async launchCampaign(
    campaign: DistributionCampaign,
    selectedRecipients: Recipient[],
    certificates: CertificateRecord[],
    originUrl: string = 'https://certifyhub.edu'
  ): Promise<DistributionCampaign> {
    const org = organizationRepository.get();
    const event = eventRepository.getById(campaign.eventId) || {
      id: campaign.eventId,
      name: campaign.eventName,
      eventType: 'Workshop',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      location: 'Campus',
      certificateType: 'Participation',
      coordinatorName: 'Academic Coordinator',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Pre-flight check
    const validation = this.validateRecipients(selectedRecipients, certificates, campaign.id);
    const validRecipients = selectedRecipients.filter((r) =>
      validation.validRecipientIds.includes(r.id)
    );

    const deliveryJobs: EmailDeliveryJob[] = [];
    const timestamp = new Date().toISOString();

    // Create delivery jobs for all valid recipients
    validRecipients.forEach((rec) => {
      const cert = certificates.find((c) => c.recipientId === rec.id)!;
      const safeFilename = generateSafeAttachmentFilename(rec.fullName, event.name);

      const job: EmailDeliveryJob = {
        id: `job-${campaign.id}-${rec.id}`,
        campaignId: campaign.id,
        institutionId: campaign.institutionId,
        recipientId: rec.id,
        certificateId: cert.id,
        recipientName: rec.fullName,
        email: rec.email || '',
        registrationNumber: rec.registrationNumber,
        department: rec.department,
        status: 'QUEUED',
        attemptCount: 0,
        maxAttempts: 3,
        queuedAt: timestamp,
        attachmentFilename: safeFilename,
      };

      deliveryJobs.push(job);
    });

    // Also record initial failed jobs for invalid recipients so admin can edit and retry later
    validation.issues.forEach((issue) => {
      const rec = selectedRecipients.find((r) => r.id === issue.recipientId);
      if (!rec) return;
      const cert = certificates.find((c) => c.recipientId === rec.id);

      const failedJob: EmailDeliveryJob = {
        id: `job-${campaign.id}-${rec.id}`,
        campaignId: campaign.id,
        institutionId: campaign.institutionId,
        recipientId: rec.id,
        certificateId: cert?.id || 'none',
        recipientName: rec.fullName,
        email: rec.email || '',
        registrationNumber: rec.registrationNumber,
        department: rec.department,
        status: 'FAILED',
        attemptCount: 0,
        maxAttempts: 3,
        lastError: issue.reason,
        errorCategory:
          issue.category === 'MISSING_EMAIL'
            ? 'MISSING_EMAIL'
            : issue.category === 'INVALID_EMAIL'
            ? 'INVALID_EMAIL'
            : 'MISSING_CERTIFICATE',
        queuedAt: timestamp,
      };

      deliveryJobs.push(failedJob);
    });

    // Save deliveries
    distributionRepository.saveDeliveries(deliveryJobs);

    // Update campaign counters
    const isScheduled = campaign.status === 'scheduled' && !!campaign.scheduledAt;
    const initialStatus = isScheduled ? 'scheduled' : 'processing';

    const updatedCampaign: DistributionCampaign = {
      ...campaign,
      status: initialStatus,
      startedAt: isScheduled ? undefined : timestamp,
      totalRecipients: selectedRecipients.length,
      queuedCount: validRecipients.length,
      failedCount: validation.issues.length,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
    };

    distributionRepository.saveCampaign(updatedCampaign);

    // Audit log
    distributionRepository.addAuditLog({
      institutionId: campaign.institutionId,
      campaignId: campaign.id,
      action: isScheduled ? 'CAMPAIGN_SCHEDULED' : 'CAMPAIGN_STARTED',
      entityId: campaign.id,
      entityType: 'campaign',
      user: campaign.createdBy,
      details: isScheduled
        ? `Campaign scheduled for ${campaign.scheduledAt} with ${selectedRecipients.length} recipients`
        : `Campaign launched: ${validRecipients.length} queued, ${validation.issues.length} flagged invalid`,
    });

    // If not scheduled, immediately process queue asynchronously
    if (!isScheduled) {
      this.processQueue(campaign.id, originUrl);
    }

    return updatedCampaign;
  }

  /**
   * Queue Batch Processor:
   * Processes email delivery jobs in controlled batches, updating storage & UI progress.
   */
  async processQueue(campaignId: string, originUrl: string = 'https://certifyhub.edu'): Promise<void> {
    if (this.activeCampaignIds.has(campaignId)) return;
    this.activeCampaignIds.add(campaignId);

    try {
      const campaign = distributionRepository.getCampaignById(campaignId);
      if (!campaign || campaign.status === 'cancelled' || campaign.status === 'paused') {
        this.activeCampaignIds.delete(campaignId);
        return;
      }

      const allDeliveries = distributionRepository.getDeliveries(campaignId);
      const queuedJobs = allDeliveries.filter((d) => d.status === 'QUEUED' || d.status === 'RETRYING');

      if (queuedJobs.length === 0) {
        // Mark campaign completed
        const finalDelivered = allDeliveries.filter((d) => d.status === 'DELIVERED').length;
        const finalFailed = allDeliveries.filter((d) => d.status === 'FAILED').length;
        const finalSent = allDeliveries.filter((d) => d.status === 'SENT' || d.status === 'DELIVERED').length;

        campaign.status = 'completed';
        campaign.completedAt = new Date().toISOString();
        campaign.deliveredCount = finalDelivered;
        campaign.failedCount = finalFailed;
        campaign.sentCount = finalSent;
        campaign.queuedCount = 0;
        distributionRepository.saveCampaign(campaign);

        distributionRepository.addAuditLog({
          institutionId: campaign.institutionId,
          campaignId: campaign.id,
          action: 'CAMPAIGN_COMPLETED',
          entityId: campaign.id,
          entityType: 'campaign',
          user: 'System Queue Engine',
          details: `Campaign completed: ${finalDelivered} delivered, ${finalFailed} failed`,
        });

        this.activeCampaignIds.delete(campaignId);
        return;
      }

      const org = organizationRepository.get();
      const event = eventRepository.getById(campaign.eventId) || {
        id: campaign.eventId,
        name: campaign.eventName,
        eventType: 'Workshop',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        location: 'Campus',
        certificateType: 'Participation',
        coordinatorName: 'Coordinator',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const batchSize = Math.max(1, campaign.batchSize || 50);

      // Process batch by batch
      for (let i = 0; i < queuedJobs.length; i += batchSize) {
        // Check if campaign was cancelled in the middle
        const freshCampaign = distributionRepository.getCampaignById(campaignId);
        if (!freshCampaign || freshCampaign.status === 'cancelled' || freshCampaign.status === 'paused') {
          break;
        }

        const batch = queuedJobs.slice(i, i + batchSize);

        for (const job of batch) {
          // Check if cancelled
          const currentCamp = distributionRepository.getCampaignById(campaignId);
          if (currentCamp?.status === 'cancelled') break;

          job.status = 'PROCESSING';
          job.attemptCount += 1;
          job.lastAttemptAt = new Date().toISOString();
          distributionRepository.updateDelivery(job);

          // 1. Fetch recipient directly from database or delivery job snapshot
          const recipient = recipientRepository.getById(job.recipientId) || {
            id: job.recipientId,
            eventId: campaign.eventId,
            fullName: job.recipientName,
            email: job.email,
            registrationNumber: job.registrationNumber,
            department: job.department,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // 2. Fetch certificate directly from database
          const cert = certificateRepository.getById(job.certificateId);

          // 3. Safety Validation: Certificate recipient ID must match recipient ID (Step 18)
          if (cert && cert.recipientId && recipient.id && cert.recipientId !== recipient.id) {
            job.status = 'FAILED';
            job.lastError = `Security Alert: Certificate recipient ID mismatch (${cert.recipientId} vs ${recipient.id})`;
            job.errorCategory = 'UNKNOWN';
            distributionRepository.updateDelivery(job);
            continue;
          }

          // 4. Verify recipient has a valid student email
          const targetRecipientEmail = (recipient.email || job.email || '').trim();
          if (!targetRecipientEmail) {
            job.status = 'FAILED';
            job.lastError = 'Missing recipient email address';
            job.errorCategory = 'MISSING_EMAIL';
            distributionRepository.updateDelivery(job);
            continue;
          }

          // Ensure download token is generated
          if (cert && !cert.downloadToken) {
            certificateRepository.ensureDownloadToken(cert);
          }

          const downloadToken = cert ? (cert.downloadToken || cert.verificationToken) : '';
          const recipientDownloadUrl = cert ? `${originUrl}/c/${downloadToken}?download=true` : `${originUrl}/portal`;

          const context: TemplateContext = {
            recipient,
            event,
            organization: org,
            certificate: cert,
            portalLink: `${originUrl}/portal?email=${encodeURIComponent(targetRecipientEmail)}`,
            verifyUrl: cert ? `${originUrl}/verify/${cert.verificationToken}` : `${originUrl}/verify`,
            downloadLink: recipientDownloadUrl,
          };

          const renderedHtml = renderFullHtmlEmail(campaign.emailConfig, context);
          const renderedSubject = replaceVariables(campaign.subject, context);

          // Sender is Institution / Admin, Destination 'to' is ALWAYS the student recipient's email
          const senderFrom = campaign.emailConfig.fromName || org.name || 'CertifyHub Issuer';
          const replyToAddress = campaign.emailConfig.replyTo || org.email || 'contact@abccollege.edu';

          // Debug Logging (Step 13)
          if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
            console.info(`[CERTIFICATE DISTRIBUTION DEBUG]
Campaign ID: ${campaign.id}
Recipient ID: ${recipient.id}
Recipient Name: ${recipient.fullName}
DB Recipient Email: ${recipient.email}
Queued Recipient Email: ${job.email}
Final Provider TO: ${targetRecipientEmail}
Sender FROM: ${senderFrom} <${org.email}>
Reply-To: ${replyToAddress}
Certificate ID: ${cert?.id || 'none'}`);
          }

          const safeFilename = generateSafeAttachmentFilename(recipient.fullName, event.name);

          // Generate real high-resolution binary PDF for email attachment
          let pdfBase64 = '';
          if (cert) {
            try {
              pdfBase64 = await generateCertificatePdfBase64(cert, originUrl);
            } catch (pdfErr) {
              console.warn('[Queue Engine] PDF generation warning:', pdfErr);
            }
          }

          // Call provider with targetRecipientEmail strictly as 'to' and valid PDF attachment
          const result = await this.provider.sendEmail({
            to: targetRecipientEmail,
            from: senderFrom,
            replyTo: replyToAddress,
            subject: renderedSubject,
            html: renderedHtml,
            certificate: cert,
            attachments: cert
              ? [
                  {
                    filename: safeFilename,
                    content: pdfBase64,
                    contentType: 'application/pdf',
                  },
                ]
              : undefined,
            metadata: {
              recipientId: recipient.id,
              recipientName: recipient.fullName,
              certificateId: cert?.id || 'none',
              campaignId: campaign.id,
            },
          });

          if (result.success) {
            job.status = 'DELIVERED';
            job.providerMessageId = result.messageId;
            job.sentAt = result.timestamp;
            job.deliveredAt = result.timestamp;
            job.lastError = undefined;

            // In-portal notification
            if (cert) {
              distributionRepository.addNotification({
                recipientEmail: job.email,
                recipientId: job.recipientId,
                certificateId: cert.id,
                eventId: event.id,
                eventName: event.name,
                title: 'New Certificate Delivered',
                message: `Your official certificate for "${event.name}" is now available.`,
                isRead: false,
              });
            }
          } else {
            // Check retry criteria
            if (job.attemptCount < job.maxAttempts && result.errorCategory !== 'INVALID_EMAIL' && result.errorCategory !== 'MISSING_EMAIL') {
              job.status = 'RETRYING';
              job.lastError = result.error;
              job.errorCategory = result.errorCategory;
              // Exponential backoff: 2s * 2^attempt
              const backoffMs = 2000 * Math.pow(2, job.attemptCount);
              job.nextRetryAt = new Date(Date.now() + backoffMs).toISOString();
            } else {
              job.status = 'FAILED';
              job.lastError = result.error || 'Email delivery failed';
              job.errorCategory = result.errorCategory || 'UNKNOWN';
            }
          }

          distributionRepository.updateDelivery(job);
        }

        // Recompute campaign counters after each batch
        const deliveriesNow = distributionRepository.getDeliveries(campaignId);
        const deliveredCount = deliveriesNow.filter((d) => d.status === 'DELIVERED').length;
        const failedCount = deliveriesNow.filter((d) => d.status === 'FAILED').length;
        const sentCount = deliveriesNow.filter((d) => d.status === 'SENT' || d.status === 'DELIVERED').length;
        const queuedCount = deliveriesNow.filter((d) => d.status === 'QUEUED' || d.status === 'RETRYING' || d.status === 'PROCESSING').length;

        const campUpdate = distributionRepository.getCampaignById(campaignId);
        if (campUpdate && campUpdate.status !== 'cancelled') {
          campUpdate.deliveredCount = deliveredCount;
          campUpdate.failedCount = failedCount;
          campUpdate.sentCount = sentCount;
          campUpdate.queuedCount = queuedCount;
          distributionRepository.saveCampaign(campUpdate);
        }

        // Small delay between batches to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      // Final status check
      const finalDeliveries = distributionRepository.getDeliveries(campaignId);
      const remainingQueued = finalDeliveries.filter((d) => d.status === 'QUEUED' || d.status === 'RETRYING').length;

      const campFinal = distributionRepository.getCampaignById(campaignId);
      if (campFinal && campFinal.status !== 'cancelled') {
        if (remainingQueued === 0) {
          campFinal.status = 'completed';
          campFinal.completedAt = new Date().toISOString();
        }
        campFinal.deliveredCount = finalDeliveries.filter((d) => d.status === 'DELIVERED').length;
        campFinal.failedCount = finalDeliveries.filter((d) => d.status === 'FAILED').length;
        campFinal.sentCount = finalDeliveries.filter((d) => d.status === 'SENT' || d.status === 'DELIVERED').length;
        campFinal.queuedCount = remainingQueued;
        distributionRepository.saveCampaign(campFinal);
      }
    } finally {
      this.activeCampaignIds.delete(campaignId);
    }
  }

  /**
   * Cancel Campaign:
   * Cancels remaining QUEUED & RETRYING jobs. Already DELIVERED emails remain intact.
   */
  cancelCampaign(campaignId: string): boolean {
    const campaign = distributionRepository.getCampaignById(campaignId);
    if (!campaign) return false;

    campaign.status = 'cancelled';
    distributionRepository.saveCampaign(campaign);

    const deliveries = distributionRepository.getDeliveries(campaignId);
    deliveries.forEach((d) => {
      if (d.status === 'QUEUED' || d.status === 'RETRYING' || d.status === 'PROCESSING') {
        d.status = 'CANCELLED';
        distributionRepository.updateDelivery(d);
      }
    });

    distributionRepository.addAuditLog({
      institutionId: campaign.institutionId,
      campaignId: campaign.id,
      action: 'CAMPAIGN_CANCELLED',
      entityId: campaign.id,
      entityType: 'campaign',
      user: 'Administrator',
      details: 'Campaign cancelled by administrator. Queued jobs marked cancelled.',
    });

    return true;
  }

  /**
   * Retry specific delivery job (or selected jobs).
   */
  async retryDeliveries(deliveryIds: string[], originUrl: string = 'https://certifyhub.edu'): Promise<void> {
    const allDeliveries = distributionRepository.getDeliveries();
    const targetJobs = allDeliveries.filter((d) => deliveryIds.includes(d.id));

    if (targetJobs.length === 0) return;

    const campaignId = targetJobs[0].campaignId;
    targetJobs.forEach((j) => {
      j.status = 'QUEUED';
      j.lastError = undefined;
      distributionRepository.updateDelivery(j);
    });

    const campaign = distributionRepository.getCampaignById(campaignId);
    if (campaign) {
      if (campaign.status === 'completed' || campaign.status === 'failed') {
        campaign.status = 'processing';
        distributionRepository.saveCampaign(campaign);
      }
      distributionRepository.addAuditLog({
        institutionId: campaign.institutionId,
        campaignId,
        action: 'FAILED_EMAIL_RETRIED',
        entityId: campaignId,
        entityType: 'delivery',
        user: 'Administrator',
        details: `Retried ${targetJobs.length} delivery jobs`,
      });

      this.processQueue(campaignId, originUrl);
    }
  }

  /**
   * Smart Resend:
   * Target failed, never-sent, or both.
   */
  async smartResend(
    campaignId: string,
    mode: 'failed_only' | 'never_sent_only' | 'failed_and_never_sent',
    originUrl: string = 'https://certifyhub.edu'
  ): Promise<number> {
    const deliveries = distributionRepository.getDeliveries(campaignId);
    const toRetry: EmailDeliveryJob[] = [];

    deliveries.forEach((d) => {
      const isFailed = d.status === 'FAILED';
      const isNeverSent = d.status === 'QUEUED' || d.status === 'CANCELLED' || d.attemptCount === 0;

      if (mode === 'failed_only' && isFailed) toRetry.push(d);
      else if (mode === 'never_sent_only' && isNeverSent) toRetry.push(d);
      else if (mode === 'failed_and_never_sent' && (isFailed || isNeverSent)) toRetry.push(d);
    });

    if (toRetry.length === 0) return 0;

    await this.retryDeliveries(
      toRetry.map((j) => j.id),
      originUrl
    );

    return toRetry.length;
  }

  /**
   * Check and run any scheduled campaigns whose scheduledAt timestamp has passed.
   */
  async checkScheduledCampaigns(originUrl: string = 'https://certifyhub.edu'): Promise<void> {
    const allCampaigns = distributionRepository.getCampaigns();
    const now = new Date().toISOString();

    const dueCampaigns = allCampaigns.filter(
      (c) => c.status === 'scheduled' && c.scheduledAt && c.scheduledAt <= now
    );

    for (const camp of dueCampaigns) {
      camp.status = 'processing';
      camp.startedAt = now;
      distributionRepository.saveCampaign(camp);

      distributionRepository.addAuditLog({
        institutionId: camp.institutionId,
        campaignId: camp.id,
        action: 'CAMPAIGN_STARTED',
        entityId: camp.id,
        entityType: 'campaign',
        user: 'Scheduled Cron Watcher',
        details: `Scheduled campaign automatically triggered at ${now}`,
      });

      this.processQueue(camp.id, originUrl);
    }
  }
}

export const emailQueueEngine = new EmailQueueEngine();
