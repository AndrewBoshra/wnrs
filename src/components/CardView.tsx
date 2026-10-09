import type { Card, Lang } from '../types';
import type { Ctx } from '../App';
import { cardText, hasArabic } from '../cardText';
import { deckById } from '../data/decks';

export function CardView({ card, ctx, lang, flipLang }: { card: Card; ctx: Ctx; lang: Lang; flipLang?: () => void }) {
  const t = ctx.t;
  const deck = deckById(card.deck);
  const kind = card.level === 'wildcard' ? 'wild' : card.level === 'reminder' ? 'reminder' : card.level === 'final' ? 'final' : 'q';
  const text = cardText(card, lang);
  const textIsAr = lang === 'ar' && hasArabic(card);
  const typeLabel = t.cardType[card.level];
  return (
    // The frame (header/footer) follows the UI language so its labels and the flip button never move;
    // only the card text itself follows the language it is shown in.
    <article className={`card card-${kind}`} dir={ctx.lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="card-top">
        <span>{t.appName}</span>
        <span>{deck?.name[ctx.lang]}</span>
      </div>
      <p className={`card-text ${textIsAr ? 'ar' : 'en'} ${text.length > 110 ? 'long' : ''}`} dir={textIsAr ? 'rtl' : 'ltr'} lang={textIsAr ? 'ar' : 'en'}>
        {text}
      </p>
      <div className="card-bottom">
        <span>{typeLabel || deck?.name[ctx.lang]}</span>
        {ctx.lang === 'ar' && hasArabic(card) && flipLang && (
          <button className="card-flip" onClick={flipLang}>
            {lang === 'ar' ? t.showOriginal : t.hideOriginal}
          </button>
        )}
      </div>
    </article>
  );
}
