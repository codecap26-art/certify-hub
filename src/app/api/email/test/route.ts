import { NextRequest, NextResponse } from 'next/server';
import { sendSmtpMail, getSmtpConfigStatus } from '@/lib/email/server/smtpTransport';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recipientEmail = (body.recipientEmail || '').trim();

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: 'recipientEmail is required to send a test email' },
        { status: 400 }
      );
    }

    const config = getSmtpConfigStatus();
    if (!config.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: `Gmail SMTP is not configured. Missing environment variables: ${config.missingFields.join(', ')}`,
        },
        { status: 503 }
      );
    }

    const testSubject = 'CertifyHub SMTP Test';
    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 12px; background: #FFFFFF;">
        <h2 style="color: #0F172A; margin-top: 0;">CertifyHub SMTP Test</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          CertifyHub Gmail SMTP email configuration is working successfully.
        </p>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #64748B;">
          <p style="margin: 0 0 4px 0;"><strong>Sender (FROM):</strong> ${config.user}</p>
          <p style="margin: 0 0 4px 0;"><strong>Target Recipient (TO):</strong> ${recipientEmail}</p>
          <p style="margin: 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
        <p style="color: #94A3B8; font-size: 11px; margin-top: 20px;">
          This is an automated test email sent from the CertifyHub certificate distribution system.
        </p>
      </div>
    `;

    // CRITICAL: TO must be recipientEmail, NOT config.user
    const result = await sendSmtpMail({
      to: recipientEmail,
      from: 'CertifyHub Issuer',
      subject: testSubject,
      html: testHtml,
      meta: {
        recipientName: 'Test Recipient',
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errorCategory: result.errorCategory },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: recipientEmail,
      sentFrom: config.user,
      message: `Test email successfully sent to ${recipientEmail}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error while sending test email' },
      { status: 500 }
    );
  }
}
