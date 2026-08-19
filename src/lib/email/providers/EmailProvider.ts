export interface EmailAttachment {
  filename: string;
  content: string | Blob | ArrayBuffer; // base64, Blob or ArrayBuffer
  contentType?: string;
}

export interface EmailPayload {
  to: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  certificate?: any;
  tags?: { name: string; value: string }[];
  metadata?: Record<string, string>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCategory?:
    | 'INVALID_EMAIL'
    | 'MISSING_EMAIL'
    | 'MISSING_CERTIFICATE'
    | 'PROVIDER_REJECTED'
    | 'RATE_LIMITED'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';
  timestamp: string;
}

export interface EmailBatchResult {
  total: number;
  successful: number;
  failed: number;
  results: EmailSendResult[];
}

export interface DeliveryStatusResult {
  messageId: string;
  status: 'DELIVERED' | 'OPENED' | 'FAILED' | 'QUEUED' | 'PROCESSING';
  updatedAt: string;
  reason?: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(payload: EmailPayload): Promise<EmailSendResult>;
  sendBatch(payloads: EmailPayload[]): Promise<EmailBatchResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatusResult>;
}
