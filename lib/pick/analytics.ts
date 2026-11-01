// Minimal PostHog capture for the pick page (BIT-378): no posthog-js dependency, sent after first paint.
// No PII: an anonymous per-browser id, never the share token, voter id, names or titles.
// No-op unless NEXT_PUBLIC_POSTHOG_KEY is set.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, '');
const ANON_KEY = 'bc:anon_id:v1';

function anonId(): string {
  try {
    const existing = localStorage.getItem(ANON_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
    return id;
  } catch {
    return 'anon-no-storage';
  }
}

export function capture(event: string, properties: Record<string, unknown>): void {
  if (!KEY || typeof window === 'undefined') return;
  const body = JSON.stringify({
    api_key: KEY,
    event,
    distinct_id: anonId(),
    timestamp: new Date().toISOString(),
    properties: {
      ...properties,
      // The path holds the bearer token: always report the route pattern instead.
      $current_url: `${window.location.origin}/pick/[token]`,
      $pathname: '/pick/[token]',
      $referrer: null,
      $process_person_profile: false,
      $lib: 'biteclub-web-pick',
    },
  });
  try {
    void fetch(`${HOST}/i/v0/e/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      referrerPolicy: 'no-referrer',
    }).catch(() => undefined);
  } catch {
    // Analytics never breaks the page.
  }
}
