// Help me pick (BIT-376): pure logic shared by the /pick/[token] page and its tests.
// Mirrors the app's lib/pick/types.ts and lib/pick/link.ts (biteclubapp/biteclub, BIT-377).
// No imports, so `node --test --experimental-strip-types` can run the tests directly.

export type PickDeck = 'default' | 'thanksgiving';

export type PickOption = {
  position: number;
  title: string | null;
  total_time_min: number | null;
  photo_url: string | null;
  media_id: string | null;
  available: boolean;
  /** Not in today's public payload; used for guest photo signing when a later migration adds it. */
  recipe_id?: string;
};

export type PickPollPublic = {
  poll_id: string;
  state: 'open' | 'closed';
  sender_first_name: string | null;
  deck: PickDeck;
  pack_id: string | null;
  closes_at: string;
  n_cards: number;
  options: PickOption[];
  my_position: number | null;
  counts: number[] | null;
  total_votes: number | null;
};

export type PickNotFound = { state: 'not_found' };
export type PickPollResponse = PickPollPublic | PickNotFound;
export type PickVoteStatus = 'ok' | 'closed' | 'full' | 'owner' | 'not_found' | 'invalid';
export type PickVoteResponse = (PickPollPublic | PickNotFound) & { status: PickVoteStatus; recipe_id?: string };

/** The share token from create_pick_poll: 24 random bytes, base64url, no padding. */
export const PICK_TOKEN_RE = /^[A-Za-z0-9_-]{32}$/;
export const PICK_CT_RE = /^share_decide_\d{6}_[ab]$/;

export const isPickToken = (token: unknown): token is string =>
  typeof token === 'string' && PICK_TOKEN_RE.test(token);

/** CTA arm, fixed per poll (same rule as the app): last hex digit of the poll uuid, even = a. */
export function pickVariant(pollId: string): 'a' | 'b' {
  const last = pollId.replace(/-/g, '').slice(-1);
  const n = parseInt(last, 16);
  return Number.isNaN(n) || n % 2 === 0 ? 'a' : 'b';
}

/** ct from the link when well-formed, else rebuilt from the poll (send month = closes_at - 72h, UTC). */
export function pickCt(poll: Pick<PickPollPublic, 'poll_id' | 'closes_at'>, linkCt: string | null): string {
  if (linkCt && PICK_CT_RE.test(linkCt)) return linkCt;
  const sent = new Date(Date.parse(poll.closes_at) - 72 * 3600 * 1000);
  const ym = Number.isNaN(sent.getTime())
    ? '000000'
    : `${sent.getUTCFullYear()}${String(sent.getUTCMonth() + 1).padStart(2, '0')}`;
  return `share_decide_${ym}_${pickVariant(poll.poll_id)}`;
}

export const APP_STORE_ID = '6748471652';
export const APP_STORE_PT = '127915368';

export function storeUrl(ct: string): string {
  return `https://apps.apple.com/app/apple-store/id${APP_STORE_ID}?pt=${APP_STORE_PT}&ct=${encodeURIComponent(ct)}&mt=8`;
}

/** Store-link ct when no poll loaded (bad, expired or revoked link): no arm, so it never skews the A/B. */
export const NOT_FOUND_CT = 'share_decide_notfound';

export const CTA_COPY = { a: 'Try BiteClub', b: 'Never decide dinner again' } as const;

export function headline(deck: PickDeck): string {
  return deck === 'thanksgiving' ? 'Help pick Thanksgiving' : 'Help pick dinner';
}

/** P5: never a username; "Your friend" when the profile has no first name. */
export function senderLine(name: string | null): string {
  const first = (name ?? '').trim();
  return `${first || 'Your friend'} can't decide. Tap the one you'd eat.`;
}

export function votesLabel(n: number): string {
  return `${n} ${n === 1 ? 'vote' : 'votes'}`;
}

export function timeLabel(min: number | null): string | null {
  return typeof min === 'number' && min > 0 ? `${min} min` : null;
}

export type ResultRow = { option: PickOption; count: number; isTop: boolean };

/** Rows sorted by votes desc (ties keep position order); every row with the top count is a top pick. */
export function resultRows(poll: Pick<PickPollPublic, 'options' | 'counts'>): ResultRow[] {
  const counts = poll.counts ?? [];
  const max = Math.max(0, ...counts);
  return poll.options
    .map(option => {
      const count = counts[option.position - 1] ?? 0;
      return { option, count, isTop: max > 0 && count === max };
    })
    .sort((a, b) => b.count - a.count || a.option.position - b.option.position);
}

export type ViewState =
  | { kind: 'not_found' }
  | { kind: 'vote' }
  | { kind: 'result'; note: string | null }
  | { kind: 'closed' };

export const COPY = {
  notFound: "This link doesn't work. Ask for a new one.",
  loadFailed: "Couldn't load this poll.",
  retry: 'Try again',
  voteFailed: "Couldn't send your vote. Tap again.",
  closed: "Voting's closed.",
  full: 'This poll is full.',
  owner: 'This is your poll. Open it in the BiteClub app to see the votes.',
  unavailable: 'No longer available',
  yourVote: "Your vote's in",
  ctaSub: 'Swipe to pick tonight\u2019s meal. Free on iPhone.',
  ctaSmall: 'Got the app? Tap the link in Messages again.',
} as const;

/** P3/P4: which screen a get_pick_poll payload maps to. */
export function viewFor(poll: PickPollResponse): ViewState {
  if (poll.state === 'not_found') return { kind: 'not_found' };
  if (!poll.options.some(o => o.available)) return { kind: 'not_found' };
  if (poll.state === 'closed') return { kind: 'closed' };
  if (poll.my_position != null) return { kind: 'result', note: null };
  return { kind: 'vote' };
}

/** P3: what a cast_pick_vote status means for the page. 'retry' keeps the selection and shows the inline error. */
export function afterVote(status: PickVoteStatus): ViewState | { kind: 'retry' } | { kind: 'owner' } {
  switch (status) {
    case 'ok': return { kind: 'result', note: null };
    case 'full': return { kind: 'result', note: COPY.full };
    case 'closed': return { kind: 'closed' };
    case 'owner': return { kind: 'owner' };
    case 'not_found': return { kind: 'not_found' };
    default: return { kind: 'retry' };
  }
}

/** Android has no Play listing (spec §4): hide the install button there. */
export function showInstallButton(userAgent: string): boolean {
  return !/android/i.test(userAgent);
}
