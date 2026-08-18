import { NextResponse } from 'next/server';
import { getSmtpConfigStatus, verifySmtpConnection } from '@/lib/email/server/smtpTransport';

export async function GET() {
  const configStatus = getSmtpConfigStatus();

  if (!configStatus.isConfigured) {
    return NextResponse.json({
      success: false,
      configured: false,
      host: configStatus.host,
      port: configStatus.port,
      user: configStatus.user || 'Not set',
      hasPassword: configStatus.hasPassword,
      missingFields: configStatus.missingFields,
      message: `Gmail SMTP configuration incomplete. Please set ${configStatus.missingFields.join(', ')} in .env.local`,
    });
  }

  const verification = await verifySmtpConnection();

  return NextResponse.json({
    success: verification.success,
    configured: true,
    host: configStatus.host,
    port: configStatus.port,
    user: configStatus.user,
    hasPassword: configStatus.hasPassword,
    message: verification.message,
    errorCategory: verification.errorCategory,
  });
}
