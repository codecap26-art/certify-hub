// ============================================================================
// Certificate Wording Library — Wording Presets & Custom Editing
// ============================================================================

import { getItem, setItem } from './storage/repository';

export interface WordingPreset {
  id: string;
  category: 'Appreciation' | 'Participation' | 'Completion' | 'Achievement' | 'Winner' | 'Custom';
  title: string;
  text: string;
  isBuiltIn: boolean;
}

export const BUILT_IN_WORDINGS: WordingPreset[] = [
  {
    id: 'wording-appreciation',
    category: 'Appreciation',
    title: 'Institutional Appreciation',
    text: 'For outstanding participation and valuable contributions to “{{event.name}}”, organized by {{event.organizer}} in coordination with {{event.department}}, {{organization.name}}, held on {{event.dateRange}}.',
    isBuiltIn: true,
  },
  {
    id: 'wording-participation',
    category: 'Participation',
    title: 'Event Participation',
    text: 'This certificate is presented to {{recipient.name}} for actively participating in “{{event.name}}” held on {{event.dateRange}}.',
    isBuiltIn: true,
  },
  {
    id: 'wording-completion',
    category: 'Completion',
    title: 'Training Completion',
    text: 'This certifies that {{recipient.name}} has successfully completed “{{event.name}}” conducted by {{organization.name}}.',
    isBuiltIn: true,
  },
  {
    id: 'wording-achievement',
    category: 'Achievement',
    title: 'Outstanding Achievement',
    text: 'This certificate is awarded to {{recipient.name}} in recognition of outstanding achievement in “{{event.name}}”.',
    isBuiltIn: true,
  },
  {
    id: 'wording-winner',
    category: 'Winner',
    title: 'Competition Winner',
    text: 'This certificate is awarded to {{recipient.name}} for securing {{recipient.rank}} in “{{event.name}}”.',
    isBuiltIn: true,
  },
];

const STORAGE_KEY = 'certificate_wordings';

export const wordingLibrary = {
  getAll(): WordingPreset[] {
    const custom = getItem<WordingPreset[]>(STORAGE_KEY, []);
    const customIds = new Set(custom.map((w) => w.id));
    const uniqueBuiltIn = BUILT_IN_WORDINGS.filter((w) => !customIds.has(w.id));
    return [...uniqueBuiltIn, ...custom];
  },

  save(wording: WordingPreset): boolean {
    const custom = getItem<WordingPreset[]>(STORAGE_KEY, []);
    const idx = custom.findIndex((w) => w.id === wording.id);
    if (idx >= 0) {
      custom[idx] = wording;
    } else {
      custom.push(wording);
    }
    return setItem(STORAGE_KEY, custom);
  },

  delete(id: string): boolean {
    const custom = getItem<WordingPreset[]>(STORAGE_KEY, []);
    const filtered = custom.filter((w) => w.id !== id);
    return setItem(STORAGE_KEY, filtered);
  },
};
