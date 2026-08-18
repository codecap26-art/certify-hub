export type DeliveryMethod = 'attachment' | 'link' | 'both';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export type DeliveryStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCELLED';

export type DeliveryErrorCategory =
  | 'INVALID_EMAIL'
  | 'MISSING_EMAIL'
  | 'MISSING_CERTIFICATE'
  | 'PROVIDER_REJECTED'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export type EmailTemplateCategory =
  | 'delivery'
  | 'completion'
  | 'workshop'
  | 'internship'
  | 'achievement'
  | 'custom';

export interface EmailTemplate {
  id: string;
  institutionId: string;
  name: string;
  category: EmailTemplateCategory;
  subject: string;
  body: string;
  fromName: string;
  replyTo: string;
  ctaButtonText?: string;
  ctaButtonUrlType?: 'portal' | 'download' | 'verify';
  includeLogo: boolean;
  includeSignatory: boolean;
  footerText: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailConfigSnapshot {
  fromName: string;
  replyTo: string;
  subject: string;
  body: string;
  ctaButtonText?: string;
  includeLogo: boolean;
  includeSignatory: boolean;
  footerText: string;
}

export interface DistributionCampaign {
  id: string;
  institutionId: string;
  name: string;
  eventId: string;
  eventName: string;
  certificateBatchId?: string;
  templateId: string;
  subject: string;
  deliveryMethod: DeliveryMethod;
  status: CampaignStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  failedCount: number;
  queuedCount: number;
  batchSize: number;
  rateLimitPerSecond: number;
  emailConfig: EmailConfigSnapshot;
}

export interface EmailDeliveryJob {
  id: string;
  campaignId: string;
  institutionId: string;
  recipientId: string;
  certificateId: string;
  recipientName: string;
  email: string;
  registrationNumber?: string;
  department?: string;
  status: DeliveryStatus;
  providerMessageId?: string;
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  lastError?: string;
  errorCategory?: DeliveryErrorCategory;
  queuedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  attachmentFilename?: string;
  downloadToken?: string;
}

export type AuditAction =
  | 'CAMPAIGN_CREATED'
  | 'CAMPAIGN_SCHEDULED'
  | 'TEST_EMAIL_SENT'
  | 'CAMPAIGN_STARTED'
  | 'CAMPAIGN_CANCELLED'
  | 'CAMPAIGN_COMPLETED'
  | 'RECIPIENT_EMAIL_EDITED'
  | 'FAILED_EMAIL_RETRIED'
  | 'TEMPLATE_UPDATED'
  | 'SMART_RESEND_TRIGGERED';

export interface EmailAuditLogEntry {
  id: string;
  institutionId: string;
  campaignId?: string;
  action: AuditAction;
  entityId: string;
  entityType: 'campaign' | 'template' | 'delivery';
  user: string;
  details: string;
  timestamp: string;
}

export interface RecipientNotification {
  id: string;
  recipientEmail: string;
  recipientId?: string;
  certificateId: string;
  eventId: string;
  eventName: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ValidationIssue {
  recipientId: string;
  name: string;
  email?: string;
  registerNumber?: string;
  category: 'MISSING_EMAIL' | 'INVALID_EMAIL' | 'MISSING_CERTIFICATE' | 'DUPLICATE_SEND';
  reason: string;
}

export interface PreFlightValidationReport {
  totalSelected: number;
  readyCount: number;
  missingEmailCount: number;
  invalidEmailCount: number;
  missingCertCount: number;
  duplicateCount: number;
  issues: ValidationIssue[];
  validRecipientIds: string[];
}
