import { describe, it, expect } from 'vitest';
import {
  generateCertificateCode,
  generateVerificationToken,
  generateSafeFilename,
} from '../lib/certificate/codeGenerator';

describe('Certificate Code & Token Utilities', () => {
  it('should generate a valid formatted certificate code', () => {
    const code = generateCertificateCode('ABC Engineering College', 'React Development Workshop');
    expect(code).toMatch(/^AEC-RDW-\d{4}-[A-Z0-9]{6}$/);
  });

  it('should handle empty or fallback strings gracefully', () => {
    const code = generateCertificateCode('', '');
    expect(code).toMatch(/^ORG-EVT-\d{4}-[A-Z0-9]{6}$/);
  });

  it('should generate a valid verification UUID token', () => {
    const token = generateVerificationToken();
    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should generate clean, safe filenames for PDF downloads', () => {
    const filename = generateSafeFilename('Subash P. (CSE)', 'React & Next.js Workshop!');
    expect(filename).toBe('Subash_P_CSE_React_Next_js_Workshop_Certificate.pdf');
  });

  it('should handle extremely long recipient names gracefully', () => {
    const longName = 'Dr. Subashchandra Bose Ramanathan Krishnan Namboodiri Jr.';
    const filename = generateSafeFilename(longName, 'React Workshop');
    expect(filename).toContain('Certificate.pdf');
    expect(filename).not.toContain(' ');
  });
});
