import { NextRequest, NextResponse } from 'next/server';
import { sendSmtpMail, getSmtpConfigStatus, SmtpSendOptions } from '@/lib/email/server/smtpTransport';
import { generateSingleCertificatePdfBuffer } from '@/lib/certificate/pdfGenerator';
import { generateSafeAttachmentFilename } from '@/lib/email/templateEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const targetRecipientEmail = (body.to || '').trim();
    if (!targetRecipientEmail) {
      return NextResponse.json(
        { success: false, error: 'Recipient "to" email address is required', errorCategory: 'INVALID_RECIPIENT' },
        { status: 400 }
      );
    }

    const config = getSmtpConfigStatus();
    if (!config.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: `Gmail SMTP is not configured. Missing: ${config.missingFields.join(', ')}. Please configure SMTP in Distribution page or .env.local.`,
          errorCategory: 'CONFIGURATION_ERROR',
        },
        { status: 400 }
      );
    }

    let attachments = body.attachments || [];

    // Normalize incoming attachments or generate server-side if certificate object is provided
    if (attachments.length > 0 && attachments[0]?.content && typeof attachments[0].content === 'string' && attachments[0].content.trim() !== '') {
      const cleanBase64 = attachments[0].content.replace(/^data:[^;]+;base64,/, '');
      attachments = [
        {
          filename: attachments[0].filename || 'Certificate.pdf',
          content: Buffer.from(cleanBase64, 'base64'),
          contentType: 'application/pdf',
        },
      ];
    } else if (body.certificate) {
      try {
        const origin = req.nextUrl?.origin || 'http://localhost:3000';
        const pdfBuffer = await generateSingleCertificatePdfBuffer(body.certificate, origin);
        const safeFilename = generateSafeAttachmentFilename(
          body.certificate.recipientSnapshot?.fullName || 'Recipient',
          body.certificate.eventSnapshot?.name || 'Certificate'
        );
        attachments = [
          {
            filename: safeFilename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
      } catch (genErr: any) {
        console.error('Server PDF Generation Error in send route:', genErr);
      }
    }

    const sendOptions: SmtpSendOptions = {
      to: targetRecipientEmail,
      from: body.from,
      replyTo: body.replyTo,
      subject: body.subject || 'Your Certificate from CertifyHub',
      html: body.html,
      attachments,
      meta: body.meta,
    };

    const result = await sendSmtpMail(sendOptions);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorCategory: result.errorCategory,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentTo: targetRecipientEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error while sending email' },
      { status: 500 }
    );
  }
}
