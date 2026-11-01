// Browser-side calls for the pick page. These must run in the voter's browser, not on the server:
// the RPC rate limits key on the caller's IP (cf-connecting-ip), so server-side calls would put
// every voter in one bucket (Guard, #516; spec D6: no poll data in SSR).
import type { PickPollResponse, PickVoteResponse } from './logic';

const VOTER_KEY = 'pick:voter_id:v1';
const MEDIA_API = (process.env.NEXT_PUBLIC_MEDIA_API_URL || 'https://biteclub-media-api.biteclub.workers.dev').replace(/\/+$/, '');
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** Random per browser, kept in localStorage; the DB stores only sha256(poll_id:voter_id). */
export function voterId(): string | null {
  try {
    const existing = localStorage.getItem(VOTER_KEY);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VOTER_KEY, id);
    return id;
  } catch {
    return null;
  }
}

export type RpcError = 'rate_limited' | 'network';

/** PostgREST RPC with the anon key only (plain fetch keeps the page small; no supabase-js). */
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | { error: RpcError }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify(args),
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
    });
    if (res.status === 429) return { error: 'rate_limited' };
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { code?: string } | null;
      return { error: body?.code === 'PT429' ? 'rate_limited' : 'network' };
    }
    const data = (await res.json()) as T | null;
    return data ?? { error: 'network' };
  } catch {
    return { error: 'network' };
  }
}

export function getPoll(token: string, voter: string | null) {
  return rpc<PickPollResponse>('get_pick_poll', { p_token: token, p_voter_id: voter });
}

export function castVote(token: string, position: number, voter: string) {
  return rpc<PickVoteResponse>('cast_pick_vote', { p_token: token, p_position: position, p_voter_id: voter });
}

/**
 * `media_id` here is the option's `photo_url` (the Cloudflare image id), not the recipe_media row id.
 * Guest photo signing (media-api /media/guest/sign-urls, live since #474). It needs the recipe id,
 * which today's public payload doesn't carry, so options without one fall back to the no-photo block.
 */
export async function signPhotos(items: { media_id: string; recipe_id: string }[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (items.length === 0) return out;
  try {
    const res = await fetch(`${MEDIA_API}/media/guest/sign-urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media: items.map(i => ({ media_id: i.media_id, media_type: 'image', recipe_id: i.recipe_id })) }),
      referrerPolicy: 'no-referrer',
    });
    if (!res.ok) return out;
    const json = (await res.json()) as { signedUrls?: { media_id: string; recipe_id?: string; signedUrl?: string }[] };
    const rows = Array.isArray(json?.signedUrls) ? json.signedUrls : [];
    for (const r of rows) {
      if (r.signedUrl && /^https:\/\//.test(r.signedUrl)) out.set(`${r.recipe_id}:${r.media_id}`, r.signedUrl);
    }
  } catch {
    // No photo is a designed state.
  }
  return out;
}
