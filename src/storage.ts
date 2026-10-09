import type { Session, Settings } from './types';

const SESSIONS_KEY = 'wnrs:v1:sessions';
const SETTINGS_KEY = 'wnrs:v1:settings';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode); the game still plays in memory */
  }
}

export const loadSessions = (): Session[] => read<Session[]>(SESSIONS_KEY, []);
export const saveSessions = (s: Session[]) => write(SESSIONS_KEY, s);

const defaultSettings: Settings = {
  lang: typeof navigator !== 'undefined' && /^ar/i.test(navigator.language) ? 'ar' : 'en',
};
export const loadSettings = (): Settings => ({ ...defaultSettings, ...read<Partial<Settings>>(SETTINGS_KEY, {}) });
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);
