import { Recipient } from '@/types';
import { getItem, setItem } from './repository';

const RECIPIENTS_KEY = 'recipients';

export const recipientRepository = {
  getAll(): Recipient[] {
    return getItem<Recipient[]>(RECIPIENTS_KEY, []);
  },
  getByEventId(eventId: string): Recipient[] {
    const all = this.getAll();
    return all.filter((r) => r.eventId === eventId);
  },
  getById(id: string): Recipient | undefined {
    const all = this.getAll();
    return all.find((r) => r.id === id);
  },
  save(recipient: Recipient): boolean {
    const all = this.getAll();
    const index = all.findIndex((r) => r.id === recipient.id);
    if (index >= 0) {
      all[index] = { ...recipient, updatedAt: new Date().toISOString() };
    } else {
      all.unshift(recipient);
    }
    return setItem<Recipient[]>(RECIPIENTS_KEY, all);
  },
  saveBatch(recipients: Recipient[]): boolean {
    const all = this.getAll();
    const map = new Map<string, Recipient>(all.map((r) => [r.id, r]));
    recipients.forEach((r) => map.set(r.id, r));
    return setItem<Recipient[]>(RECIPIENTS_KEY, Array.from(map.values()));
  },
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((r) => r.id !== id);
    return setItem<Recipient[]>(RECIPIENTS_KEY, filtered);
  },
  deleteByEventId(eventId: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((r) => r.eventId !== eventId);
    return setItem<Recipient[]>(RECIPIENTS_KEY, filtered);
  },
  saveAll(recipients: Recipient[]): boolean {
    return setItem<Recipient[]>(RECIPIENTS_KEY, recipients);
  },
};
