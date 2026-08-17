import { describe, it, expect } from 'vitest';
import { BUILT_IN_TEMPLATES } from '@/lib/template/builtInTemplates';
import { runQualityAudit } from '@/lib/editor/qualityChecker';
import { migrateFromLegacy, CertificateDocument } from '@/lib/editor/documentModel';
import { wordingLibrary, BUILT_IN_WORDINGS } from '@/lib/wordingLibrary';
import { signatoryRepository, DEFAULT_SIGNATORIES } from '@/lib/storage/signatoryRepository';
import { logoRepository } from '@/lib/storage/logoRepository';

describe('Institutional Certificate Architecture & Templates', () => {
  it('loads built-in templates correctly including Institutional Appreciation', () => {
    expect(BUILT_IN_TEMPLATES.length).toBeGreaterThanOrEqual(8);

    const instApp = BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-institutional-appreciation');
    expect(instApp).toBeDefined();
    expect(instApp?.name).toBe('Institutional Appreciation');
    expect(instApp?.orientation).toBe('landscape');
    expect(instApp?.elements.length).toBeGreaterThanOrEqual(15);
  });

  it('runs 16-point Quality Audit on Institutional Appreciation template with 0 critical errors', () => {
    const instApp = BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-institutional-appreciation')!;
    const doc: CertificateDocument = migrateFromLegacy(instApp as any);
    const report = runQualityAudit(doc);

    expect(report.errorCount).toBe(0);
    expect(report.canExport).toBe(true);
    expect(report.passedCount).toBeGreaterThan(10);
  });

  it('provides institutional wording presets for Appreciation, Participation, Completion, Achievement, Winner', () => {
    const wordings = wordingLibrary.getAll();
    expect(wordings.length).toBeGreaterThanOrEqual(5);

    const categories = wordings.map((w) => w.category);
    expect(categories).toContain('Appreciation');
    expect(categories).toContain('Participation');
    expect(categories).toContain('Completion');
    expect(categories).toContain('Achievement');
    expect(categories).toContain('Winner');
  });

  it('manages institutional signatories (1 to 6)', () => {
    const defaultSigs = signatoryRepository.getAll();
    expect(defaultSigs.length).toBe(5);
    expect(defaultSigs[0].name).toBe('Dr. R. Sundaram');
    expect(defaultSigs[0].permissionConfirmed).toBe(true);
  });

  it('supports categorized logos in Logo & Partner Manager', () => {
    const logos = logoRepository.getAll();
    expect(Array.isArray(logos)).toBe(true);
  });
});
