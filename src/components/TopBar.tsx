import type { ReactNode } from 'react';
import type { Ctx } from '../App';

export function LangToggle({ ctx }: { ctx: Ctx }) {
  const next = ctx.lang === 'en' ? 'ar' : 'en';
  return (
    <button className="btn btn-ghost lang" onClick={() => ctx.setLang(next)} aria-label={ctx.t.language} title={ctx.t.language}>
      {next === 'ar' ? 'عربي' : 'EN'}
    </button>
  );
}

export function TopBar({ ctx, left, center, right }: { ctx: Ctx; left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  // The bar is laid out left-to-right in both languages so buttons never move; only the text inside follows the language.
  const dir = ctx.lang === 'ar' ? 'rtl' : 'ltr';
  return (
    <header className="topbar" dir="ltr">
      <div className="topbar-side">{left}</div>
      <div className="topbar-center" dir={dir}>{center}</div>
      <div className="topbar-side end">
        {right}
        <LangToggle ctx={ctx} />
      </div>
    </header>
  );
}
