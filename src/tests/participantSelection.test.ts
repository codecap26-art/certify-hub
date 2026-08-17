import { describe, it, expect } from 'vitest';
import {
  getNormalizedCategory,
  groupParticipantsByCategory,
  getCategoryDisplayTitle,
  ParticipantItem,
} from '@/lib/participantUtils';
import { Recipient } from '@/types';

describe('Category-Wise Participant Selection Architecture', () => {
  it('correctly normalizes categories with fallback to achievement', () => {
    const winnerExplicit: Partial<Recipient> = { category: 'winner', achievement: 'Participant' };
    expect(getNormalizedCategory(winnerExplicit)).toBe('winner');

    const winnerInferred: Partial<Recipient> = { achievement: 'First Place - Coding Hackathon' };
    expect(getNormalizedCategory(winnerInferred)).toBe('winner');

    const runnerInferred: Partial<Recipient> = { achievement: 'Second Place - UI Contest' };
    expect(getNormalizedCategory(runnerInferred)).toBe('runner');

    const defaultParticipant: Partial<Recipient> = {};
    expect(getNormalizedCategory(defaultParticipant)).toBe('participant');

    const customCategory: Partial<Recipient> = { category: 'Special Mention' };
    expect(getNormalizedCategory(customCategory)).toBe('Special Mention');
  });

  it('formats display titles accurately', () => {
    expect(getCategoryDisplayTitle('winner')).toBe('Winners');
    expect(getCategoryDisplayTitle('runner')).toBe('Runners');
    expect(getCategoryDisplayTitle('participant')).toBe('Participants');
    expect(getCategoryDisplayTitle('best performer')).toBe('Best Performer');
  });

  it('groups participants with standard priority ordering: Winner -> Runner -> Participant -> Custom', () => {
    const participants: Array<{ id: string; category: string; name: string }> = [
      { id: '1', category: 'participant', name: 'Arun' },
      { id: '2', category: 'winner', name: 'Subash' },
      { id: '3', category: 'runner', name: 'Rahul' },
      { id: '4', category: 'volunteer', name: 'Karthik' },
    ];

    const grouped = groupParticipantsByCategory(participants);

    expect(grouped.length).toBe(4);
    expect(grouped[0].categoryKey).toBe('winner');
    expect(grouped[0].displayTitle).toBe('Winners');
    expect(grouped[1].categoryKey).toBe('runner');
    expect(grouped[1].displayTitle).toBe('Runners');
    expect(grouped[2].categoryKey).toBe('participant');
    expect(grouped[2].displayTitle).toBe('Participants');
    expect(grouped[3].categoryKey).toBe('volunteer');
    expect(grouped[3].displayTitle).toBe('Volunteer');
  });

  it('handles independent category selection toggles', () => {
    const mockItems: ParticipantItem[] = [
      { id: 'w1', name: 'Subash P', email: 'subash@ex.com', department: 'CSE', registrationNumber: '23CS101', category: 'winner', selected: false, rawRecipient: {} as any },
      { id: 'w2', name: 'Arun K', email: 'arun@ex.com', department: 'CSE', registrationNumber: '23CS102', category: 'winner', selected: false, rawRecipient: {} as any },
      { id: 'r1', name: 'Rahul K', email: 'rahul@ex.com', department: 'ECE', registrationNumber: '23CS103', category: 'runner', selected: true, rawRecipient: {} as any },
      { id: 'p1', name: 'Kavin R', email: 'kavin@ex.com', department: 'IT', registrationNumber: '23CS104', category: 'participant', selected: false, rawRecipient: {} as any },
    ];

    const currentlySelectedIds = ['r1'];
    const winnerIds = mockItems.filter((i) => i.category === 'winner').map((i) => i.id);

    // Toggle Select All for Winner category
    const isWinnerAllSelected = winnerIds.every((id) => currentlySelectedIds.includes(id));
    expect(isWinnerAllSelected).toBe(false);

    const newSelectedIds = Array.from(new Set([...currentlySelectedIds, ...winnerIds]));
    expect(newSelectedIds).toEqual(['r1', 'w1', 'w2']);

    // Ensure Runner selection remains intact while Winners are selected
    expect(newSelectedIds.includes('r1')).toBe(true);
    expect(newSelectedIds.includes('p1')).toBe(false);
  });

  it('supports creating recipient with explicit role category (winner, runner, participant)', () => {
    const createRecipient = (name: string, category: 'winner' | 'runner' | 'participant') => {
      let achievement = 'Participant';
      if (category === 'winner') achievement = 'Winner';
      if (category === 'runner') achievement = 'Runner';

      return {
        id: 'rec-test-1',
        fullName: name,
        category,
        achievement,
      };
    };

    const winnerRec = createRecipient('Subash P', 'winner');
    expect(winnerRec.category).toBe('winner');
    expect(winnerRec.achievement).toBe('Winner');
    expect(getNormalizedCategory(winnerRec as any)).toBe('winner');

    const runnerRec = createRecipient('Rahul K', 'runner');
    expect(runnerRec.category).toBe('runner');
    expect(runnerRec.achievement).toBe('Runner');
    expect(getNormalizedCategory(runnerRec as any)).toBe('runner');

    const participantRec = createRecipient('Kavin R', 'participant');
    expect(participantRec.category).toBe('participant');
    expect(participantRec.achievement).toBe('Participant');
    expect(getNormalizedCategory(participantRec as any)).toBe('participant');
  });
});
