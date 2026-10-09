import { useEffect, useRef, useState } from 'react';
import type { Lang, Session } from '../types';
import type { Ctx } from '../App';
import { navigate } from '../App';
import { TopBar } from '../components/TopBar';
import { CardView } from '../components/CardView';
import { deckById } from '../data/decks';
import { cardsSeen, getCard, playerNames, restartSession, stepBack, stepForward, totalCards, whoseTurn } from '../game';

function stageTitle(ctx: Ctx, key: string) {
  const { t, lang } = ctx;
  if (key.startsWith('deck:')) {
    const d = deckById(key.slice(5));
    return { title: d?.name[lang] ?? key, sub: d?.blurb[lang] ?? '' };
  }
  return { title: `${t.level[key]} · ${t.levelName[key]}`, sub: t.levelBlurb[key] };
}

export function Play({ ctx, session, onChange }: { ctx: Ctx; session: Session; onChange: (s: Session) => void }) {
  const { t } = ctx;
  const [cardLang, setCardLang] = useState<Lang>(ctx.lang);
  const [anim, setAnim] = useState<'' | 'next' | 'back'>('');
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setCardLang(ctx.lang), [ctx.lang]);

  const stage = session.stages[session.stageIndex];
  const card = !session.finished && session.cardIndex >= 0 ? getCard(stage.cardIds[session.cardIndex]) : undefined;
  const seen = cardsSeen(session);
  const total = totalCards(session);
  const atStart = session.stageIndex === 0 && session.cardIndex === -1;
  const names = playerNames(session, [t.player1, t.player2]);
  const turn = whoseTurn(session);

  const go = (dir: 'next' | 'back') => {
    const next = dir === 'next' ? stepForward(session) : stepBack(session);
    if (next === session) return;
    setAnim(dir);
    setCardLang(ctx.lang);
    onChange(next);
    window.setTimeout(() => setAnim(''), 220);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') go('next');
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') go('back');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    const forward = ctx.lang === 'ar' ? dx > 0 : dx < 0;
    go(forward ? 'next' : 'back');
  };

  return (
    <div className="page play" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <TopBar
        ctx={ctx}
        left={
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            ← {t.home}
          </button>
        }
        center={
          <div className="play-title">
            <strong><bdi>{names[0]}</bdi> {t.and} <bdi>{names[1]}</bdi></strong>
            <span className="muted small" dir="ltr">{t.progress(Math.min(seen + (card ? 1 : 0), total), total)}</span>
          </div>
        }
      />
      <div className="bar thin" aria-hidden="true">
        <div className="bar-fill" style={{ width: `${total ? ((seen + (card ? 1 : 0)) / total) * 100 : 0}%` }} />
      </div>

      <main className="stage">
        <div className={`stage-inner ${anim ? `anim-${anim}` : ''}`} key={`${session.stageIndex}:${session.cardIndex}:${session.finished}`}>
          {session.finished ? (
            <div className="intro">
              <div className="intro-eyebrow">{t.appName}</div>
              <h1>{t.done}</h1>
              <p className="muted">{t.doneBlurb}</p>
              <div className="intro-actions">
                <button className="btn btn-primary btn-lg" onClick={() => onChange(restartSession(session))}>
                  {t.playAgain}
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                  {t.backHome}
                </button>
              </div>
            </div>
          ) : card ? (
            <>
              <div className={`turn ${turn === null ? 'both' : ''}`} key={turn ?? 'both'}>
                {turn === null ? t.bothTurn : <bdi>{t.turnOf(names[turn])}</bdi>}
              </div>
              <CardView card={card} ctx={ctx} lang={cardLang} flipLang={() => setCardLang((l) => (l === 'ar' ? 'en' : 'ar'))} />
            </>
          ) : (
            <div className="intro">
              <div className="intro-eyebrow">
                {t.stageIntro} {session.stageIndex + 1} / {session.stages.length}
              </div>
              <h1>{stageTitle(ctx, stage.key).title}</h1>
              <p className="muted">{stageTitle(ctx, stage.key).sub}</p>
              <p className="muted small">{t.cardsLeft(stage.cardIds.length)}</p>
              <div className="intro-actions">
                <button className="btn btn-primary btn-lg" onClick={() => go('next')}>
                  {t.begin}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <nav className="controls" dir="ltr">
        <button className="btn btn-ghost" onClick={() => go('back')} disabled={atStart}>
          {t.back}
        </button>
        <span className="muted small hint">{t.swipeHint}</span>
        <button className="btn btn-primary" onClick={() => go('next')} disabled={session.finished}>
          {t.next}
        </button>
      </nav>
    </div>
  );
}
