export type Lang = 'en' | 'ar';
export type Level = 'L1' | 'L2' | 'L3' | 'wildcard' | 'reminder' | 'final' | 'none';
export type PlayLevel = 'L1' | 'L2' | 'L3';

export interface Card {
  id: string;
  deck: string;
  level: Level;
  text: string;
}

export interface GameConfig {
  decks: string[];
  levels: PlayLevel[];
  wildcards: boolean;
  reminders: boolean;
  finalCard: boolean;
}

export interface Stage {
  key: string; // e.g. "L1" | "deck:breakup"
  cardIds: string[];
}

export interface Session {
  id: string;
  /** Two player names. Older saves had a single `name`; see migrateSession. */
  players: [string, string];
  name?: string;
  createdAt: number;
  updatedAt: number;
  config: GameConfig;
  stages: Stage[];
  stageIndex: number;
  cardIndex: number; // -1 = stage intro screen
  finished: boolean;
}

export interface Settings {
  lang: Lang;
}
