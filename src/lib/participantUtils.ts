import { ParticipantCategory, Recipient } from '@/types';

export interface ParticipantItem {
  id: string;
  name: string;
  email: string;
  department: string;
  registrationNumber: string;
  category: ParticipantCategory;
  selected: boolean;
  achievement?: string;
  rawRecipient: Recipient;
}

/**
 * Normalizes a raw category string or infers category from achievement
 */
export function getNormalizedCategory(recipient: Partial<Recipient>): ParticipantCategory {
  if (recipient.category && recipient.category.trim()) {
    const cat = recipient.category.trim().toLowerCase();
    if (cat === 'winner' || cat === 'winners') return 'winner';
    if (cat === 'runner' || cat === 'runners' || cat === 'runner up' || cat === 'runners up') return 'runner';
    if (cat === 'participant' || cat === 'participants') return 'participant';
    return recipient.category.trim();
  }

  // Fallback inference from achievement
  const ach = (recipient.achievement || '').toLowerCase();
  if (ach.includes('winner') || ach.includes('first place') || ach.includes('1st place') || ach.includes('gold')) {
    return 'winner';
  }
  if (ach.includes('runner') || ach.includes('second place') || ach.includes('2nd place') || ach.includes('third place') || ach.includes('silver') || ach.includes('bronze')) {
    return 'runner';
  }

  return 'participant';
}

/**
 * Capitalize category name for UI header display
 */
export function getCategoryDisplayTitle(categoryKey: string): string {
  const normalized = categoryKey.trim().toLowerCase();
  if (normalized === 'winner' || normalized === 'winners') return 'Winners';
  if (normalized === 'runner' || normalized === 'runners') return 'Runners';
  if (normalized === 'participant' || normalized === 'participants') return 'Participants';

  // Capitalize custom categories (e.g. "special mention" -> "Special Mention")
  return categoryKey
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get category badge color styling for UI
 */
export function getCategoryBadgeStyle(categoryKey: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  accent: string;
} {
  const normalized = categoryKey.trim().toLowerCase();
  if (normalized === 'winner' || normalized === 'winners') {
    return {
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#92400E]',
      border: 'border-[#FCD34D]',
      dot: 'bg-[#F59E0B]',
      accent: '#F59E0B',
    };
  }
  if (normalized === 'runner' || normalized === 'runners') {
    return {
      bg: 'bg-[#F5F3FF]',
      text: 'text-[#5B21B6]',
      border: 'border-[#C4B5FD]',
      dot: 'bg-[#8B5CF6]',
      accent: '#8B5CF6',
    };
  }
  if (normalized === 'participant' || normalized === 'participants') {
    return {
      bg: 'bg-[#ECFEFF]',
      text: 'text-[#155E75]',
      border: 'border-[#67E8F9]',
      dot: 'bg-[#06B6D4]',
      accent: '#06B6D4',
    };
  }
  return {
    bg: 'bg-[#F8FAFC]',
    text: 'text-[#475569]',
    border: 'border-[#E2E8F0]',
    dot: 'bg-[#94A3B8]',
    accent: '#64748B',
  };
}

/**
 * Group participants by category with standard priority ordering:
 * Winners -> Runners -> Participants -> Custom Categories
 */
export function groupParticipantsByCategory<T extends { category: string }>(
  items: T[]
): Array<{ categoryKey: string; displayTitle: string; items: T[] }> {
  const categoryMap = new Map<string, T[]>();

  items.forEach((item) => {
    const key = item.category || 'participant';
    const existing = categoryMap.get(key) || [];
    existing.push(item);
    categoryMap.set(key, existing);
  });

  // Standard category priority
  const standardPriority = ['winner', 'runner', 'participant'];

  const sortedKeys = Array.from(categoryMap.keys()).sort((a, b) => {
    const aNorm = a.toLowerCase();
    const bNorm = b.toLowerCase();

    const aIdx = standardPriority.indexOf(aNorm);
    const bIdx = standardPriority.indexOf(bNorm);

    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((key) => ({
    categoryKey: key,
    displayTitle: getCategoryDisplayTitle(key),
    items: categoryMap.get(key) || [],
  }));
}

/**
 * Returns the proper certificate category title based on recipient category
 * e.g. "Certificate of Achievement", "Certificate of Merit", "Certificate of Participation"
 */
export function getCertificateCategoryTitle(categoryKey?: string, defaultCertType?: string): string {
  const norm = (categoryKey || '').trim().toLowerCase();
  if (norm === 'winner' || norm === 'winners' || norm.includes('winner') || norm.includes('1st')) {
    return 'Certificate of Achievement';
  }
  if (norm === 'runner' || norm === 'runners' || norm.includes('runner') || norm.includes('2nd') || norm.includes('3rd')) {
    return 'Certificate of Merit';
  }
  if (norm === 'participant' || norm === 'participants' || norm === 'participated') {
    return defaultCertType ? `Certificate of ${defaultCertType}` : 'Certificate of Participation';
  }
  if (norm) {
    return `Certificate of ${getCategoryDisplayTitle(norm)}`;
  }
  return defaultCertType ? `Certificate of ${defaultCertType}` : 'Certificate of Participation';
}

/**
 * Returns the uppercase main title for certificate headers
 * e.g. "CERTIFICATE OF ACHIEVEMENT", "CERTIFICATE OF MERIT", "CERTIFICATE OF PARTICIPATION"
 */
export function getCertificateMainTitle(categoryKey?: string, defaultCertType?: string): string {
  const norm = (categoryKey || '').trim().toLowerCase();
  if (norm === 'winner' || norm === 'winners' || norm.includes('winner') || norm.includes('1st')) {
    return 'CERTIFICATE OF ACHIEVEMENT';
  }
  if (norm === 'runner' || norm === 'runners' || norm.includes('runner') || norm.includes('2nd') || norm.includes('3rd')) {
    return 'CERTIFICATE OF MERIT';
  }
  if (norm === 'participant' || norm === 'participants' || norm === 'participated') {
    return defaultCertType ? `CERTIFICATE OF ${defaultCertType.toUpperCase()}` : 'CERTIFICATE OF PARTICIPATION';
  }
  if (norm) {
    return `CERTIFICATE OF ${getCategoryDisplayTitle(norm).toUpperCase()}`;
  }
  return defaultCertType ? `CERTIFICATE OF ${defaultCertType.toUpperCase()}` : 'CERTIFICATE OF PARTICIPATION';
}

/**
 * Returns formatted role badge label for certificates (Winner, Runner-Up, Participant, etc.)
 */
export function getCertificateRoleLabel(categoryKey?: string, achievement?: string): string {
  if (achievement && achievement.trim() && achievement.toLowerCase() !== 'participant') {
    return achievement.trim();
  }
  const norm = (categoryKey || '').trim().toLowerCase();
  if (norm === 'winner' || norm === 'winners' || norm.includes('winner')) {
    return 'Winner';
  }
  if (norm === 'runner' || norm === 'runners' || norm.includes('runner')) {
    return 'Runner-Up';
  }
  if (norm === 'participant' || norm === 'participants' || norm === 'participated') {
    return 'Participant';
  }
  if (norm) {
    return getCategoryDisplayTitle(norm);
  }
  return 'Participant';
}

/**
 * Returns formatted rank badge label for templates with rank placeholders
 */
export function getCertificateRankLabel(categoryKey?: string, achievement?: string): string {
  if (achievement && achievement.trim() && achievement.toLowerCase() !== 'participant') {
    return achievement.trim();
  }
  const norm = (categoryKey || '').trim().toLowerCase();
  if (norm === 'winner' || norm === 'winners' || norm.includes('winner')) {
    return '1st Place Winner';
  }
  if (norm === 'runner' || norm === 'runners' || norm.includes('runner')) {
    return '2nd Place Runner';
  }
  if (norm === 'participant' || norm === 'participants' || norm === 'participated') {
    return 'Participant';
  }
  if (norm) {
    return getCategoryDisplayTitle(norm);
  }
  return 'Participant';
}

