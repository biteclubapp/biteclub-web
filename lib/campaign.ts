// Web campaign attribution (BIT-597): App Store ct tokens and cookieless PostHog capture payloads.
// No imports, so `node --test --experimental-strip-types` can run the tests directly. Never log the key or a payload.

const YM = '20\\d{2}(?:0[1-9]|1[0-2])';
const YMD = `${YM}(?:0[1-9]|[12]\\d|3[01])`;
/** Same family as the app's ct values. Anything else falls back so a crafted link can't write into App Store Connect. */
export const CT_RE = new RegExp(
  `^(?:(?:tt|ig|x|yt|web|email|pin)_[a-z]{1,16}_${YMD}(?:_[ab])?|(?:tt|ig|x|yt|pin)_[a-z]{1,16}(?:_[ab])?|share_(?!decide_)[a-z]{1,16}_${YM}|share_decide_${YM}_[ab]|invite_[a-z]{1,16}_${YM}|web_(?:home|recipe|meal|club|pick|thanksgiving))$`,
);

export const isAllowedCt = (ct: unknown): ct is string => typeof ct === 'string' && ct.length <= 30 && CT_RE.test(ct);

type Query = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** Incoming `ct` wins when allowlisted, then `utm_source` + `_` + `utm_campaign` (same allowlist), else the page default. */
export function campaignCt(query: Query, fallback = 'web_recipe'): string {
  const ct = first(query.ct);
  if (isAllowedCt(ct)) return ct;
  const source = first(query.utm_source)?.trim().toLowerCase();
  const campaign = first(query.utm_campaign)?.trim().toLowerCase();
  const utm = source && campaign ? `${source}_${campaign}` : undefined;
  if (isAllowedCt(utm)) return utm;
  return fallback;
}

/** Share id from `s`: 8-char base62, else null. */
export function shareId(value: unknown): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === 'string' && /^[A-Za-z0-9]{8}$/.test(v) ? v : null;
}

// Cookieless capture (Analyst, Nov 13). Nothing goes in cookies or localStorage: the caller keeps a per-tab distinct
// id in memory, and every event sets $process_person_profile: false (posthog-js `person_profiles: 'never'`).
// /pick/* is skipped: it has its own capture and a bearer token in the path.

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type CaptureInput = {
  key: string | undefined;
  event: string;
  href: string;
  referrer: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  now?: Date;
};

export type CaptureBody = {
  api_key: string;
  event: string;
  distinct_id: string;
  timestamp: string;
  properties: Record<string, unknown>;
};

export const isPickPath = (pathname: string): boolean => pathname === '/pick' || pathname.startsWith('/pick/');

/** Default ct for a page, by first path segment. */
export function pageCt(pathname: string): string {
  const seg = pathname.split('/')[1] ?? '';
  return ({ recipe: 'web_recipe', meal: 'web_meal', club: 'web_club' } as Record<string, string>)[seg] ?? 'web_home';
}

/** posthog-js semantics: hostname of the referrer, '$direct' when there is none. */
export function referringDomain(referrer: string): string {
  try {
    return referrer ? new URL(referrer).hostname : '$direct';
  } catch {
    return '$direct';
  }
}

/** Keep only campaign query parameters on absolute HTTP(S) URLs; never retain credentials or hashes. */
export function sanitizeAnalyticsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const kept = new URLSearchParams();
    for (const [key, val] of url.searchParams) {
      if (key === 'ct' || key === 's' || key.startsWith('utm_')) kept.append(key, val);
    }
    const query = kept.toString();
    return `${url.origin}${url.pathname}${query ? `?${query}` : ''}`;
  } catch {
    return null;
  }
}

/** Sanitize custom properties too, including URLs nested in objects or arrays. */
function sanitizeAnalyticsProperty(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeAnalyticsUrl(value) ?? value;
  if (Array.isArray(value)) return value.map(sanitizeAnalyticsProperty);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) =>
      [key, key === '$referring_domain' ? val : sanitizeAnalyticsProperty(val)]));
  }
  return value;
}

/** A capture body, or null when there is no key, the URL is unparseable, or the page is /pick/*. */
export function buildCapture(input: CaptureInput): CaptureBody | null {
  if (!input.key) return null;
  let url: URL;
  try {
    url = new URL(input.href);
  } catch {
    return null;
  }
  if (isPickPath(url.pathname)) return null;
  const query = Object.fromEntries(url.searchParams.entries());
  const utm: Record<string, string> = {};
  for (const k of UTM_KEYS) if (query[k]) utm[k] = query[k].slice(0, 200);
  const properties: Record<string, unknown> = {
    ct: campaignCt(query, pageCt(url.pathname)),
    share_id: shareId(query.s),
    ...utm,
    $current_url: input.href,
    $host: url.host,
    $pathname: url.pathname,
    $referrer: sanitizeAnalyticsUrl(input.referrer) ?? '$direct',
    $referring_domain: referringDomain(input.referrer),
    $process_person_profile: false,
    $lib: 'biteclub-web',
    ...input.properties,
  };
  properties.$referrer = typeof properties.$referrer === 'string'
    ? sanitizeAnalyticsUrl(properties.$referrer) ?? '$direct' : '$direct';
  properties.$referring_domain = sanitizeAnalyticsUrl(input.referrer) ? referringDomain(input.referrer) : '$direct';
  return {
    api_key: input.key,
    event: input.event,
    distinct_id: input.distinctId,
    timestamp: (input.now ?? new Date()).toISOString(),
    properties: sanitizeAnalyticsProperty(properties) as Record<string, unknown>,
  };
}
