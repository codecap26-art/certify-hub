import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getSmtpConfigStatus,
  createSmtpTransporter,
  sendSmtpMail,
  verifySmtpConnection,
} from '@/lib/email/server/smtpTransport';
import { ServerSmtpProvider } from '@/lib/email/providers/ServerSmtpProvider';
import nodemailer from 'nodemailer';

describe('Gmail SMTP & Nodemailer Email Distribution', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('1. Environment Configuration & Password Normalization', () => {
    it('detects missing SMTP environment variables when unconfigured', () => {
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const status = getSmtpConfigStatus();
      expect(status.isConfigured).toBe(false);
      expect(status.missingFields).toContain('SMTP_USER');
      expect(status.missingFields).toContain('SMTP_PASS');
    });

    it('validates and normalizes Gmail App Passwords with spaces', () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'institution@abccollege.edu';
      process.env.SMTP_PASS = 'abcd efgh ijkl mnop'; // Google App Password format with spaces

      const status = getSmtpConfigStatus();
      expect(status.isConfigured).toBe(true);
      expect(status.user).toBe('institution@abccollege.edu');
      expect(status.hasPassword).toBe(true);
      expect(status.port).toBe(465);
    });
  });

  describe('2. Server-Side SMTP Transporter Creation', () => {
    it('creates a secure SSL transporter for Port 465', () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'institution@abccollege.edu';
      process.env.SMTP_PASS = 'abcdefghijklmnop';

      const createTransportSpy = vi.spyOn(nodemailer, 'createTransport');
      const { transporter, error } = createSmtpTransporter();

      expect(error).toBeUndefined();
      expect(transporter).toBeDefined();
      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'institution@abccollege.edu',
            pass: 'abcdefghijklmnop',
          },
        })
      );
    });

    it('creates a STARTTLS transporter when Port 587 is configured', () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'institution@abccollege.edu';
      process.env.SMTP_PASS = 'abcdefghijklmnop';

      const createTransportSpy = vi.spyOn(nodemailer, 'createTransport');
      const { transporter, error } = createSmtpTransporter();

      expect(error).toBeUndefined();
      expect(transporter).toBeDefined();
      expect(createTransportSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 587,
          secure: false,
        })
      );
    });
  });

  describe('3. SMTP Connection Verification', () => {
    it('verifies connection when credentials are valid', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'institution@abccollege.edu';
      process.env.SMTP_PASS = 'abcdefghijklmnop';

      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        verify: vi.fn().mockResolvedValue(true),
      } as any);

      const res = await verifySmtpConnection();
      expect(res.success).toBe(true);
      expect(res.message).toContain('verified successfully');
    });

    it('returns structured error if SMTP authentication fails', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'institution@abccollege.edu';
      process.env.SMTP_PASS = 'wrong-password';

      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        verify: vi.fn().mockRejectedValue(new Error('535-5.7.8 Username and Password not accepted')),
      } as any);

      const res = await verifySmtpConnection();
      expect(res.success).toBe(false);
      expect(res.errorCategory).toBe('AUTH_ERROR');
    });
  });

  describe('4. Destination vs Sender Isolation (Bug Prevention)', () => {
    it('ensures SMTP_USER is strictly used as FROM and student email is strictly used as TO', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'admin-issuer@gmail.com';
      process.env.SMTP_PASS = 'abcdefghijklmnop';

      let capturedMailOptions: any = null;

      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: vi.fn().mockImplementation(async (options) => {
          capturedMailOptions = options;
          return { messageId: 'test-smtp-msg-001' };
        }),
      } as any);

      const sendRes = await sendSmtpMail({
        to: 'student.arun@gmail.com',
        from: 'ABC Engineering College',
        replyTo: 'admin-issuer@gmail.com',
        subject: 'Your Official Certificate',
        html: '<p>Congratulations Arun!</p>',
        attachments: [
          {
            filename: 'Arun_Kumar_Certificate.pdf',
            content: 'PDF_CONTENT_BUFFER',
            contentType: 'application/pdf',
          },
        ],
        meta: {
          recipientId: 'rec-101',
          recipientName: 'Arun Kumar',
          certificateId: 'cert-101',
        },
      });

      expect(sendRes.success).toBe(true);
      expect(sendRes.messageId).toBe('test-smtp-msg-001');

      // CRITICAL ASSERTIONS:
      // 1. Destination 'to' is the student's email, NOT the admin's SMTP_USER
      expect(capturedMailOptions.to).toBe('student.arun@gmail.com');
      // 2. Sender 'from' contains the institution display name and SMTP_USER address
      expect(capturedMailOptions.from).toBe('"ABC Engineering College" <admin-issuer@gmail.com>');
      // 3. Reply-to is the institution email
      expect(capturedMailOptions.replyTo).toBe('admin-issuer@gmail.com');
      // 4. Attachment is attached
      expect(capturedMailOptions.attachments?.length).toBe(1);
      expect(capturedMailOptions.attachments[0].filename).toBe('Arun_Kumar_Certificate.pdf');
    });

    it('rejects sending when destination recipient email is missing', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'admin-issuer@gmail.com';
      process.env.SMTP_PASS = 'abcdefghijklmnop';

      const sendRes = await sendSmtpMail({
        to: '',
        from: 'CertifyHub',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(sendRes.success).toBe(false);
      expect(sendRes.errorCategory).toBe('INVALID_RECIPIENT');
    });
  });

  describe('5. ServerSmtpProvider', () => {
    it('dispatches emails using ServerSmtpProvider correctly', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'admin-issuer@gmail.com';
      process.env.SMTP_PASS = 'abcdefghijklmnop';

      vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
        sendMail: vi.fn().mockResolvedValue({ messageId: 'smtp-provider-msg-001' }),
      } as any);

      const provider = new ServerSmtpProvider();
      const res = await provider.sendEmail({
        to: 'student.priya@gmail.com',
        from: 'CertifyHub',
        fromName: 'CertifyHub Issuer',
        subject: 'Your Certificate',
        html: '<p>Congratulations Priya!</p>',
      });

      expect(res.success).toBe(true);
      expect(res.messageId).toBeDefined();
    });

    it('flags invalid email addresses before making network calls', async () => {
      const provider = new ServerSmtpProvider();
      const res = await provider.sendEmail({
        to: 'invalid-email-format',
        from: 'CertifyHub',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(res.success).toBe(false);
      expect(res.errorCategory).toBe('INVALID_EMAIL');
    });
  });
});
