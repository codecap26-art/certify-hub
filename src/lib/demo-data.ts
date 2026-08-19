import { CertificateRecord, EventItem, Organization, Recipient } from '@/types';
import {
  DistributionCampaign,
  EmailDeliveryJob,
  EmailAuditLogEntry,
  RecipientNotification,
} from '@/types/distribution';
import { defaultOrganization, organizationRepository } from './storage/organizationRepository';
import { eventRepository } from './storage/eventRepository';
import { recipientRepository } from './storage/recipientRepository';
import { certificateRepository } from './storage/certificateRepository';
import {
  distributionRepository,
  BUILT_IN_EMAIL_TEMPLATES,
} from './storage/distributionRepository';
import { clearAllCertifyHubKeys } from './storage/repository';

export const demoOrganization: Organization = { ...defaultOrganization };

export const demoEvents: EventItem[] = [];

export const demoRecipients: Recipient[] = [];

export const demoCertificates: CertificateRecord[] = [];

export const demoCampaigns: DistributionCampaign[] = [];

export const demoDeliveries: EmailDeliveryJob[] = [];

export const demoAuditLogs: EmailAuditLogEntry[] = [];

export const demoNotifications: RecipientNotification[] = [];

export function seedDemoDataIfNeeded(): void {
  // Only ensure organization branding defaults exist if empty
  const existingOrg = organizationRepository.get();
  if (!existingOrg || !existingOrg.id) {
    organizationRepository.save(demoOrganization);
  }
}

export function resetDemoData(): void {
  clearAllCertifyHubKeys();
  organizationRepository.save(demoOrganization);
}

