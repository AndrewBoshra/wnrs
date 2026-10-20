import { useMemo, useState } from 'react';
import type { GameConfig, PlayLevel, Session } from '../types';
import type { Ctx } from '../App';
import { gameProps, navigate } from '../App';
import { identifyPlayers, track } from '../analytics';
import { TopBar } from '../components/TopBar';
import { DECKS } from '../data/decks';
import { CARDS, LEVELS, countCards, createSession } from '../game';

const deckSize = (id: string) => CARDS.filter((c) => c.deck === id).length;

export function Setup({ ctx, onCreate }: { ctx: Ctx; onCreate: (s: Session) => void }) {
  const { t, lang } = ctx;
  const [players, setPlayers] = useState<[string, string]>(['', '']);
  const [config, setConfig] = useState<GameConfig>({ decks: ['main'], levels: ['L1', 'L2', 'L3'], wildcards: true, reminders: true, finalCard: true });

  const toggleDeck = (id: string) =>
    setConfig((c) => ({ ...c, decks: c.decks.includes(id) ? c.decks.filter((d) => d !== id) : [...c.decks, id] }));
  const toggleLevel = (l: PlayLevel) =>
    setConfig((c) => ({ ...c, levels: c.levels.includes(l) ? c.levels.filter((x) => x !== l) : [...c.levels, l] }));

  const total = useMemo(() => countCards(config), [config]);
  const canStart = total > 0;

  const Check = ({ checked, onChange, title, hint, count }: { checked: boolean; onChange: () => void; title: string; hint?: string; count?: number }) => (
    <label className={`check ${checked ? 'on' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="check-box" aria-hidden="true" />
      <span className="check-body">
        <span className="check-title">
          {title}
          {count !== undefined && <span className="count">{count}</span>}
        </span>
        {hint && <span className="muted small">{hint}</span>}
      </span>
    </label>
  );

  return (
    <div className="page">
      <TopBar
        ctx={ctx}
        left={
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            {t.cancel}
          </button>
        }
        center={<strong>{t.setupTitle}</strong>}
      />
      <main className="container narrow">
        <section>
          <h2>{t.playersLabel}</h2>
          <p className="muted small">{t.playersHint}</p>
          <div className="players">
            <div className="field">
              <label htmlFor="p1">{t.player1}</label>
              <input id="p1" value={players[0]} onChange={(e) => setPlayers([e.target.value, players[1]])} placeholder={t.player1Placeholder} autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="p2">{t.player2}</label>
              <input id="p2" value={players[1]} onChange={(e) => setPlayers([players[0], e.target.value])} placeholder={t.player2Placeholder} autoComplete="off" />
            </div>
          </div>
        </section>

        <section>
          <h2>{t.levelsLabel}</h2>
          <p className="muted small">{t.levelsHint}</p>
          {LEVELS.map((l) => (
            <Check key={l} checked={config.levels.includes(l)} onChange={() => toggleLevel(l)} title={`${t.level[l]} · ${t.levelName[l]}`} hint={t.levelBlurb[l]} />
          ))}
        </section>

        <section>
          <h2>{t.decksLabel}</h2>
          {DECKS.filter((d) => d.kind === 'core').map((d) => (
            <Check key={d.id} checked={config.decks.includes(d.id)} onChange={() => toggleDeck(d.id)} title={d.name[lang]} hint={d.blurb[lang]} count={deckSize(d.id)} />
          ))}
          <h3>{t.expansionsLabel}</h3>
          <p className="muted small">{t.expansionsHint}</p>
          {DECKS.filter((d) => d.kind === 'expansion').map((d) => (
            <Check key={d.id} checked={config.decks.includes(d.id)} onChange={() => toggleDeck(d.id)} title={d.name[lang]} hint={d.blurb[lang]} count={deckSize(d.id)} />
          ))}
          <h3>{t.soloLabel}</h3>
          <p className="muted small">{t.soloHint}</p>
          {DECKS.filter((d) => d.kind === 'solo').map((d) => (
            <Check key={d.id} checked={config.decks.includes(d.id)} onChange={() => toggleDeck(d.id)} title={d.name[lang]} hint={d.blurb[lang]} count={deckSize(d.id)} />
          ))}
        </section>

        <section>
          <h2>{t.extrasLabel}</h2>
          <Check checked={config.wildcards} onChange={() => setConfig((c) => ({ ...c, wildcards: !c.wildcards }))} title={t.wildcards} hint={t.wildcardsHint} />
          <Check checked={config.reminders} onChange={() => setConfig((c) => ({ ...c, reminders: !c.reminders }))} title={t.reminders} hint={t.remindersHint} />
          <Check checked={config.finalCard} onChange={() => setConfig((c) => ({ ...c, finalCard: !c.finalCard }))} title={t.finalCard} hint={t.finalCardHint} />
        </section>
      </main>
      <div className="sticky-footer">
        <div className="container narrow row" dir="ltr">
          <span className={`muted ${canStart ? '' : 'warn'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>{canStart ? t.totalCards(total) : t.needSomething}</span>
          <button className="btn btn-primary btn-lg" disabled={!canStart} onClick={() => {
              const s = createSession(players, config);
              identifyPlayers(s.players);
              track('game_created', { ...gameProps(s), lang });
              onCreate(s);
            }}>
            {t.start}
          </button>
        </div>
      </div>
    </div>
  );
}
