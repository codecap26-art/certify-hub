export type EventType =
  | 'Workshop'
  | 'Course'
  | 'Hackathon'
  | 'Competition'
  | 'Internship'
  | 'Seminar'
  | 'Training'
  | 'Conference'
  | 'Other';

export type CertificateType =
  | 'Participation'
  | 'Completion'
  | 'Achievement'
  | 'Appreciation'
  | 'Internship'
  | 'Winner'
  | 'Excellence'
  | 'Merit';

export type EventStatus = 'Draft' | 'Active' | 'Completed';

export interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  logoDataUrl: string;
  signatoryName: string;
  signatoryDesignation: string;
  signatureDataUrl: string;
  footerText: string;
}

export interface EventItem {
  id: string;
  name: string;
  eventType: EventType;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  certificateType: CertificateType;
  coordinatorName: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  id: string;
  eventId: string;
  fullName: string;
  email?: string;
  registrationNumber?: string;
  department?: string;
  course?: string;
  achievement?: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateId = 'modern-blue' | 'classic-gold' | 'minimal-green' | 'academic-maroon';

export interface CertificateTemplate {
  id: TemplateId;
  name: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    cardBg: string;
  };
}

export type CertificateStatus = 'Valid' | 'Revoked';

export interface CertificateRecord {
  id: string;
  certificateCode: string;
  verificationToken: string;
  eventId: string;
  recipientId: string;
  templateId: TemplateId | string;
  organizationSnapshot: Organization;
  eventSnapshot: EventItem;
  recipientSnapshot: Recipient;
  status: CertificateStatus;
  generatedAt: string;
  revokedAt?: string;
  revocationReason?: string;
}

export interface CSVRecipientRow {
  name: string;
  email?: string;
  registrationNumber?: string;
  department?: string;
  course?: string;
  achievement?: string;
  isValid: boolean;
  error?: string;
  isDuplicate?: boolean;
}

export interface CSVParseResult {
  totalRows: number;
  validRows: CSVRecipientRow[];
  invalidRows: CSVRecipientRow[];
  duplicateCount: number;
}

export interface SessionState {
  isLoggedIn: boolean;
  email: string;
  loginAt: string;
}
