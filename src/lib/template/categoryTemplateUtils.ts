// ============================================================================
// Category Template Utilities
// Automatic mapping and resolution for Winner, Runner, and Participated templates
// ============================================================================

import { CustomTemplate } from '@/types/template';
import { BUILT_IN_TEMPLATES } from './builtInTemplates';

export interface CategoryTemplateMapping {
  winner: string;
  runner: string;
  participant: string;
}

export const DEFAULT_CATEGORY_TEMPLATE_MAPPING: CategoryTemplateMapping = {
  winner: 'tmpl-competition-winner',
  runner: 'tmpl-achievement-award',
  participant: 'tmpl-academic-participation',
};

/**
 * Returns the default recommended template ID for a given recipient category.
 */
export function getCategoryDefaultTemplateId(
  category: string,
  availableTemplates: CustomTemplate[] = []
): string {
  const norm = category.toLowerCase().trim();

  // 1. Winner
  if (norm.includes('winner') || norm.includes('1st') || norm.includes('first') || norm.includes('gold')) {
    const customWinner = availableTemplates.find(
      (t) => t.name.toLowerCase().includes('winner') || t.id.includes('winner')
    );
    if (customWinner) return customWinner.id;

    const builtInWinner = BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-competition-winner');
    if (builtInWinner) return builtInWinner.id;

    return 'classic-gold';
  }

  // 2. Runner
  if (
    norm.includes('runner') ||
    norm.includes('2nd') ||
    norm.includes('second') ||
    norm.includes('3rd') ||
    norm.includes('third') ||
    norm.includes('silver') ||
    norm.includes('bronze')
  ) {
    const customRunner = availableTemplates.find(
      (t) => t.name.toLowerCase().includes('runner') || t.id.includes('runner')
    );
    if (customRunner) return customRunner.id;

    const builtInRunner = BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-achievement-award') ||
      BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-institutional-appreciation');
    if (builtInRunner) return builtInRunner.id;

    return 'modern-blue';
  }

  // 3. Participated / Participant / Default
  const customParticipant = availableTemplates.find(
    (t) => t.name.toLowerCase().includes('participat') || t.id.includes('participat')
  );
  if (customParticipant) return customParticipant.id;

  const builtInParticipant = BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-academic-participation') ||
    BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-workshop-participation') ||
    BUILT_IN_TEMPLATES.find((t) => t.id === 'tmpl-institutional-appreciation');
  if (builtInParticipant) return builtInParticipant.id;

  return 'minimal-green';
}

/**
 * Resolves the active template ID for a specific recipient based on category mapping.
 */
export function resolveTemplateIdForCategory(
  category: string,
  mapping: CategoryTemplateMapping,
  availableTemplates: CustomTemplate[] = []
): string {
  const norm = category.toLowerCase().trim();
  if (norm.includes('winner') || norm === 'winners') {
    return mapping.winner || getCategoryDefaultTemplateId('winner', availableTemplates);
  }
  if (norm.includes('runner') || norm === 'runners') {
    return mapping.runner || getCategoryDefaultTemplateId('runner', availableTemplates);
  }
  return mapping.participant || getCategoryDefaultTemplateId('participant', availableTemplates);
}

/**
 * Helper to get badge visual metadata for a recipient role category.
 */
export function getCategoryRoleBadge(category: string): {
  label: string;
  icon: string;
  bg: string;
  text: string;
  border: string;
} {
  const norm = category.toLowerCase().trim();
  if (norm.includes('winner') || norm === 'winners') {
    return { label: 'Winner', icon: '🏆', bg: 'bg-[#FFFBEB]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' };
  }
  if (norm.includes('runner') || norm === 'runners') {
    return { label: 'Runner', icon: '🥈', bg: 'bg-[#F5F3FF]', text: 'text-[#5B21B6]', border: 'border-[#C4B5FD]' };
  }
  return { label: 'Participated', icon: '📜', bg: 'bg-[#ECFEFF]', text: 'text-[#155E75]', border: 'border-[#67E8F9]' };
}
