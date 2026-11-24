// Browser side of the cookieless capture in lib/campaign.ts (BIT-597). No-op unless NEXT_PUBLIC_POSTHOG_KEY is set.
// The distinct id lives only in this module (one per tab, gone on reload): no cookies, no localStorage, no identify.
import { buildCapture } from '@/lib/campaign';

// Next inlines only a literal `process.env.NEXT_PUBLIC_*` member access into the client bundle.
// Do not import the Node 'process' package, or read through a destructured/computed env: the webpack
// process polyfill ships `{ env: {} }`, KEY is empty, and capture returns early.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '');

let distinctId: string | null = null;

function sessionId(): string {
  if (!distinctId) {
    try {
      distinctId = crypto.randomUUID();
    } catch {
      distinctId = `anon-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    }
  }
  return distinctId;
}

export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!KEY || typeof window === 'undefined') return;
  const body = buildCapture({
    key: KEY,
    event,
    href: window.location.href,
    referrer: document.referrer,
    distinctId: sessionId(),
    properties,
  });
  if (!body) return;
  try {
    void fetch(`${HOST}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => undefined);
  } catch {
    // Analytics never breaks the page.
  }
}
