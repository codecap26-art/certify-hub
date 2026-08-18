import { CertificateRecord } from '@/types';
import { getItem, setItem } from './repository';

const CERTIFICATES_KEY = 'certificates';

export const certificateRepository = {
  getAll(): CertificateRecord[] {
    return getItem<CertificateRecord[]>(CERTIFICATES_KEY, []);
  },
  getById(id: string): CertificateRecord | undefined {
    const all = this.getAll();
    return all.find((c) => c.id === id);
  },
  getByTokenOrCode(tokenOrCode: string): CertificateRecord | undefined {
    const all = this.getAll();
    const query = tokenOrCode.trim().toLowerCase();
    return all.find(
      (c) =>
        c.verificationToken.toLowerCase() === query ||
        (c.downloadToken && c.downloadToken.toLowerCase() === query) ||
        c.certificateCode.toLowerCase() === query ||
        c.id.toLowerCase() === query
    );
  },
  getByDownloadToken(token: string): CertificateRecord | undefined {
    if (!token) return undefined;
    const all = this.getAll();
    const query = token.trim().toLowerCase();
    return all.find(
      (c) =>
        (c.downloadToken && c.downloadToken.toLowerCase() === query) ||
        c.verificationToken.toLowerCase() === query
    );
  },
  ensureDownloadToken(cert: CertificateRecord): CertificateRecord {
    if (cert.downloadToken) return cert;
    const randomBytes = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    cert.downloadToken = `dl_${randomBytes}`;
    cert.isActive = cert.isActive ?? true;
    cert.downloadCount = cert.downloadCount ?? 0;
    this.save(cert);
    return cert;
  },
  regenerateDownloadToken(id: string): CertificateRecord | undefined {
    const cert = this.getById(id);
    if (!cert) return undefined;
    const randomBytes = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    cert.downloadToken = `dl_${randomBytes}_${Date.now()}`;
    cert.isActive = true;
    this.save(cert);
    return cert;
  },
  recordDownload(id: string): CertificateRecord | undefined {
    const cert = this.getById(id);
    if (!cert) return undefined;
    const now = new Date().toISOString();
    cert.downloadCount = (cert.downloadCount || 0) + 1;
    if (!cert.firstDownloadedAt) {
      cert.firstDownloadedAt = now;
    }
    cert.lastDownloadedAt = now;
    this.save(cert);
    return cert;
  },
  getByEventId(eventId: string): CertificateRecord[] {
    const all = this.getAll();
    return all.filter((c) => c.eventId === eventId);
  },
  save(cert: CertificateRecord): boolean {
    const all = this.getAll();
    if (!cert.downloadToken) {
      const randomBytes = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      cert.downloadToken = `dl_${randomBytes}`;
    }
    cert.isActive = cert.isActive ?? true;
    cert.downloadCount = cert.downloadCount ?? 0;

    const index = all.findIndex((c) => c.id === cert.id);
    if (index >= 0) {
      all[index] = cert;
    } else {
      all.unshift(cert);
    }
    return setItem<CertificateRecord[]>(CERTIFICATES_KEY, all);
  },
  saveBatch(certs: CertificateRecord[]): boolean {
    const all = this.getAll();
    certs.forEach((cert) => {
      if (!cert.downloadToken) {
        const randomBytes = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        cert.downloadToken = `dl_${randomBytes}`;
      }
      cert.isActive = cert.isActive ?? true;
      cert.downloadCount = cert.downloadCount ?? 0;
    });
    const map = new Map<string, CertificateRecord>(all.map((c) => [c.id, c]));
    certs.forEach((c) => map.set(c.id, c));
    return setItem<CertificateRecord[]>(CERTIFICATES_KEY, Array.from(map.values()));
  },
  revoke(id: string, reason: string): CertificateRecord | undefined {
    const all = this.getAll();
    const cert = all.find((c) => c.id === id);
    if (!cert) return undefined;
    cert.status = 'Revoked';
    cert.revokedAt = new Date().toISOString();
    cert.revocationReason = reason;
    setItem<CertificateRecord[]>(CERTIFICATES_KEY, all);
    return cert;
  },
  saveAll(certs: CertificateRecord[]): boolean {
    return setItem<CertificateRecord[]>(CERTIFICATES_KEY, certs);
  },
};
