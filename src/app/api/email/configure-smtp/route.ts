import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifySmtpConnection } from '@/lib/email/server/smtpTransport';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const smtpUser = (body.smtpUser || '').trim();
    const rawPass = (body.smtpPass || '').trim();
    const smtpPass = rawPass.replace(/\s+/g, '');
    const smtpHost = (body.smtpHost || 'smtp.gmail.com').trim();
    const smtpPort = Number(body.smtpPort) || 465;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { success: false, error: 'Both Gmail address (SMTP_USER) and App Password (SMTP_PASS) are required.' },
        { status: 400 }
      );
    }

    // Set process.env in current running Node runtime immediately
    process.env.SMTP_HOST = smtpHost;
    process.env.SMTP_PORT = String(smtpPort);
    process.env.SMTP_USER = smtpUser;
    process.env.SMTP_PASS = smtpPass;

    // Test connection with Gmail servers
    const verification = await verifySmtpConnection();
    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Google Gmail rejected connection: ${verification.message}`,
          errorCategory: verification.errorCategory,
        },
        { status: 401 }
      );
    }

    // Persist to .env.local in project root
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      const envContent = `# Auto-configured Gmail SMTP Credentials\nSMTP_HOST=${smtpHost}\nSMTP_PORT=${smtpPort}\nSMTP_USER=${smtpUser}\nSMTP_PASS=${smtpPass}\n`;
      fs.writeFileSync(envPath, envContent, 'utf-8');
    } catch (fsErr) {
      console.warn('Could not write .env.local file:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Gmail SMTP connected and verified successfully for ${smtpUser}!`,
      user: smtpUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to configure SMTP' },
      { status: 500 }
    );
  }
}
