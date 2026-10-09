import type { Card, GameConfig, PlayLevel, Session, Stage } from './types';
import { DECKS } from './data/decks';
import cardsEn from './data/cards.en.json';

export const CARDS = cardsEn as Card[];
const byId = new Map(CARDS.map((c) => [c.id, c]));
export const getCard = (id: string) => byId.get(id);

export const LEVELS: PlayLevel[] = ['L1', 'L2', 'L3'];

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deal `extras` into `base` at random positions, never as the very first card. */
function sprinkle(base: string[], extras: string[]): string[] {
  const out = base.slice();
  for (const id of extras) {
    const pos = out.length === 0 ? 0 : 1 + Math.floor(Math.random() * out.length);
    out.splice(pos, 0, id);
  }
  return out;
}

function splitEvenly<T>(items: T[], n: number): T[][] {
  const buckets: T[][] = Array.from({ length: n }, () => []);
  shuffle(items).forEach((item, i) => buckets[i % n].push(item));
  return buckets;
}

export function buildStages(config: GameConfig): Stage[] {
  const levelDecks = config.decks.filter((d) => DECKS.find((m) => m.id === d)?.kind !== 'solo');
  const soloDecks = config.decks.filter((d) => DECKS.find((m) => m.id === d)?.kind === 'solo');
  const levels = LEVELS.filter((l) => config.levels.includes(l));
  const stages: Stage[] = [];

  if (levelDecks.length && levels.length) {
    const inLevelDecks = (c: Card) => levelDecks.includes(c.deck);
    const wild = config.wildcards ? splitEvenly(CARDS.filter((c) => inLevelDecks(c) && c.level === 'wildcard').map((c) => c.id), levels.length) : [];
    const rem = config.reminders ? splitEvenly(CARDS.filter((c) => inLevelDecks(c) && c.level === 'reminder').map((c) => c.id), levels.length) : [];
    levels.forEach((level, i) => {
      const base = shuffle(CARDS.filter((c) => inLevelDecks(c) && c.level === level).map((c) => c.id));
      const ids = sprinkle(base, [...(wild[i] ?? []), ...(rem[i] ?? [])]);
      stages.push({ key: level, cardIds: ids });
    });
    if (config.finalCard) {
      const finals = CARDS.filter((c) => inLevelDecks(c) && c.level === 'final').map((c) => c.id);
      stages[stages.length - 1].cardIds.push(...finals);
    }
  }

  for (const deck of soloDecks) {
    const own = CARDS.filter((c) => c.deck === deck);
    const base = shuffle(own.filter((c) => c.level === 'none').map((c) => c.id));
    const extras = [
      ...(config.wildcards ? own.filter((c) => c.level === 'wildcard').map((c) => c.id) : []),
      ...(config.reminders ? own.filter((c) => c.level === 'reminder').map((c) => c.id) : []),
    ];
    const ids = sprinkle(base, shuffle(extras));
    if (config.finalCard) ids.push(...own.filter((c) => c.level === 'final').map((c) => c.id));
    stages.push({ key: `deck:${deck}`, cardIds: ids });
  }

  return stages.filter((s) => s.cardIds.length > 0);
}

export const countCards = (config: GameConfig) => buildStages(config).reduce((n, s) => n + s.cardIds.length, 0);

export function migrateSession(s: Session & { name?: string }): Session {
  if (Array.isArray(s.players) && s.players.length === 2) return s;
  return { ...s, players: [s.name ?? '', ''] };
}

export const playerNames = (s: Session, fallback: [string, string]): [string, string] => [
  s.players[0].trim() || fallback[0],
  s.players[1].trim() || fallback[1],
];

const isQuestion = (id: string) => {
  const l = getCard(id)?.level;
  return l === 'L1' || l === 'L2' || l === 'L3' || l === 'none';
};

/** 0 or 1 = which player answers the current card; null = a card for both (wildcard, reminder, final). */
export function whoseTurn(s: Session): 0 | 1 | null {
  if (s.finished || s.cardIndex < 0) return null;
  const current = s.stages[s.stageIndex].cardIds[s.cardIndex];
  if (!isQuestion(current)) return null;
  let n = 0;
  for (let i = 0; i < s.stageIndex; i++) n += s.stages[i].cardIds.filter(isQuestion).length;
  n += s.stages[s.stageIndex].cardIds.slice(0, s.cardIndex).filter(isQuestion).length;
  return (n % 2) as 0 | 1;
}

export function createSession(players: [string, string], config: GameConfig): Session {
  const now = Date.now();
  return {
    id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    players: [players[0].trim(), players[1].trim()],
    createdAt: now,
    updatedAt: now,
    config,
    stages: buildStages(config),
    stageIndex: 0,
    cardIndex: -1,
    finished: false,
  };
}

export const totalCards = (s: Session) => s.stages.reduce((n, st) => n + st.cardIds.length, 0);
export const cardsSeen = (s: Session) =>
  s.finished ? totalCards(s) : s.stages.slice(0, s.stageIndex).reduce((n, st) => n + st.cardIds.length, 0) + Math.max(0, s.cardIndex);

export function stepForward(s: Session): Session {
  if (s.finished) return s;
  const stage = s.stages[s.stageIndex];
  if (s.cardIndex < stage.cardIds.length - 1) return { ...s, cardIndex: s.cardIndex + 1, updatedAt: Date.now() };
  if (s.stageIndex < s.stages.length - 1) return { ...s, stageIndex: s.stageIndex + 1, cardIndex: -1, updatedAt: Date.now() };
  return { ...s, finished: true, updatedAt: Date.now() };
}

export function stepBack(s: Session): Session {
  if (s.finished) {
    const last = s.stages[s.stages.length - 1];
    return { ...s, finished: false, stageIndex: s.stages.length - 1, cardIndex: last.cardIds.length - 1, updatedAt: Date.now() };
  }
  if (s.cardIndex > -1) return { ...s, cardIndex: s.cardIndex - 1, updatedAt: Date.now() };
  if (s.stageIndex > 0) {
    const prev = s.stages[s.stageIndex - 1];
    return { ...s, stageIndex: s.stageIndex - 1, cardIndex: prev.cardIds.length - 1, updatedAt: Date.now() };
  }
  return s;
}

export const restartSession = (s: Session): Session => ({
  ...s,
  stages: buildStages(s.config),
  stageIndex: 0,
  cardIndex: -1,
  finished: false,
  updatedAt: Date.now(),
});
