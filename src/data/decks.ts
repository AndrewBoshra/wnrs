import type { Lang } from '../types';

export type DeckKind = 'core' | 'expansion' | 'solo';

export interface DeckMeta {
  id: string;
  kind: DeckKind;
  name: Record<Lang, string>;
  blurb: Record<Lang, string>;
}

// 'core' and 'expansion' decks have Level 1/2/3 cards and get merged into the levels.
// 'solo' decks have no levels and are played as their own round after the levels.
export const DECKS: DeckMeta[] = [
  { id: 'main', kind: 'core', name: { en: 'Main deck', ar: 'المجموعة الأساسية' }, blurb: { en: 'The original deck: three levels of questions.', ar: 'المجموعة الأصلية: 3 مستويات من الأسئلة.' } },
  { id: 'honest-dating', kind: 'expansion', name: { en: 'Honest Dating', ar: 'الديتنج بصراحة' }, blurb: { en: 'For two people getting to know each other romantically.', ar: 'لشخصين لسه بيتعرفوا على بعض بشكل رومانسي.' } },
  { id: 'relationship', kind: 'expansion', name: { en: 'Relationship', ar: 'العلاقة' }, blurb: { en: 'For couples who want to go deeper.', ar: 'للأزواج اللي عايزين يعمّقوا علاقتهم.' } },
  { id: 'inner-circle', kind: 'expansion', name: { en: 'Inner Circle', ar: 'الدايرة المقرّبة' }, blurb: { en: 'For close friends.', ar: 'للأصحاب المقرّبين.' } },
  { id: 'quarantine', kind: 'expansion', name: { en: 'Quarantine', ar: 'الحجر الصحي' }, blurb: { en: 'Questions written for lockdown days.', ar: 'أسئلة اتكتبت أيام الحجر.' } },
  { id: 'race-privilege', kind: 'expansion', name: { en: 'Race & Privilege', ar: 'العِرق والامتيازات' }, blurb: { en: 'Honest conversations about race and privilege.', ar: 'كلام صريح عن العِرق والامتيازات.' } },
  { id: 'bumble', kind: 'expansion', name: { en: 'Bumble edition', ar: 'نسخة Bumble' }, blurb: { en: 'Dating questions from the Bumble collab.', ar: 'أسئلة ديتنج من تعاون Bumble.' } },
  { id: 'cann', kind: 'expansion', name: { en: 'Cann edition', ar: 'نسخة Cann' }, blurb: { en: 'Light, playful questions from the Cann collab.', ar: 'أسئلة خفيفة ولطيفة من تعاون Cann.' } },
  { id: 'breakup', kind: 'solo', name: { en: 'Breakup', ar: 'الانفصال' }, blurb: { en: 'Reflect on a breakup and heal from it.', ar: 'فكّر في انفصال وابدأ تتعافى منه.' } },
  { id: 'healing', kind: 'solo', name: { en: 'Healing', ar: 'التعافي' }, blurb: { en: 'Check in with your mental health.', ar: 'اطمن على صحتك النفسية.' } },
  { id: 'forgiveness', kind: 'solo', name: { en: 'Forgiveness', ar: 'المسامحة' }, blurb: { en: 'Forgiving others, and yourself.', ar: 'تسامح الناس، وتسامح نفسك.' } },
  { id: 'own-it', kind: 'solo', name: { en: 'Own It', ar: 'اتحمّل مسؤوليتك' }, blurb: { en: 'Take ownership of your story.', ar: 'اتحمّل مسؤولية حكايتك.' } },
  { id: 'voting', kind: 'solo', name: { en: 'Voting', ar: 'التصويت' }, blurb: { en: 'Talk politics without losing each other.', ar: 'اتكلموا في السياسة من غير ما تخسروا بعض.' } },
];

export const deckById = (id: string) => DECKS.find((d) => d.id === id);
