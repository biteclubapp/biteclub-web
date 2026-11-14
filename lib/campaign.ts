// Web campaign attribution (BIT-597): App Store ct tokens and cookieless PostHog capture payloads.
// No imports, so `node --test --experimental-strip-types` can run the tests directly. Never log the key or a payload.

const YM = '20\\d{2}(?:0[1-9]|1[0-2])';
/** Same family as the app's ct values. Anything else falls back so a crafted link can't write into App Store Connect. */
export const CT_RE = new RegExp(
  `^(?:share_[a-z]{1,16}_${YM}|share_decide_${YM}_[ab]|invite_home_${YM}|web_(?:home|recipe|meal|club|pick|thanksgiving))$`,
);

export const isAllowedCt = (ct: unknown): ct is string => typeof ct === 'string' && ct.length <= 40 && CT_RE.test(ct);

type Query = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** Incoming `ct` wins when allowlisted, then `utm_campaign` (same allowlist), else the page default. */
export function campaignCt(query: Query, fallback = 'web_recipe'): string {
  const ct = first(query.ct);
  if (isAllowedCt(ct)) return ct;
  const utm = first(query.utm_campaign);
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
  return ({ recipe: 'web_recipe', meal: 'web_meal', club: 'web_club', thanksgiving: 'web_thanksgiving' } as Record<string, string>)[seg] ?? 'web_home';
}

/** posthog-js semantics: hostname of the referrer, '$direct' when there is none. */
export function referringDomain(referrer: string): string {
  try {
    return referrer ? new URL(referrer).hostname : '$direct';
  } catch {
    return '$direct';
  }
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
  return {
    api_key: input.key,
    event: input.event,
    distinct_id: input.distinctId,
    timestamp: (input.now ?? new Date()).toISOString(),
    properties: {
      ct: campaignCt(query, pageCt(url.pathname)),
      share_id: shareId(query.s),
      ...utm,
      $current_url: `${url.origin}${url.pathname}${url.search}`,
      $host: url.host,
      $pathname: url.pathname,
      $referrer: input.referrer || '$direct',
      $referring_domain: referringDomain(input.referrer),
      $process_person_profile: false,
      $lib: 'biteclub-web',
      ...input.properties,
    },
  };
}
