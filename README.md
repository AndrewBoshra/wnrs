# We're Not Really Strangers — web version

A free, fan-made web version of the card game. Runs entirely in the browser: no backend, no accounts, nothing leaves your device.

- Two players sit next to each other and pass the phone / share the screen.
- Pick which levels to play (1 Perception, 2 Connection, 3 Reflection), which expansion packs to mix in, and which self-reflection packs to play as extra rounds.
- Cards are shuffled once per game and progress is saved in the browser, so you can close the tab and resume later.
- Keep several games at once (for example one with Sara and one with Omar), each with its own setup and progress.
- English and Egyptian Arabic, with full right-to-left layout. In Arabic you can flip any card to see the English original.
- Works on phones and desktops. Swipe or use the arrow keys to move between cards.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # output in dist/
npm run preview    # serve the built site locally
```

## Deploy to GitHub Pages

1. Push this repo to GitHub (default branch `main`).
2. In the repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to `https://<user>.github.io/<repo>/`.

The build uses relative paths (`base: './'` in `vite.config.ts`) and hash routing, so it also works from any static host or sub-folder (Netlify, Vercel, Cloudflare Pages, or simply opening `dist/index.html`).

## Card data

- `src/data/cards.en.json` — all 581 cards (13 decks), extracted from the printed PDF and de-duplicated.
- `src/data/cards.ar.json` — Egyptian Arabic translations keyed by card id. Edit any string there to improve a translation.
- `src/data/decks.ts` — deck names, descriptions and whether a deck is a level-based expansion or a stand-alone self-reflection pack.

Card text belongs to the original game's publisher. This project is for personal use.
