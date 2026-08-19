import { NextRequest, NextResponse } from 'next/server';
import { certificateRepository } from '@/lib/storage/certificateRepository';
import { generateSafeAttachmentFilename } from '@/lib/email/templateEngine';
import { generateSingleCertificatePdfBuffer } from '@/lib/certificate/pdfGenerator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Download token is required' },
      { status: 400 }
    );
  }

  const cert =
    certificateRepository.getByDownloadToken(token) ||
    certificateRepository.getByTokenOrCode(token);

  if (!cert) {
    return NextResponse.json(
      { success: false, error: 'Certificate not found for the provided download token' },
      { status: 404 }
    );
  }

  // Check link expiration if enabled
  if (cert.expiresAt && new Date(cert.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { success: false, error: 'Certificate download link has expired' },
      { status: 410 }
    );
  }

  // Check revocation
  if (cert.status === 'Revoked') {
    return NextResponse.json(
      { success: false, error: 'This certificate has been revoked by the issuing institution', reason: cert.revocationReason },
      { status: 403 }
    );
  }

  // Record download activity
  certificateRepository.recordDownload(cert.id);

  const safeFilename = generateSafeAttachmentFilename(
    cert.recipientSnapshot.fullName,
    cert.eventSnapshot.name
  );

  const shouldStreamPdf =
    req.nextUrl.searchParams.get('download') === 'true' ||
    req.headers.get('accept')?.includes('application/pdf');

  if (shouldStreamPdf) {
    try {
      const pdfBuffer = await generateSingleCertificatePdfBuffer(cert, req.nextUrl.origin);
      const uint8Array = new Uint8Array(pdfBuffer);
      return new NextResponse(uint8Array, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Content-Length': String(pdfBuffer.length),
        },
      });
    } catch (genErr) {
      console.error('API PDF Generation error:', genErr);
    }
  }

  return NextResponse.json({
    success: true,
    certificateId: cert.id,
    recipientName: cert.recipientSnapshot.fullName,
    eventName: cert.eventSnapshot.name,
    filename: safeFilename,
    downloadCount: cert.downloadCount || 1,
    downloadUrl: `/c/${cert.downloadToken || cert.verificationToken}`,
  });
}
