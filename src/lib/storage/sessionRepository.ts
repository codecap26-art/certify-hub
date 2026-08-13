import { SessionState } from '@/types';
import { getItem, setItem, removeItem } from './repository';

const SESSION_KEY = 'demo_session';

export const sessionRepository = {
  get(): SessionState | null {
    return getItem<SessionState | null>(SESSION_KEY, null);
  },
  login(email: string): boolean {
    const state: SessionState = {
      isLoggedIn: true,
      email,
      loginAt: new Date().toISOString(),
    };
    return setItem<SessionState>(SESSION_KEY, state);
  },
  logout(): void {
    removeItem(SESSION_KEY);
  },
};
