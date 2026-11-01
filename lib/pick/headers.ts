// Response headers for /pick/<token> (Guard P3, biteclub-web#3). The token is a bearer secret in the path, so the
// page must not leak it through referrers, caches, search indexes or framing. No imports: next.config.ts and
// `node --test` both load this file.

export type Header = { key: string; value: string };

/** The only host signed pick photos come from (Cloudflare Images delivery). */
export const PICK_PHOTO_HOST = 'https://imagedelivery.net';

const origin = (url: string | undefined): string | null => {
  try {
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
};

/**
 * A CSP that fits the page: Next's inline bootstrap scripts and styles ('unsafe-inline'; 'unsafe-eval' only for
 * `next dev`), self-hosted next/font files, signed photo URLs on imagedelivery.net, and fetches to Supabase (the two poll RPCs),
 * the media API (guest photo signing) and PostHog (capture).
 */
export function pickContentSecurityPolicy(env: Record<string, string | undefined>, dev = false): string {
  const connect = [
    "'self'",
    origin(env.NEXT_PUBLIC_SUPABASE_URL) ?? 'https://*.supabase.co',
    origin(env.NEXT_PUBLIC_MEDIA_API_URL) ?? 'https://biteclub-media-api.biteclub.workers.dev',
    origin(env.NEXT_PUBLIC_POSTHOG_HOST) ?? 'https://us.i.posthog.com',
  ];
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    // Photos are media-api /media/guest/sign-urls results, which are always Cloudflare Images signed URLs on
    // https://imagedelivery.net/<hash>/<id>/public?exp=…&sig=… (media-api signImageUrl). 'self' covers the favicon.
    // No data:/blob: images on this page. Pinning the host limits image-URL exfiltration (Guard P3, biteclub-web#3).
    `img-src 'self' ${PICK_PHOTO_HOST}`,
    "font-src 'self' data:",
    `connect-src ${[...new Set(connect)].join(' ')}${dev ? ' ws: wss:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function pickSecurityHeaders(env: Record<string, string | undefined>, dev = false): Header[] {
  return [
    { key: 'Referrer-Policy', value: 'no-referrer' },
    { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Content-Security-Policy', value: pickContentSecurityPolicy(env, dev) },
  ];
}
