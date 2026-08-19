// Dynamic and safe import of nodemailer for Next.js server runtime
let nodemailerInstance: any = null;

function getNodemailer() {
  if (nodemailerInstance) return nodemailerInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nodemailerInstance = require('nodemailer');
    return nodemailerInstance;
  } catch {
    return null;
  }
}

export type Transporter = any;

export interface SmtpConfigStatus {
  isConfigured: boolean;
  host: string;
  port: number;
  user: string;
  hasPassword: boolean;
  missingFields: string[];
}

export interface SmtpSendOptions {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
  // Metadata for safe structured debugging
  meta?: {
    recipientId?: string;
    recipientName?: string;
    certificateId?: string;
    campaignId?: string;
  };
}

export interface SmtpSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCategory?: 'AUTH_ERROR' | 'CONNECTION_ERROR' | 'INVALID_RECIPIENT' | 'CONFIGURATION_ERROR' | 'UNKNOWN';
}

/**
 * Validate presence of required SMTP environment variables without exposing sensitive credentials.
 */
export function getSmtpConfigStatus(): SmtpConfigStatus {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || '').trim();
  const rawPass = process.env.SMTP_PASS || '';
  const normalizedPass = rawPass.replace(/\s+/g, '');

  const missingFields: string[] = [];
  if (!user) missingFields.push('SMTP_USER');
  if (!normalizedPass) missingFields.push('SMTP_PASS');

  return {
    isConfigured: missingFields.length === 0,
    host,
    port,
    user,
    hasPassword: Boolean(normalizedPass),
    missingFields,
  };
}

/**
 * Create a fresh Nodemailer transport configured for Gmail SMTP (Port 465 SSL or 587 STARTTLS).
 */
export function createSmtpTransporter(): { transporter?: Transporter; error?: string } {
  const status = getSmtpConfigStatus();
  if (!status.isConfigured) {
    return {
      error: `Gmail SMTP is not fully configured. Missing: ${status.missingFields.join(', ')}`,
    };
  }

  const nm = getNodemailer();
  if (!nm) {
    return {
      error: 'nodemailer module could not be loaded. Please ensure npm install has completed.',
    };
  }

  const rawPass = process.env.SMTP_PASS || '';
  const normalizedPass = rawPass.replace(/\s+/g, '');

  const isSecure = status.port === 465;

  const transporter = nm.createTransport({
    host: status.host,
    port: status.port,
    secure: isSecure, // true for 465, false for 587
    auth: {
      user: status.user,
      pass: normalizedPass,
    },
    // Useful timeout settings for resilient network calls
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return { transporter };
}

/**
 * Verifies active SMTP connection and credentials with Google Gmail servers.
 */
export async function verifySmtpConnection(): Promise<{
  success: boolean;
  message: string;
  errorCategory?: string;
}> {
  const { transporter, error } = createSmtpTransporter();
  if (error || !transporter) {
    return {
      success: false,
      message: error || 'SMTP Transporter could not be initialized',
      errorCategory: 'CONFIGURATION_ERROR',
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: `SMTP connection to ${process.env.SMTP_HOST || 'smtp.gmail.com'} verified successfully for ${process.env.SMTP_USER}`,
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    let category = 'CONNECTION_ERROR';
    if (errorMsg.toLowerCase().includes('auth') || errorMsg.toLowerCase().includes('535') || errorMsg.toLowerCase().includes('username and password not accepted')) {
      category = 'AUTH_ERROR';
    }

    return {
      success: false,
      message: errorMsg,
      errorCategory: category,
    };
  }
}

/**
 * Send an email via Gmail SMTP using Nodemailer.
 * Enforces: FROM = SMTP_USER / Institution, TO = Student Email.
 */
export async function sendSmtpMail(options: SmtpSendOptions): Promise<SmtpSendResult> {
  const status = getSmtpConfigStatus();
  if (!status.isConfigured) {
    return {
      success: false,
      error: `Missing required SMTP environment variables: ${status.missingFields.join(', ')}`,
      errorCategory: 'CONFIGURATION_ERROR',
    };
  }

  const { transporter, error: transportErr } = createSmtpTransporter();
  if (transportErr || !transporter) {
    return {
      success: false,
      error: transportErr || 'Failed to initialize SMTP transporter',
      errorCategory: 'CONFIGURATION_ERROR',
    };
  }

  const targetRecipientEmail = (options.to || '').trim();
  if (!targetRecipientEmail) {
    return {
      success: false,
      error: 'Destination recipient email address is required',
      errorCategory: 'INVALID_RECIPIENT',
    };
  }

  // Format sender header
  const senderUser = status.user;
  const senderDisplayName = options.from || 'CertifyHub';
  const formattedFrom = `"${senderDisplayName}" <${senderUser}>`;
  const replyToAddress = options.replyTo || senderUser;

  // Process and normalize attachments to binary Buffer
  const processedAttachments = options.attachments?.map((att) => {
    let contentBuffer: Buffer | string | undefined = att.content;
    if (typeof att.content === 'string') {
      const cleanBase64 = att.content.replace(/^data:[^;]+;base64,/, '');
      contentBuffer = Buffer.from(cleanBase64, 'base64');
    }
    return {
      filename: att.filename,
      content: contentBuffer,
      contentType: att.contentType || 'application/pdf',
    };
  });

  const firstAttachment = processedAttachments?.[0];
  const pdfBufferSize = firstAttachment?.content
    ? Buffer.isBuffer(firstAttachment.content)
      ? firstAttachment.content.length
      : Buffer.byteLength(String(firstAttachment.content))
    : 0;

  // Safe structured debug logging (NEVER logs password)
  if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
    console.info(`[CERTIFICATE EMAIL DEBUG]
Recipient: ${options.meta?.recipientName || 'Recipient'}
Recipient Email (TO): ${targetRecipientEmail}
Certificate ID: ${options.meta?.certificateId || 'N/A'}
Certificate Filename: ${firstAttachment?.filename || 'None'}
Certificate MIME Type: ${firstAttachment?.contentType || 'application/pdf'}
PDF Buffer Size: ${pdfBufferSize} bytes
FROM: ${formattedFrom}
TO: ${targetRecipientEmail}`);
  }

  try {
    const info = await transporter.sendMail({
      from: formattedFrom,
      to: targetRecipientEmail,
      replyTo: replyToAddress,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: processedAttachments,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    let category: SmtpSendResult['errorCategory'] = 'UNKNOWN';

    if (errMsg.includes('535') || errMsg.toLowerCase().includes('authentication') || errMsg.toLowerCase().includes('password')) {
      category = 'AUTH_ERROR';
    } else if (errMsg.toLowerCase().includes('recipient') || errMsg.includes('550') || errMsg.includes('553')) {
      category = 'INVALID_RECIPIENT';
    } else if (errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('econnrefused')) {
      category = 'CONNECTION_ERROR';
    }

    console.error(`[SMTP ERROR] Failed to send email to ${targetRecipientEmail}: ${errMsg}`);

    return {
      success: false,
      error: errMsg,
      errorCategory: category,
    };
  }
}
