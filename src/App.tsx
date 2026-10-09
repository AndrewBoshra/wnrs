import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Lang, Session, Settings } from './types';
import { loadSessions, loadSettings, saveSessions, saveSettings } from './storage';
import { migrateSession } from './game';
import { STRINGS } from './i18n';
import { Home } from './screens/Home';
import { Setup } from './screens/Setup';
import { Play } from './screens/Play';

type Route = { name: 'home' } | { name: 'new' } | { name: 'play'; id: string };

function parseHash(): Route {
  const h = location.hash.replace(/^#\/?/, '');
  if (h === 'new') return { name: 'new' };
  const m = h.match(/^play\/(.+)$/);
  if (m) return { name: 'play', id: m[1] };
  return { name: 'home' };
}

export const navigate = (path: string) => {
  location.hash = path;
};

export function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions().map(migrateSession));

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.lang;
    document.documentElement.dir = settings.lang === 'ar' ? 'rtl' : 'ltr';
    saveSettings(settings);
  }, [settings]);

  useEffect(() => saveSessions(sessions), [sessions]);

  const setLang = useCallback((lang: Lang) => setSettings((s) => ({ ...s, lang })), []);
  const upsertSession = useCallback((session: Session) => {
    setSessions((list) => {
      const i = list.findIndex((s) => s.id === session.id);
      if (i === -1) return [session, ...list];
      const next = list.slice();
      next[i] = session;
      return next;
    });
  }, []);
  const deleteSession = useCallback((id: string) => setSessions((list) => list.filter((s) => s.id !== id)), []);

  const t = STRINGS[settings.lang];
  const ctx = useMemo(() => ({ t, lang: settings.lang, setLang }), [t, settings.lang, setLang]);

  if (route.name === 'new') return <Setup ctx={ctx} onCreate={(s) => { upsertSession(s); navigate(`/play/${s.id}`); }} />;
  if (route.name === 'play') {
    const session = sessions.find((s) => s.id === route.id);
    if (!session) {
      navigate('/');
      return null;
    }
    return <Play ctx={ctx} session={session} onChange={upsertSession} />;
  }
  return <Home ctx={ctx} sessions={sessions} onChange={upsertSession} onDelete={deleteSession} />;
}

export type Ctx = { t: (typeof STRINGS)['en']; lang: Lang; setLang: (l: Lang) => void };
