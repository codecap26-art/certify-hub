import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import { CertificateRecord } from '@/types';
import QRCode from 'qrcode';
import { generateSafeFilename } from './codeGenerator';
import { organizationRepository } from '../storage/organizationRepository';
import { templateRepository } from '../storage/templateRepository';
import { generatePdfFromCustomTemplate } from './customPdfGenerator';
import {
  getNormalizedCategory,
  getCertificateCategoryTitle,
  getCertificateRoleLabel,
} from '@/lib/participantUtils';

// A4 Landscape Dimensions in Points: 841.89 x 595.28
const styles = StyleSheet.create({
  page: {
    width: 841.89,
    height: 595.28,
    padding: 36,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: 'Helvetica',
  },
  borderFrame: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 4,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  orgTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  orgSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  certBadge: {
    fontSize: 8,
    color: '#38BDF8',
    textTransform: 'uppercase',
  },
  codeText: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
  },
  body: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#14B8A6',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  certifyTo: {
    fontSize: 10,
    color: '#CBD5E1',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38BDF8',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#14B8A6',
    alignSelf: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 1.5,
    maxWidth: 600,
    marginHorizontal: 'auto',
  },
  achievementText: {
    fontSize: 11,
    color: '#2DD4BF',
    fontWeight: 'bold',
    marginTop: 6,
  },
  winnerBadge: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  runnerBadge: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  footerLeft: {
    fontSize: 9,
    color: '#94A3B8',
  },
  qrBox: {
    alignItems: 'center',
  },
  qrImage: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderRadius: 2,
  },
  qrLabel: {
    fontSize: 7,
    color: '#94A3B8',
    marginTop: 2,
  },
  signatoryBox: {
    alignItems: 'flex-end',
  },
  signatureImg: {
    height: 35,
    width: 100,
    objectFit: 'contain',
    marginBottom: 4,
  },
  signatoryName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signatoryDesig: {
    fontSize: 9,
    color: '#94A3B8',
  },
});

interface PdfDocProps {
  certificate: CertificateRecord;
  qrDataUrl: string;
}

export const CertificatePdfDocument: React.FC<PdfDocProps> = ({ certificate, qrDataUrl }) => {
  const org = certificate.organizationSnapshot;
  const event = certificate.eventSnapshot;
  const recipient = certificate.recipientSnapshot;
  const category = getNormalizedCategory(recipient);
  const categoryTitle = getCertificateCategoryTitle(category, event.certificateType);
  const roleLabel = getCertificateRoleLabel(category, recipient.achievement);
  const isWinner = category === 'winner';
  const isRunner = category === 'runner';

  return (
    <Document title={`${categoryTitle} - ${recipient.fullName}`}>
      <Page size={{ width: 841.89, height: 595.28 }} style={styles.page}>
        <View style={styles.borderFrame} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.orgInfo}>
            {org.logoDataUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={org.logoDataUrl} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.orgTitle}>{org.name || 'Organization'}</Text>
              <Text style={styles.orgSub}>{org.address}</Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.certBadge}>Official Certificate</Text>
            <Text style={styles.codeText}>{certificate.certificateCode}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.subtitle}>{categoryTitle}</Text>

          <Text style={styles.mainTitle}>PROUDLY PRESENTED TO</Text>

          <Text style={styles.recipientName}>{recipient.fullName}</Text>

          <Text style={styles.description}>
            {isWinner
              ? `For exceptional performance and securing Winner distinction in ${event.name} held from ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''}.`
              : isRunner
              ? `For commendable performance and securing Runner-Up distinction in ${event.name} held from ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''}.`
              : `For successful completion and active participation in ${event.name} held from ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''}.`}
          </Text>

          {isWinner && (
            <Text style={styles.winnerBadge}>Awarded Distinction: {roleLabel}</Text>
          )}
          {isRunner && (
            <Text style={styles.runnerBadge}>Awarded Distinction: {roleLabel}</Text>
          )}
          {!isWinner && !isRunner && recipient.achievement && recipient.achievement !== 'Participant' && (
            <Text style={styles.achievementText}>Special Distinction: {recipient.achievement}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text>Issue Date: {new Date(certificate.generatedAt).toLocaleDateString()}</Text>
            <Text>Location: {event.location}</Text>
            <Text style={{ fontSize: 7, marginTop: 4, maxWidth: 220 }}>{org.footerText}</Text>
          </View>

          {qrDataUrl ? (
            <View style={styles.qrBox}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={qrDataUrl} style={styles.qrImage} />
              <Text style={styles.qrLabel}>Scan to Verify</Text>
            </View>
          ) : null}

          <View style={styles.signatoryBox}>
            {org.signatureDataUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={org.signatureDataUrl} style={styles.signatureImg} />
            ) : null}
            <Text style={styles.signatoryName}>{org.signatoryName || 'Authorized Signatory'}</Text>
            <Text style={styles.signatoryDesig}>{org.signatoryDesignation}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function generateSingleCertificatePdfBlob(
  certificate: CertificateRecord,
  origin: string
): Promise<Blob> {
  // Check if certificate uses a custom template from templateRepository
  const customTemplate = await templateRepository.getById(certificate.templateId);
  if (customTemplate) {
    const customPdfBytes = await generatePdfFromCustomTemplate(certificate, customTemplate);
    return new Blob([customPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  }

  const currentOrg = organizationRepository.get();
  const certToRender: CertificateRecord = {
    ...certificate,
    organizationSnapshot: {
      ...currentOrg,
      ...certificate.organizationSnapshot,
      logoDataUrl: certificate.organizationSnapshot?.logoDataUrl || currentOrg.logoDataUrl,
      signatureDataUrl: certificate.organizationSnapshot?.signatureDataUrl || currentOrg.signatureDataUrl,
    },
  };

  const verifyUrl = `${origin}/verify/${certificate.verificationToken}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });

  const instance = pdf(<CertificatePdfDocument certificate={certToRender} qrDataUrl={qrDataUrl} />);
  return await instance.toBlob();
}

export async function generateSingleCertificatePdfBuffer(
  certificate: CertificateRecord,
  origin: string = 'https://certifyhub.com'
): Promise<Buffer> {
  // Check if certificate uses a custom template from templateRepository
  const customTemplate = await templateRepository.getById(certificate.templateId);
  if (customTemplate) {
    const customPdfBytes = await generatePdfFromCustomTemplate(certificate, customTemplate);
    return Buffer.from(customPdfBytes);
  }

  const currentOrg = certificate.organizationSnapshot || organizationRepository.get();
  const certToRender: CertificateRecord = {
    ...certificate,
    organizationSnapshot: {
      ...currentOrg,
      ...certificate.organizationSnapshot,
      logoDataUrl: certificate.organizationSnapshot?.logoDataUrl || currentOrg.logoDataUrl,
      signatureDataUrl: certificate.organizationSnapshot?.signatureDataUrl || currentOrg.signatureDataUrl,
    },
  };

  let qrDataUrl = '';
  try {
    const verifyUrl = `${origin}/verify/${certificate.verificationToken || certificate.certificateCode}`;
    qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });
  } catch (err) {
    // QRCode generation fallback
  }

  const instance = pdf(<CertificatePdfDocument certificate={certToRender} qrDataUrl={qrDataUrl} />);
  const blob = await instance.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateCertificatePdfBase64(
  certificate: CertificateRecord,
  origin: string = 'https://certifyhub.com'
): Promise<string> {
  const buffer = await generateSingleCertificatePdfBuffer(certificate, origin);
  return buffer.toString('base64');
}

export async function downloadCertificatePdf(certificate: CertificateRecord): Promise<void> {
  if (typeof window === 'undefined') return;

  const blob = await generateSingleCertificatePdfBlob(certificate, window.location.origin);
  const safeName = generateSafeFilename(certificate.recipientSnapshot?.fullName || 'Certificate', certificate.eventSnapshot?.name || 'Event');

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Delay revoking URL so browser has time to finish reading the stream
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 10000);
}

export async function viewCertificatePdfInTab(certificate: CertificateRecord): Promise<void> {
  if (typeof window === 'undefined') return;

  const blob = await generateSingleCertificatePdfBlob(certificate, window.location.origin);
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 30000);
}
