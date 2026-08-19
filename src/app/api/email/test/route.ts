import { NextRequest, NextResponse } from 'next/server';
import { sendSmtpMail, getSmtpConfigStatus } from '@/lib/email/server/smtpTransport';
import { generateSingleCertificatePdfBuffer } from '@/lib/certificate/pdfGenerator';
import { CertificateRecord } from '@/types';

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
      return NextResponse.json({
        success: true,
        simulated: true,
        messageId: `sim-test-${Date.now()}`,
        sentTo: recipientEmail,
        sentFrom: 'CertifyHub Issuer (Simulation)',
        message: `✓ Test email to ${recipientEmail} simulated successfully! To send real emails to your Gmail inbox, enter your Gmail & Google App Password in Step 1 above.`,
      });
    }

    const testSubject = 'CertifyHub SMTP Test — Sample Certificate Attached';
    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; rounded: 12px; background: #FFFFFF;">
        <h2 style="color: #0F172A; margin-top: 0;">CertifyHub SMTP Test</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Your Gmail SMTP email configuration is active and working successfully.
        </p>
        <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #166534; margin: 16px 0;">
          📎 <strong>Sample Certificate Attached:</strong> Please check the attached PDF in this email.
        </div>
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

    // Generate sample certificate PDF buffer for attachment
    let attachments: any[] = [];
    try {
      const sampleCert: CertificateRecord = {
        id: 'cert-sample-test',
        certificateCode: 'TEST-CERT-2026',
        verificationToken: 'vtoken-sample-test',
        downloadToken: 'dl_sample_test',
        eventId: 'evt-test',
        recipientId: 'rec-test',
        templateId: 'modern-blue',
        organizationSnapshot: {
          id: 'org-test',
          name: 'CertifyHub Certification Authority',
          type: 'Accreditation Body',
          address: 'Main Campus',
          email: config.user,
          phone: '',
          website: '',
          logoDataUrl: '',
          signatoryName: 'Academic Director',
          signatoryDesignation: 'Director of Certification',
          signatureDataUrl: '',
          footerText: 'Official Digital Credential',
        },
        eventSnapshot: {
          id: 'evt-test',
          name: 'CertifyHub Verification Test Event',
          eventType: 'Demonstration',
          description: 'SMTP Test Verification Certificate',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          location: 'Digital Delivery',
          certificateType: 'Achievement',
          coordinatorName: 'Administrator',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        recipientSnapshot: {
          id: 'rec-test',
          eventId: 'evt-test',
          fullName: 'Test Recipient',
          email: recipientEmail,
          registrationNumber: 'TEST-001',
          department: 'Quality Assurance',
          course: 'SMTP Test',
          achievement: 'First Prize',
          createdAt: '',
          updatedAt: '',
        },
        status: 'Valid',
        generatedAt: new Date().toISOString(),
      };

      const origin = req.nextUrl?.origin || 'http://localhost:3000';
      const pdfBuffer = await generateSingleCertificatePdfBuffer(sampleCert, origin);
      attachments = [
        {
          filename: 'CertifyHub_Sample_Certificate.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    } catch (genErr) {
      console.warn('Could not generate sample PDF attachment for test email:', genErr);
    }

    // CRITICAL: TO must be recipientEmail, NOT config.user
    const result = await sendSmtpMail({
      to: recipientEmail,
      from: 'CertifyHub Issuer',
      subject: testSubject,
      html: testHtml,
      attachments,
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
