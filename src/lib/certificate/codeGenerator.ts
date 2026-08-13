/**
 * Certificate code generator and filename helpers.
 */

export function generateCertificateCode(orgName: string, eventName: string): string {
  const orgPrefix = orgName
    ? orgName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3) || 'ORG'
    : 'ORG';

  const eventPrefix = eventName
    ? eventName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 5) || 'EVT'
    : 'EVT';

  const currentYear = new Date().getFullYear();

  // Generate 6-char random alphanumeric string
  const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomSuffix = '';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * randomChars.length);
    randomSuffix += randomChars[idx];
  }

  return `${orgPrefix}-${eventPrefix}-${currentYear}-${randomSuffix}`;
}

export function generateVerificationToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateSafeFilename(recipientName: string, eventName: string): string {
  const cleanRecipient = (recipientName || 'Recipient')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const cleanEvent = (eventName || 'Certificate')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${cleanRecipient}_${cleanEvent}_Certificate.pdf`;
}
