import {
  DistributionCampaign,
  EmailDeliveryJob,
  EmailTemplate,
  EmailAuditLogEntry,
  RecipientNotification,
} from '@/types/distribution';
import { getItem, setItem } from './repository';

const CAMPAIGNS_KEY = 'distribution_campaigns';
const DELIVERIES_KEY = 'email_deliveries';
const TEMPLATES_KEY = 'email_templates';
const AUDIT_LOGS_KEY = 'distribution_audit_logs';
const NOTIFICATIONS_KEY = 'recipient_notifications';

export const BUILT_IN_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-cert-delivery-default',
    institutionId: 'org-abc-college',
    name: 'Certificate Delivery (Standard)',
    category: 'delivery',
    subject: 'Your {{event.name}} Certificate',
    body: `<p>Hello <strong>{{recipient.name}}</strong>,</p>
<p>Congratulations!</p>
<p>Your certificate for <strong>{{event.name}}</strong> has been issued by <strong>{{institution.name}}</strong>.</p>
<p>Your personalized certificate is attached to this email as a PDF.</p>
<p>Open the attached certificate to preview it or download it directly to your device.</p>
<p>Best regards,<br/><strong>{{institution.name}}</strong></p>`,
    fromName: 'CertifyHub Issuer',
    replyTo: 'contact@abccollege.edu',
    ctaButtonText: '',
    ctaButtonUrlType: 'download',
    includeLogo: true,
    includeSignatory: true,
    footerText: 'This email contains official digitally verified academic credentials.',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tmpl-workshop-completion',
    institutionId: 'org-abc-college',
    name: 'Workshop Certificate',
    category: 'workshop',
    subject: 'Certificate of Participation — {{event.name}}',
    body: `<p>Dear <strong>{{recipient.name}}</strong> (Reg: {{recipient.register_number}}),</p>
<p>Thank you for actively participating in the <strong>{{event.name}}</strong> conducted by the Department of {{recipient.department}} at <strong>{{institution.name}}</strong> on {{issue_date}}.</p>
<p>Your certificate has been validated and attached with this email.</p>`,
    fromName: 'Department of Computer Science',
    replyTo: 'events@abccollege.edu',
    ctaButtonText: 'Access Certificate Portal',
    ctaButtonUrlType: 'portal',
    includeLogo: true,
    includeSignatory: true,
    footerText: 'ABC Engineering College — Excellence in Education',
    isDefault: false,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'tmpl-internship-completion',
    institutionId: 'org-abc-college',
    name: 'Internship Certificate',
    category: 'internship',
    subject: 'Internship Completion Certificate — {{recipient.name}}',
    body: `<p>Dear <strong>{{recipient.name}}</strong>,</p>
<p>We are pleased to certify that you have successfully completed the <strong>{{event.name}}</strong> program at <strong>{{institution.name}}</strong>.</p>
<p>Please download your official internship completion certificate below.</p>`,
    fromName: 'Office of Academic Affairs',
    replyTo: 'internships@abccollege.edu',
    ctaButtonText: 'Download Official PDF',
    ctaButtonUrlType: 'download',
    includeLogo: true,
    includeSignatory: true,
    footerText: 'Verified Digital Credential issued via CertifyHub.',
    isDefault: false,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'tmpl-achievement-award',
    institutionId: 'org-abc-college',
    name: 'Achievement & Winner Award',
    category: 'achievement',
    subject: '🏆 Certificate of Excellence — {{event.name}}',
    body: `<p>Congratulations <strong>{{recipient.name}}</strong>!</p>
<p>We are proud to award you this certificate of excellence for your outstanding achievement in <strong>{{event.name}}</strong>.</p>
<p>Your dedication and skill have set a benchmark. Your official award certificate is attached.</p>`,
    fromName: 'Event Organizing Committee',
    replyTo: 'awards@abccollege.edu',
    ctaButtonText: 'View Award Certificate',
    ctaButtonUrlType: 'verify',
    includeLogo: true,
    includeSignatory: true,
    footerText: 'Digitally signed and cryptographically verifiable.',
    isDefault: false,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
];

export const distributionRepository = {
  // ── CAMPAIGNS ──
  getCampaigns(institutionId?: string): DistributionCampaign[] {
    const all = getItem<DistributionCampaign[]>(CAMPAIGNS_KEY, []);
    if (institutionId) {
      return all.filter((c) => c.institutionId === institutionId);
    }
    return all;
  },

  getCampaignById(id: string): DistributionCampaign | undefined {
    const all = this.getCampaigns();
    return all.find((c) => c.id === id);
  },

  saveCampaign(campaign: DistributionCampaign): boolean {
    const all = this.getCampaigns();
    const idx = all.findIndex((c) => c.id === campaign.id);
    if (idx >= 0) {
      all[idx] = campaign;
    } else {
      all.unshift(campaign);
    }
    return setItem<DistributionCampaign[]>(CAMPAIGNS_KEY, all);
  },

  deleteCampaign(id: string): boolean {
    const all = this.getCampaigns();
    const filtered = all.filter((c) => c.id !== id);
    const success = setItem<DistributionCampaign[]>(CAMPAIGNS_KEY, filtered);
    if (success) {
      // Also cleanup associated deliveries
      const deliveries = this.getDeliveries().filter((d) => d.campaignId !== id);
      setItem<EmailDeliveryJob[]>(DELIVERIES_KEY, deliveries);
    }
    return success;
  },

  // ── DELIVERIES ──
  getDeliveries(campaignId?: string): EmailDeliveryJob[] {
    const all = getItem<EmailDeliveryJob[]>(DELIVERIES_KEY, []);
    if (campaignId) {
      return all.filter((d) => d.campaignId === campaignId);
    }
    return all;
  },

  getDeliveryById(id: string): EmailDeliveryJob | undefined {
    const all = this.getDeliveries();
    return all.find((d) => d.id === id);
  },

  saveDeliveries(jobs: EmailDeliveryJob[]): boolean {
    const all = this.getDeliveries();
    const map = new Map<string, EmailDeliveryJob>(all.map((j) => [j.id, j]));
    jobs.forEach((j) => map.set(j.id, j));
    return setItem<EmailDeliveryJob[]>(DELIVERIES_KEY, Array.from(map.values()));
  },

  updateDelivery(job: EmailDeliveryJob): boolean {
    const all = this.getDeliveries();
    const idx = all.findIndex((j) => j.id === job.id);
    if (idx >= 0) {
      all[idx] = job;
      return setItem<EmailDeliveryJob[]>(DELIVERIES_KEY, all);
    }
    return false;
  },

  updateDeliveryBatch(jobs: EmailDeliveryJob[]): boolean {
    const all = this.getDeliveries();
    const updateMap = new Map<string, EmailDeliveryJob>(jobs.map((j) => [j.id, j]));
    const updatedAll = all.map((existing) => updateMap.get(existing.id) || existing);
    return setItem<EmailDeliveryJob[]>(DELIVERIES_KEY, updatedAll);
  },

  // ── TEMPLATES ──
  getTemplates(institutionId?: string): EmailTemplate[] {
    const stored = getItem<EmailTemplate[]>(TEMPLATES_KEY, []);
    const merged = [...BUILT_IN_EMAIL_TEMPLATES];
    stored.forEach((t) => {
      const idx = merged.findIndex((m) => m.id === t.id);
      if (idx >= 0) {
        merged[idx] = t;
      } else {
        merged.push(t);
      }
    });

    if (institutionId) {
      return merged.filter((t) => !t.institutionId || t.institutionId === institutionId);
    }
    return merged;
  },

  getTemplateById(id: string): EmailTemplate | undefined {
    const all = this.getTemplates();
    return all.find((t) => t.id === id);
  },

  saveTemplate(template: EmailTemplate): boolean {
    const stored = getItem<EmailTemplate[]>(TEMPLATES_KEY, []);
    const idx = stored.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      stored[idx] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      stored.unshift({ ...template, updatedAt: new Date().toISOString() });
    }
    return setItem<EmailTemplate[]>(TEMPLATES_KEY, stored);
  },

  deleteTemplate(id: string): boolean {
    const stored = getItem<EmailTemplate[]>(TEMPLATES_KEY, []);
    const filtered = stored.filter((t) => t.id !== id);
    return setItem<EmailTemplate[]>(TEMPLATES_KEY, filtered);
  },

  // ── AUDIT LOGS ──
  getAuditLogs(campaignId?: string): EmailAuditLogEntry[] {
    const all = getItem<EmailAuditLogEntry[]>(AUDIT_LOGS_KEY, []);
    if (campaignId) {
      return all.filter((l) => l.campaignId === campaignId);
    }
    return all;
  },

  addAuditLog(entry: Omit<EmailAuditLogEntry, 'id' | 'timestamp'>): boolean {
    const all = this.getAuditLogs();
    const newLog: EmailAuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    all.unshift(newLog);
    return setItem<EmailAuditLogEntry[]>(AUDIT_LOGS_KEY, all);
  },

  // ── NOTIFICATIONS ──
  getNotifications(recipientEmailOrId?: string): RecipientNotification[] {
    const all = getItem<RecipientNotification[]>(NOTIFICATIONS_KEY, []);
    if (recipientEmailOrId) {
      const q = recipientEmailOrId.trim().toLowerCase();
      return all.filter(
        (n) =>
          n.recipientEmail.toLowerCase() === q ||
          (n.recipientId && n.recipientId.toLowerCase() === q)
      );
    }
    return all;
  },

  addNotification(notif: Omit<RecipientNotification, 'id' | 'createdAt'>): boolean {
    const all = this.getNotifications();
    const newNotif: RecipientNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newNotif);
    return setItem<RecipientNotification[]>(NOTIFICATIONS_KEY, all);
  },

  markNotificationRead(id: string): boolean {
    const all = this.getNotifications();
    const target = all.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      return setItem<RecipientNotification[]>(NOTIFICATIONS_KEY, all);
    }
    return false;
  },
};
