import { EventItem } from '@/types';
import { getItem, setItem } from './repository';

const EVENTS_KEY = 'events';

export const eventRepository = {
  getAll(): EventItem[] {
    return getItem<EventItem[]>(EVENTS_KEY, []);
  },
  getById(id: string): EventItem | undefined {
    const events = this.getAll();
    return events.find((e) => e.id === id);
  },
  save(event: EventItem): boolean {
    const events = this.getAll();
    const index = events.findIndex((e) => e.id === event.id);
    if (index >= 0) {
      events[index] = { ...event, updatedAt: new Date().toISOString() };
    } else {
      events.unshift(event);
    }
    return setItem<EventItem[]>(EVENTS_KEY, events);
  },
  delete(id: string): boolean {
    const events = this.getAll();
    const filtered = events.filter((e) => e.id !== id);
    return setItem<EventItem[]>(EVENTS_KEY, filtered);
  },
  saveAll(events: EventItem[]): boolean {
    return setItem<EventItem[]>(EVENTS_KEY, events);
  },
};
