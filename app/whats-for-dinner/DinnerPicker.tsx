'use client';

import { useRef, useState } from 'react';
import { capture } from '@/lib/webAnalytics';
import { recipeCoverUrl } from '@/lib/seo';
import CoverImage from './CoverImage';
import {
  WFD_ANOTHER,
  WFD_COOK_THIS,
  WFD_FILTER_30,
  WFD_FILTER_ANY,
  WFD_NO_SIGNUP,
  announcePick,
  defaultPickIndex,
  filterByTime,
  nextPickIndex,
  type TimeFilter,
} from '@/lib/whatsForDinner/pool';
import type { DinnerCard } from '@/lib/whatsForDinner/resolve';

function track(action: 'another' | 'filter' | 'open_recipe', card: DinnerCard, filter: TimeFilter, position: number, source: 'picker' | 'grid') {
  capture('web:wfd_picker_action', {
    action,
    filter,
    recipe_id: card.id,
    position,
    source,
    event_version: 1,
  });
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c71c39]';

export default function DinnerPicker({ recipes, initialIndex }: { recipes: DinnerCard[]; initialIndex: number }) {
  const [filter, setFilter] = useState<TimeFilter>('any');
  const filtered = filterByTime(recipes, filter);
  const quick30 = filterByTime(recipes, '30');
  const safeIndex = filtered.length ? Math.min(indexOrStart(initialIndex, filtered.length, filter), filtered.length - 1) : 0;
  const [index, setIndex] = useState(safeIndex);
  const [remaining, setRemaining] = useState<number[]>([]);
  const anotherRef = useRef<HTMLButtonElement>(null);
  const current = filtered[Math.min(index, Math.max(filtered.length - 1, 0))];

  function applyFilter(next: TimeFilter) {
    if (next === filter) return;
    const list = filterByTime(recipes, next);
    if (next !== 'any' && list.length === 0) return;
    const currentId = current?.id;
    const kept = currentId ? list.findIndex(card => card.id === currentId) : -1;
    const nextIndex = kept >= 0 ? kept : defaultPickIndex(list.length);
    setFilter(next);
    setIndex(nextIndex);
    setRemaining([]);
    const card = list[nextIndex];
    if (card) track('filter', card, next, nextIndex + 1, 'picker');
  }

  function showAnother() {
    if (filtered.length < 2) return;
    const next = nextPickIndex(index, remaining, filtered.length);
    setIndex(next.index);
    setRemaining(next.remaining);
    const card = filtered[next.index];
    if (card) track('another', card, filter, next.index + 1, 'picker');
    anotherRef.current?.focus();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Time filter">
        {([
          ['any', WFD_FILTER_ANY],
          ['30', WFD_FILTER_30],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            disabled={value === '30' && quick30.length === 0}
            onClick={() => applyFilter(value)}
            className={`min-h-11 px-4 rounded-full font-semibold border ${focusRing} ${
              value === '30' && quick30.length === 0
                ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                : filter === value ? 'bg-[#c71c39] text-white border-[#c71c39]' : 'bg-white text-[#3D352E] border-stone-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {current && <article className="rounded-2xl border border-stone-200 overflow-hidden max-w-xl">
        <div className="aspect-[4/3] bg-stone-100 overflow-hidden">
          <CoverImage
            key={current.id}
            src={recipeCoverUrl(current.id)}
            alt=""
            width={1200}
            height={900}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="p-4 pb-0">
          <h2 className="font-bold text-2xl leading-snug mb-2">{current.title}</h2>
          <p className="text-sm text-stone-600 mb-1">{current.timeLabel}</p>
          <p className="text-sm text-stone-600">by @{current.username}</p>
        </div>
        <div className="p-4 flex flex-wrap items-center gap-3">
          <a
            href={current.href}
            onClick={() => track('open_recipe', current, filter, index + 1, 'picker')}
            className={`inline-flex items-center justify-center min-h-11 px-4 rounded-full bg-[#c71c39] text-white font-semibold hover:opacity-90 ${focusRing}`}
          >
            {WFD_COOK_THIS}
          </a>
          <button
            ref={anotherRef}
            type="button"
            onClick={showAnother}
            className={`min-h-11 px-4 rounded-full font-semibold border border-stone-300 hover:bg-stone-50 ${focusRing}`}
          >
            {WFD_ANOTHER}
          </button>
        </div>
        <p aria-live="polite" className="sr-only">{announcePick(current.title, current.totalMin)}</p>
        <p className="px-4 pb-5 text-sm text-stone-600">{WFD_NO_SIGNUP}</p>
      </article>}
    </div>
  );
}

function indexOrStart(initialIndex: number, length: number, filter: TimeFilter): number {
  if (filter !== 'any' || length <= 0) return 0;
  return Math.min(Math.max(initialIndex, 0), length - 1);
}
