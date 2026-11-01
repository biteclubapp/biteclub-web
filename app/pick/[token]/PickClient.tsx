'use client';

import { CircleCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { capture } from '@/lib/pick/analytics';
import { castVote, getPoll, signPhotos, voterId } from '@/lib/pick/client';
import {
  afterVote, COPY, CTA_COPY, NOT_FOUND_CT, headline, isPickToken, pickCt, pickVariant, resultRows, senderLine,
  showInstallButton, storeUrl, timeLabel, viewFor, voteFailedError, votesLabel,
  type PickOption, type PickPollPublic, type ViewState,
} from '@/lib/pick/logic';

const ACCENT = '#c71c39';
const INK = '#3D352E';
const EVENT_VERSION = 'v1';

type Screen = { kind: 'loading' } | { kind: 'load_failed' } | ViewState | { kind: 'owner' };

function msSincePollCreated(poll: PickPollPublic): number | null {
  const created = Date.parse(poll.closes_at) - 72 * 3600 * 1000;
  return Number.isFinite(created) ? Math.max(0, Date.now() - created) : null;
}

function Photo({ option, url }: { option: PickOption; url: string | null }) {
  const [failed, setFailed] = useState(false);
  const box = 'flex-none w-[96px] h-[120px] rounded-[12px] bg-[#F5F5F5] overflow-hidden';
  if (!url || failed) return <span className={box} aria-hidden />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={`${box} object-cover`} onError={() => setFailed(true)} referrerPolicy="no-referrer" />;
}

/** P1: the same row as the app's PickOptionRow (96x120 4:5 photo, full title, time). */
function OptionRow({ option, url, selected, onTap, disabled, children }: {
  option: PickOption; url: string | null; selected?: boolean; onTap?: () => void; disabled?: boolean; children?: React.ReactNode;
}) {
  const unavailable = !option.available;
  const time = timeLabel(option.total_time_min);
  const content = (
    <>
      <Photo option={option} url={unavailable ? null : url} />
      <span className="flex-1 min-w-0 text-left px-3 py-3">
        {unavailable ? (
          <span className="block text-[16px] text-[#666666]">{COPY.unavailable}</span>
        ) : (
          <span className="block text-[16px] leading-[22px] font-semibold break-words" style={{ color: INK }}>{option.title}</span>
        )}
        {!unavailable && time && <span className="block mt-1 text-[14px] text-[#666666]">{time}</span>}
        {children}
      </span>
      {selected && <CircleCheck aria-hidden className="flex-none w-6 h-6 self-center mr-3" style={{ color: ACCENT }} />}
    </>
  );
  const cls = `w-full min-h-[120px] flex items-start rounded-[12px] bg-white overflow-hidden ${selected ? 'border-2' : 'border'}`;
  const style = { borderColor: selected ? ACCENT : '#E5E5E5' };
  if (!onTap || unavailable) return <div className={cls} style={style}>{content}</div>;
  return (
    <button type="button" className={cls} style={style} onClick={onTap} disabled={disabled} aria-pressed={selected}>
      {content}
    </button>
  );
}

export default function PickClient({ token }: { token: string }) {
  const [screen, setScreen] = useState<Screen>({ kind: 'loading' });
  const [poll, setPoll] = useState<PickPollPublic | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [voteError, setVoteError] = useState(false);
  const [photos, setPhotos] = useState<Map<string, string>>(new Map());
  const [canInstall, setCanInstall] = useState(true);
  const loadedAt = useRef(Date.now());
  const linkCt = useRef<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setCanInstall(showInstallButton(navigator.userAgent));
    linkCt.current = new URLSearchParams(window.location.search).get('ct');
    if (!isPickToken(token)) {
      setScreen({ kind: 'not_found' });
      capture('$pageview', { page: 'pick', state: 'not_found', is_guest: true, event_version: EVENT_VERSION });
      return;
    }
    let cancelled = false;
    setScreen({ kind: 'loading' });
    void getPoll(token, voterId()).then(res => {
      if (cancelled) return;
      if ('error' in res) {
        // Network, 429 or server trouble isn't a dead link: offer a retry (Codex P2).
        setScreen({ kind: 'load_failed' });
        capture('$pageview', { page: 'pick', state: 'load_failed', error: res.error, is_guest: true, event_version: EVENT_VERSION });
        return;
      }
      const view = viewFor(res);
      if (res.state !== 'not_found') setPoll(res);
      setScreen(view);
      const props = res.state === 'not_found'
        ? { state: 'not_found' }
        : { state: res.state, poll_id: res.poll_id, deck: res.deck, ct: pickCt(res, linkCt.current), variant: pickVariant(res.poll_id) };
      capture('$pageview', { page: 'pick', ...props, is_guest: true, event_version: EVENT_VERSION });
    });
    return () => { cancelled = true; };
  }, [token, attempt]);

  // Photos sign only when the payload carries a recipe id (see lib/pick/client.ts).
  useEffect(() => {
    if (!poll) return;
    const items = poll.options
      .filter(o => o.available && o.photo_url && o.recipe_id)
      .map(o => ({ media_id: o.photo_url as string, recipe_id: o.recipe_id as string }));
    void signPhotos(items).then(setPhotos);
  }, [poll]);

  // No poll (not_found): a fallback ct with no arm, and button A's copy.
  const ct = poll ? pickCt(poll, linkCt.current) : NOT_FOUND_CT;
  const variant = poll ? pickVariant(poll.poll_id) : 'a';
  const photoFor = (o: PickOption) => (o.recipe_id && o.photo_url ? photos.get(`${o.recipe_id}:${o.photo_url}`) ?? null : null);

  async function vote(position: number) {
    if (!poll || sending) return;
    const voter = voterId();
    setSelected(position);
    setVoteError(false);
    if (!voter) { setVoteError(true); return; }
    setSending(true);
    const res = await castVote(token, position, voter);
    setSending(false);
    // Same pick:vote_failed error set as the app (Analyst, #3): every non-ok status, rate_limited, or failed.
    const failed = voteFailedError(res);
    if (failed) capture('pick:vote_failed', { error: failed, poll_id: poll.poll_id, deck: poll.deck, is_guest: true, event_version: EVENT_VERSION });
    if ('error' in res) {
      setVoteError(true);
      return;
    }
    const next = afterVote(res.status);
    if (next.kind === 'retry') {
      setVoteError(true);
      return;
    }
    if (res.state !== 'not_found') setPoll(res);
    if (res.status === 'ok') {
      capture('pick:vote_cast', {
        poll_id: poll.poll_id, deck: poll.deck, recipe_id: res.recipe_id ?? null, position,
        ms_since_page_load: Date.now() - loadedAt.current, ms_since_poll_created: msSincePollCreated(poll),
        is_guest: true, event_version: EVENT_VERSION,
      });
    }
    window.setTimeout(() => setScreen(next), 300);
  }

  const rows = useMemo(() => (poll ? resultRows(poll) : []), [poll]);
  const total = poll?.total_votes ?? 0;

  const install = (
    <div>
      <hr className="my-6 border-0 border-t border-[#E5E5E5]" />
      {canInstall && ct && (
        <>
          <a
            href={storeUrl(ct)}
            onClick={() => capture('web:store_button_tapped', {
              page: 'pick', ct, share_id: poll?.poll_id ?? null, placement: 'inline', variant: poll ? variant : null,
              is_guest: true, event_version: EVENT_VERSION,
            })}
            className="flex items-center justify-center w-full h-[52px] rounded-[12px] text-white text-[16px] font-semibold"
            style={{ background: ACCENT }}
          >
            {CTA_COPY[variant]}
          </a>
          <p className="mt-2 text-[14px] text-[#666666] text-center">{COPY.ctaSub}</p>
        </>
      )}
      <p className="mt-4 text-[12px] text-[#666666] text-center">{COPY.ctaSmall}</p>
    </div>
  );

  const results = (
    <div className="mt-6 flex flex-col gap-2">
      {rows.map(({ option, count, isTop }) => (
        <OptionRow key={option.position} option={option} url={photoFor(option)}>
          <span className="flex items-center justify-between gap-2 mt-2 text-[14px]">
            <span className={isTop ? 'font-semibold' : 'text-[#666666]'} style={isTop ? { color: INK } : undefined}>{votesLabel(count)}</span>
            {isTop && <span className="font-semibold" style={{ color: ACCENT }}>Top pick</span>}
          </span>
          <span className="block mt-2 h-1 rounded bg-[#F5F5F5] overflow-hidden">
            <span className="block h-full rounded" style={{ width: `${total ? Math.round((count / total) * 100) : 0}%`, background: isTop ? ACCENT : '#E5E5E5' }} />
          </span>
        </OptionRow>
      ))}
    </div>
  );

  const myOption = poll?.my_position ? poll.options.find(o => o.position === poll.my_position) : null;

  return (
    <main className="min-h-screen bg-white" style={{ color: INK }}>
      <div className="max-w-[420px] mx-auto px-6 pt-4 pb-6">
        <div className="text-[14px] font-semibold">BiteClub</div>

        {screen.kind === 'loading' && (
          <div className="mt-6 flex flex-col gap-2" aria-busy>
            {[0, 1, 2].map(i => <div key={i} className="h-[120px] rounded-[12px] bg-[#F5F5F5]" />)}
          </div>
        )}

        {screen.kind === 'load_failed' && (
          <>
            <p className="mt-6 text-[20px] font-semibold">{COPY.loadFailed}</p>
            <button
              type="button"
              onClick={() => setAttempt(n => n + 1)}
              className="mt-4 w-full h-[52px] rounded-[12px] border text-[16px] font-semibold"
              style={{ borderColor: '#E5E5E5', color: INK }}
            >
              {COPY.retry}
            </button>
          </>
        )}

        {screen.kind === 'not_found' && (
          <>
            <p className="mt-6 text-[20px] font-semibold">{COPY.notFound}</p>
            {install}
          </>
        )}

        {screen.kind === 'owner' && <p className="mt-6 text-[16px] text-[#666666]">{COPY.owner}</p>}

        {screen.kind === 'vote' && poll && (
          <>
            <h1 className="mt-6 text-[28px] leading-[34px] font-bold">{headline(poll.deck)}</h1>
            <p className="mt-2 text-[16px] text-[#666666]">{senderLine(poll.sender_first_name)}</p>
            <div className="mt-6 flex flex-col gap-2">
              {poll.options.map(option => (
                <OptionRow
                  key={option.position}
                  option={option}
                  url={photoFor(option)}
                  selected={selected === option.position}
                  disabled={sending}
                  onTap={() => void vote(option.position)}
                />
              ))}
            </div>
            {voteError && <p className="mt-3 text-[14px]" style={{ color: ACCENT }} role="alert">{COPY.voteFailed}</p>}
          </>
        )}

        {screen.kind === 'result' && poll && (
          <>
            {/* Only a recorded vote gets "Your vote's in" (a full poll rejects new votes: my_position stays null). */}
            {myOption ? (
              <>
                <p className="mt-6 text-[14px] text-[#666666]">{COPY.yourVote}</p>
                {myOption.title && <h1 className="mt-1 text-[20px] leading-[26px] font-semibold">{myOption.title}</h1>}
              </>
            ) : (
              <h1 className="mt-6 text-[28px] leading-[34px] font-bold">{headline(poll.deck)}</h1>
            )}
            {screen.note && <p className="mt-2 text-[16px] text-[#666666]">{screen.note}</p>}
            {results}
            {install}
          </>
        )}

        {screen.kind === 'closed' && poll && (
          <>
            <h1 className="mt-6 text-[28px] leading-[34px] font-bold">{headline(poll.deck)}</h1>
            <p className="mt-2 text-[16px] text-[#666666]">{COPY.closed}</p>
            {results}
            {install}
          </>
        )}
      </div>
    </main>
  );
}
