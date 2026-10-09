import type { Session } from '../types';
import type { Ctx } from '../App';
import { navigate } from '../App';
import { TopBar } from '../components/TopBar';
import { deckById } from '../data/decks';
import { cardsSeen, playerNames, restartSession, totalCards } from '../game';

export function Home({ ctx, sessions, onChange, onDelete }: { ctx: Ctx; sessions: Session[]; onChange: (s: Session) => void; onDelete: (id: string) => void }) {
  const { t, lang } = ctx;
  const sorted = sessions.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div className="page">
      <TopBar ctx={ctx} />
      <main className="container">
        <section className="hero">
          <div className="hero-card" aria-hidden="true">
            <span>{t.appName}</span>
          </div>
          <h1>{t.appName}</h1>
          <p className="muted">{t.tagline}</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/new')}>
            {t.newGame}
          </button>
        </section>

        <section>
          <h2>{t.yourGames}</h2>
          {sorted.length === 0 && <p className="muted">{t.noGames}</p>}
          <ul className="session-list">
            {sorted.map((s) => {
              const seen = cardsSeen(s);
              const total = totalCards(s);
              const pct = total ? Math.round((seen / total) * 100) : 0;
              return (
                <li key={s.id} className="session">
                  <div className="session-main" onClick={() => navigate(`/play/${s.id}`)} role="button" tabIndex={0}>
                    <div className="session-title">
                      <strong><bdi>{playerNames(s, [t.player1, t.player2])[0]}</bdi> {t.and} <bdi>{playerNames(s, [t.player1, t.player2])[1]}</bdi></strong>
                      {s.finished && <span className="tag">{t.finishedTag}</span>}
                    </div>
                    <div className="session-decks muted">
                      {s.config.decks.map((d) => deckById(d)?.name[lang]).filter(Boolean).join(' · ')}
                    </div>
                    <div className="bar" aria-hidden="true">
                      <div className="bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="muted small">{s.finished ? t.finishedTag : t.cardsLeft(total - seen)}</div>
                  </div>
                  <div className="session-actions">
                    <button className="btn btn-primary" onClick={() => navigate(`/play/${s.id}`)}>
                      {t.continueGame}
                    </button>
                    <button className="btn btn-ghost" onClick={() => confirm(t.restartConfirm) && onChange(restartSession(s))}>
                      {t.restart}
                    </button>
                    <button className="btn btn-ghost danger" onClick={() => confirm(t.deleteConfirm) && onDelete(s.id)}>
                      {t.delete}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
        <footer className="muted small">{t.madeWith}</footer>
      </main>
    </div>
  );
}
