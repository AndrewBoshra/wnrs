// Tiny PostHog client using its public capture endpoint, no SDK needed.
// Set VITE_POSTHOG_KEY (and optionally VITE_POSTHOG_HOST) at build time. Without a key nothing is sent.

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = ((import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com').replace(/\/$/, '');
const ID_KEY = 'wnrs:analytics:id';
const OPT_OUT_KEY = 'wnrs:analytics';

let enabled = false;
let distinctId = '';

function readId(): string {
  try {
    const existing = localStorage.getItem(ID_KEY);
    if (existing) return existing;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(ID_KEY, id);
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function baseProps(): Record<string, unknown> {
  const ua = navigator.userAgent;
  return {
    $lib: 'wnrs-web',
    $current_url: location.href,
    $pathname: location.hash.replace(/^#/, '') || '/',
    $host: location.host,
    $raw_user_agent: ua,
    $browser_language: navigator.language,
    $screen_width: screen.width,
    $screen_height: screen.height,
    $viewport_width: window.innerWidth,
    $viewport_height: window.innerHeight,
    $device_type: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop',
    $referrer: document.referrer || '$direct',
  };
}

function send(body: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(body);
    const url = `${HOST}/i/v0/e/`;
    // keepalive lets the request finish even if the tab is closing (e.g. page leave).
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
  } catch {
    /* never let analytics break the game */
  }
}

export function track(event: string, props: Record<string, unknown> = {}) {
  if (!enabled) return;
  send({
    api_key: KEY,
    event,
    distinct_id: distinctId,
    timestamp: new Date().toISOString(),
    properties: { ...baseProps(), ...props },
  });
}

/** Attach the player names to the visitor's person profile so you can see who plays, not just that someone did. */
export function identifyPlayers(players: [string, string]) {
  if (!enabled) return;
  send({
    api_key: KEY,
    event: '$set',
    distinct_id: distinctId,
    timestamp: new Date().toISOString(),
    properties: {
      ...baseProps(),
      $set: { last_players: players.join(' & '), last_player_1: players[0], last_player_2: players[1], last_played_at: new Date().toISOString() },
      $set_once: { first_player_1: players[0], first_player_2: players[1], first_played_at: new Date().toISOString() },
    },
  });
}

export function initAnalytics() {
  if (!KEY) return;
  try {
    if (localStorage.getItem(OPT_OUT_KEY) === 'off') return;
  } catch {
    /* ignore */
  }
  distinctId = readId();
  enabled = true;

  const pageview = () => track('$pageview');
  pageview();
  window.addEventListener('hashchange', pageview);
  window.addEventListener('pagehide', () => track('$pageleave'));
}
