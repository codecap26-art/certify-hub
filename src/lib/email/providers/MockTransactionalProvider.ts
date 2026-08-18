import {
  EmailProvider,
  EmailPayload,
  EmailSendResult,
  EmailBatchResult,
  DeliveryStatusResult,
} from './EmailProvider';

export class MockTransactionalProvider implements EmailProvider {
  name = 'MockTransactionalProvider';

  private deliveryStatuses = new Map<
    string,
    { status: 'DELIVERED' | 'OPENED' | 'FAILED' | 'QUEUED'; updatedAt: string; reason?: string }
  >();

  // Simple email regex validation
  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const clean = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
  }

  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    const timestamp = new Date().toISOString();

    // 1. Check for missing email
    if (!payload.to || !payload.to.trim()) {
      return {
        success: false,
        error: 'Missing recipient email address',
        errorCategory: 'MISSING_EMAIL',
        timestamp,
      };
    }

    // 2. Check for invalid email format
    if (!this.isValidEmail(payload.to)) {
      return {
        success: false,
        error: `Invalid email address format: "${payload.to}"`,
        errorCategory: 'INVALID_EMAIL',
        timestamp,
      };
    }

    // 3. Simulated failure triggers for testing (e.g. bounce domain or provider reject)
    if (payload.to.includes('reject@') || payload.to.includes('bounce@')) {
      return {
        success: false,
        error: 'Provider rejected: Recipient mailbox is full or domain does not accept mail',
        errorCategory: 'PROVIDER_REJECTED',
        timestamp,
      };
    }

    // Simulated short network latency (10-30ms)
    await new Promise((resolve) => setTimeout(resolve, 20));

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Store delivery state as delivered
    this.deliveryStatuses.set(messageId, {
      status: 'DELIVERED',
      updatedAt: timestamp,
    });

    return {
      success: true,
      messageId,
      timestamp,
    };
  }

  async sendBatch(payloads: EmailPayload[]): Promise<EmailBatchResult> {
    const results: EmailSendResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const payload of payloads) {
      const res = await this.sendEmail(payload);
      results.push(res);
      if (res.success) {
        successful++;
      } else {
        failed++;
      }
    }

    return {
      total: payloads.length,
      successful,
      failed,
      results,
    };
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatusResult> {
    const record = this.deliveryStatuses.get(messageId);
    if (!record) {
      return {
        messageId,
        status: 'DELIVERED',
        updatedAt: new Date().toISOString(),
      };
    }
    return {
      messageId,
      status: record.status,
      updatedAt: record.updatedAt,
      reason: record.reason,
    };
  }
}

export const defaultEmailProvider = new MockTransactionalProvider();
