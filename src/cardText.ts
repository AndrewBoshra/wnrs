import type { Card, Lang } from './types';
import ar from './data/cards.ar.json';

const AR = ar as Record<string, string>;

export const cardText = (card: Card, lang: Lang) => (lang === 'ar' && AR[card.id]) || card.text;
export const hasArabic = (card: Card) => Boolean(AR[card.id]);
