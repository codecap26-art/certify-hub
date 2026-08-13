import JSZip from 'jszip';
import saveAs from 'file-saver';
import { CertificateRecord } from '@/types';
import { generateSingleCertificatePdfBlob } from './pdfGenerator';
import { generateSafeFilename } from './codeGenerator';

export async function generateAndDownloadBulkCertificatesZip(
  certificates: CertificateRecord[],
  eventName: string,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  if (typeof window === 'undefined') return;

  const zip = new JSZip();
  const folder = zip.folder(`${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificates`);

  const origin = window.location.origin;
  const total = certificates.length;

  for (let i = 0; i < total; i++) {
    const cert = certificates[i];
    const pdfBlob = await generateSingleCertificatePdfBlob(cert, origin);
    const filename = generateSafeFilename(cert.recipientSnapshot.fullName, cert.eventSnapshot.name);

    folder?.file(filename, pdfBlob);

    if (onProgress) {
      onProgress(i + 1, total);
    }

    // Small delay to keep UI main thread responsive
    await new Promise((r) => setTimeout(r, 10));
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const cleanZipName = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_All_Certificates.zip`;

  saveAs(zipBlob, cleanZipName);
}
