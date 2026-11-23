// BIT-565 pinned dinner pool and page copy (Growth final spec, 2026-11-23).
// No imports, so `node --test --experimental-strip-types` can run the tests directly.

export const WFD_PATH = '/whats-for-dinner';
export const WFD_CT = 'web_whatsfordinner';
export const WFD_PAGE = 'whats_for_dinner';

export const WFD_TITLE = "What's for Dinner Tonight? Pick One in a Tap | BiteClub";
export const WFD_DESCRIPTION = "Can't decide what to make for dinner? Tap once for a real home-cooked recipe with photos and steps, and skip until one looks good. No sign-up needed.";
export const WFD_H1 = "What's for dinner tonight?";
export const WFD_OG_TITLE = "What's for dinner tonight?";
export const WFD_OG_DESCRIPTION = 'Tap once for a real home-cooked dinner with photos and steps. Not feeling it? Skip to the next.';
export const WFD_KICKER = 'Dinner picker';
export const WFD_LEDE = "Tap once and we'll pick a real dinner someone cooked and posted on BiteClub, with photos and steps. Not feeling it? Skip to the next one.";
export const WFD_FILTER_ANY = 'Any time';
export const WFD_FILTER_30 = '30 min or less';
export const WFD_COOK_THIS = 'Cook this →';
export const WFD_ANOTHER = 'Show me another';
export const WFD_NO_SIGNUP = 'Free recipe pages. No sign-up.';
export const WFD_SHORTLIST_H2 = 'More dinner ideas for tonight';
export const WFD_EXPLAINER_H2 = 'What should I make for dinner? Decide in a minute';
export const WFD_EXPLAINER_STEPS = [
  'Start with the time you have. Under 30 minutes? Filter for it.',
  'Look at one option at a time, not a list of 100.',
  'Take the first one that looks good. You can skip as many as you like.',
] as const;
export const WFD_APP_H2 = 'Get BiteClub';
export const WFD_APP_COPY = 'A' as 'A' | 'B';
export const WFD_APP_BODY_A = 'BiteClub is an iPhone app for home cooks. Save recipes like these, cook them, and share what you made with friends.';
export const WFD_APP_BUTTON_A = 'Get BiteClub on the App Store';
export const WFD_APP_BODY_B = "Never ask what's for dinner again. Open BiteClub and swipe through dinner ideas, one card at a time. Browse and pick without an account.";
export const WFD_APP_BUTTON_B = 'Get the app';
export const WFD_APP_ALREADY = 'Already have BiteClub? Open any recipe above and tap Open in BiteClub.';
export const WFD_ANDROID_NOTE = 'BiteClub is on iPhone for now.';
export const WFD_FAQ = [
  { q: 'Do I need an account?', a: 'No. The picker and recipe pages are free to use on the web, and nothing you pick is saved.' },
  { q: 'Where do these recipes come from?', a: 'Each one was cooked and posted on BiteClub by its cook, with their own photos and steps.' },
] as const;
export const WFD_BANNER = 'app-id=6748471652, affiliate-data=pt=127915368&ct=web_whatsfordinner';

/** Pinned public dinners by @will. Beef Lettuce Wraps and Chicken Shawarma Bowls were dropped 2026-11-23 until they have real covers (Designer review). IDs are stable; titles/times are the fallback. */
export const pool = [
  { id: '33785ed3-55fd-414c-ae86-f63ed80d7eb5', title: 'Salmon Bowl', total_min: 20, servings: 1 },
  { id: '06c7d824-9857-4015-9f87-47a42c432939', title: 'Smash Tacos', total_min: 25, servings: 4 },
  { id: '706b54b6-e992-474c-a7b9-5b3af61769a5', title: 'Honey Garlic Chicken & Benihana Fried Rice', total_min: 30, servings: 4 },
  { id: '54078dc2-49b3-4221-85be-2550a0841e66', title: 'Homemade Pizza', total_min: 30, servings: 4 },
  { id: '4d5b48a5-49aa-4f8e-b0c4-00090ac8d142', title: 'Chicken Caesar Salad', total_min: 30, servings: 2 },
  { id: '39025302-78a0-4e39-8b8c-714c2e2d56bc', title: 'Chicken Burrito Bowl', total_min: 35, servings: 1 },
  { id: '17869bb6-3754-4f2b-926c-72f0b3852976', title: 'Pesto Pasta Chicken', total_min: 35, servings: 4 },
  { id: '0e5ce8f3-64d7-4ebf-93c1-5b85969d26f1', title: 'Mediterranean bowls', total_min: 35, servings: 2 },
  { id: 'abf162e6-412e-4cc3-9d94-5a4f05cf4d42', title: 'Spicy Salmon Temaki (Hand Rolls)', total_min: 35, servings: 2 },
  { id: 'e217669c-742f-4204-a75f-91a28a1ab3cb', title: 'Grilled Steak with Zucchini and Crinkle-Cut Potatoes', total_min: 40, servings: 2 },
  { id: '6de21160-32bc-440b-a0ed-6d3a98018f48', title: 'Beef Bowl', total_min: 45, servings: 4 },
  { id: '9b857f50-f541-4bea-9098-cbe0aeb924ab', title: 'Creole Jambalaya', total_min: 60, servings: 4 },
  { id: '1a964fc4-5c6a-4e10-8dcf-8480e0c37792', title: 'Chicken Parmesan', total_min: 60, servings: 4 },
] as const;

export type PinnedDinner = (typeof pool)[number];
export type TimeFilter = 'any' | '30';

export function dinnerTimeLabel(totalMin: number, servings: number | null): string {
  return typeof servings === 'number' && servings > 0
    ? `${totalMin} min · serves ${servings}`
    : `${totalMin} min`;
}

/** 0-based day of year in America/Chicago. */
export function chicagoDayOfYear(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const num = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value);
  const year = num('year');
  const month = num('month');
  const day = num('day');
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86_400_000);
}

/** Server-rendered first pick: rotate by Chicago day of year so ISR HTML stays cacheable. */
export function defaultPickIndex(length: number, now = new Date()): number {
  if (length <= 0) return 0;
  return chicagoDayOfYear(now) % length;
}

export function filterByTime<T extends { totalMin: number }>(recipes: readonly T[], filter: TimeFilter): T[] {
  return filter === '30' ? recipes.filter(recipe => recipe.totalMin <= 30) : [...recipes];
}

/** Next pick in a no-repeat cycle; reshuffles only after the filtered pool is used up. */
export function nextPickIndex(current: number, remaining: number[], recipesLength: number, random = Math.random): { index: number; remaining: number[] } {
  if (recipesLength <= 0) return { index: 0, remaining: [] };
  if (recipesLength === 1) return { index: 0, remaining: [] };
  let queue = remaining.filter(i => i !== current && i >= 0 && i < recipesLength);
  if (queue.length === 0) {
    queue = [...Array(recipesLength).keys()].filter(i => i !== current);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }
  const index = queue[0] ?? (current + 1) % recipesLength;
  return { index, remaining: queue.slice(1) };
}

export function announcePick(title: string, totalMin: number): string {
  return `Tonight: ${title}, ${totalMin} minutes`;
}

export function appCopy(): { body: string; button: string } {
  return WFD_APP_COPY === 'B'
    ? { body: WFD_APP_BODY_B, button: WFD_APP_BUTTON_B }
    : { body: WFD_APP_BODY_A, button: WFD_APP_BUTTON_A };
}
