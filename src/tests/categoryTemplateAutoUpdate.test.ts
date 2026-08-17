import { describe, it, expect } from 'vitest';
import {
  getCategoryDefaultTemplateId,
  resolveTemplateIdForCategory,
  DEFAULT_CATEGORY_TEMPLATE_MAPPING,
  getCategoryRoleBadge,
} from '../lib/template/categoryTemplateUtils';
import {
  getCertificateCategoryTitle,
  getCertificateMainTitle,
  getCertificateRoleLabel,
  getCertificateRankLabel,
  getNormalizedCategory,
} from '../lib/participantUtils';
import { CustomTemplate } from '../types/template';

describe('Category Template Auto-Updating System', () => {
  it('resolves default built-in template for Winner category', () => {
    const winnerTemplateId = getCategoryDefaultTemplateId('winner');
    expect(winnerTemplateId).toBe('tmpl-competition-winner');
  });

  it('resolves default template for Runner category', () => {
    const runnerTemplateId = getCategoryDefaultTemplateId('runner');
    expect(['tmpl-achievement-award', 'tmpl-institutional-appreciation', 'modern-blue']).toContain(runnerTemplateId);
  });

  it('resolves default template for Participated category', () => {
    const participantTemplateId = getCategoryDefaultTemplateId('participant');
    expect(['tmpl-academic-participation', 'tmpl-workshop-participation', 'tmpl-institutional-appreciation', 'minimal-green']).toContain(participantTemplateId);
  });

  it('prioritizes custom template if available for Winner', () => {
    const mockCustomTemplates: CustomTemplate[] = [
      {
        id: 'tmpl-custom-winner-gold',
        name: 'Custom Winner Gold Deluxe',
        description: 'Custom winner award design',
        category: 'Custom',
        orientation: 'landscape',
        width: 842,
        height: 595,
        backgroundColor: '#FFFFFF',
        elements: [],
        version: 1,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    const templateId = getCategoryDefaultTemplateId('winner', mockCustomTemplates);
    expect(templateId).toBe('tmpl-custom-winner-gold');
  });

  it('resolves template mapping correctly per category', () => {
    const customMapping = {
      winner: 'tmpl-custom-winner',
      runner: 'tmpl-custom-runner',
      participant: 'tmpl-custom-participant',
    };

    expect(resolveTemplateIdForCategory('winner', customMapping)).toBe('tmpl-custom-winner');
    expect(resolveTemplateIdForCategory('runner', customMapping)).toBe('tmpl-custom-runner');
    expect(resolveTemplateIdForCategory('participant', customMapping)).toBe('tmpl-custom-participant');
    expect(resolveTemplateIdForCategory('participated', customMapping)).toBe('tmpl-custom-participant');
  });

  it('returns role badge metadata for winner, runner, and participated', () => {
    const winnerBadge = getCategoryRoleBadge('winner');
    expect(winnerBadge.label).toBe('Winner');
    expect(winnerBadge.icon).toBe('🏆');

    const runnerBadge = getCategoryRoleBadge('runner');
    expect(runnerBadge.label).toBe('Runner');
    expect(runnerBadge.icon).toBe('🥈');

    const participantBadge = getCategoryRoleBadge('participated');
    expect(participantBadge.label).toBe('Participated');
    expect(participantBadge.icon).toBe('📜');
  });

  it('generates accurate certificate titles and main titles for Winner, Runner, and Participated', () => {
    expect(getCertificateCategoryTitle('winner')).toBe('Certificate of Achievement');
    expect(getCertificateMainTitle('winner')).toBe('CERTIFICATE OF ACHIEVEMENT');

    expect(getCertificateCategoryTitle('runner')).toBe('Certificate of Merit');
    expect(getCertificateMainTitle('runner')).toBe('CERTIFICATE OF MERIT');

    expect(getCertificateCategoryTitle('participant')).toBe('Certificate of Participation');
    expect(getCertificateMainTitle('participant')).toBe('CERTIFICATE OF PARTICIPATION');

    expect(getCertificateCategoryTitle('participated')).toBe('Certificate of Participation');
    expect(getCertificateCategoryTitle('participant', 'Completion')).toBe('Certificate of Completion');
  });

  it('generates accurate role and rank labels for Winner, Runner, and Participated', () => {
    expect(getCertificateRoleLabel('winner')).toBe('Winner');
    expect(getCertificateRankLabel('winner')).toBe('1st Place Winner');

    expect(getCertificateRoleLabel('runner')).toBe('Runner-Up');
    expect(getCertificateRankLabel('runner')).toBe('2nd Place Runner');

    expect(getCertificateRoleLabel('participant')).toBe('Participant');
    expect(getCertificateRankLabel('participant')).toBe('Participant');

    expect(getCertificateRoleLabel('winner', 'First Place Gold')).toBe('First Place Gold');
  });

  it('resolves built-in and legacy templates via template repository', async () => {
    const { templateRepository } = await import('../lib/storage/templateRepository');
    const winnerTmpl = await templateRepository.getById('tmpl-competition-winner');
    expect(winnerTmpl).toBeDefined();
    expect(winnerTmpl?.name).toContain('Winner');

    const legacyModernBlue = await templateRepository.getById('modern-blue');
    expect(legacyModernBlue).toBeDefined();
  });
});
