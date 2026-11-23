import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  WFD_APP_COPY,
  WFD_BANNER,
  WFD_CT,
  WFD_DESCRIPTION,
  WFD_H1,
  WFD_OG_DESCRIPTION,
  WFD_OG_TITLE,
  WFD_PAGE,
  WFD_PATH,
  WFD_TITLE,
  announcePick,
  appCopy,
  chicagoDayOfYear,
  defaultPickIndex,
  dinnerTimeLabel,
  filterByTime,
  nextPickIndex,
  pool,
} from '../lib/whatsForDinner/pool.ts';
import { fallbackCard, isLiveEligible, resolveDinnerPool } from '../lib/whatsForDinner/resolve.ts';
import { buildCapture, campaignCt, isAllowedCt, pageCt } from '../lib/campaign.ts';
import { showInstallButton, storeUrl } from '../lib/pick/logic.ts';
import { WILL_USER_ID, recipeCanonical, siteUrl, staticSitemapRows, type RecipeRow } from '../lib/seo.ts';

const liveRow = (id: string, extra: Partial<RecipeRow> = {}): RecipeRow => ({
  id,
  title: 'Live Title',
  user_id: WILL_USER_ID,
  prep_time: 10,
  cook_time: 15,
  servings: 2,
  instructions: ['Cook it.'],
  profiles: { username: 'will' },
  ...extra,
});

test('route, exact copy, www canonical and sitemap inclusion preserve pick exclusion', () => {
  assert.equal(WFD_PATH, '/whats-for-dinner');
  assert.equal(WFD_CT, 'web_whatsfordinner');
  assert.equal(WFD_PAGE, 'whats_for_dinner');
  assert.equal(WFD_H1, "What's for dinner tonight?");
  assert.equal(WFD_TITLE, "What's for Dinner Tonight? Pick One in a Tap | BiteClub");
  assert.equal(WFD_DESCRIPTION, "Can't decide what to make for dinner? Tap once for a real home-cooked recipe with photos and steps, and skip until one looks good. No sign-up needed.");
  assert.equal(WFD_OG_TITLE, "What's for dinner tonight?");
  assert.equal(WFD_OG_DESCRIPTION, 'Tap once for a real home-cooked dinner with photos and steps. Not feeling it? Skip to the next.');
  assert.equal(WFD_APP_COPY, 'A');
  assert.deepEqual(appCopy(), {
    body: 'BiteClub is an iPhone app for home cooks. Save recipes like these, cook them, and share what you made with friends.',
    button: 'Get BiteClub on the App Store',
  });
  assert.equal(siteUrl(WFD_PATH), 'https://www.biteclub.fun/whats-for-dinner');
  const urls = staticSitemapRows().map(row => row.url);
  assert.ok(urls.includes(siteUrl(WFD_PATH)));
  assert.ok(urls.every(url => !new URL(url).pathname.startsWith('/pick')));
  const page = readFileSync(new URL('../app/whats-for-dinner/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /canonical: siteUrl\(WFD_PATH\)/);
  assert.match(page, /revalidate = 3600/);
  assert.match(page, /jsonLdScript/);
  assert.match(page, /ItemList/);
  assert.doesNotMatch(page, /FAQPage|AggregateRating/);
  assert.doesNotMatch(page, /force-dynamic/);
  assert.match(page, /apple-itunes-app/);
  assert.equal(WFD_BANNER, 'app-id=6748471652, affiliate-data=pt=127915368&ct=web_whatsfordinner');
});

test('page stays web-only: AASA is unchanged and does not list /whats-for-dinner', () => {
  const aasa = readFileSync(new URL('../public/.well-known/apple-app-site-association', import.meta.url), 'utf8');
  assert.doesNotMatch(aasa, /whats-for-dinner/);
  assert.match(aasa, /"\/recipe\/\*"/);
  assert.match(aasa, /"\/pick\/\*"/);
});

test('store attribution defaults to web_whatsfordinner and the exact App Store URL', () => {
  assert.equal(isAllowedCt(WFD_CT), true);
  assert.equal(campaignCt({}, WFD_CT), 'web_whatsfordinner');
  assert.equal(
    storeUrl(campaignCt({}, WFD_CT)),
    'https://apps.apple.com/app/apple-store/id6748471652?pt=127915368&ct=web_whatsfordinner&mt=8',
  );
  assert.equal(campaignCt({ ct: 'share_recipe_202611' }, WFD_CT), 'share_recipe_202611');
  assert.equal(campaignCt({ ct: 'evil' }, WFD_CT), WFD_CT);
  assert.equal(pageCt(WFD_PATH), WFD_CT);
  const pageview = buildCapture({
    key: 'test', event: '$pageview', href: siteUrl(WFD_PATH), referrer: '', distinctId: 'test',
  });
  assert.equal(pageview?.properties.ct, WFD_CT);
  const tapped = buildCapture({
    key: 'test',
    event: 'web:store_button_tapped',
    href: siteUrl(WFD_PATH),
    referrer: '',
    distinctId: 'test',
    properties: { page: WFD_PAGE, ct: WFD_CT, share_id: null, placement: 'header', event_version: 1 },
  });
  assert.equal(tapped?.properties.page, 'whats_for_dinner');
  assert.equal(tapped?.properties.event_version, 1);
  assert.equal('is_guest' in (tapped?.properties ?? {}), false);
  assert.equal(showInstallButton('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), true);
  assert.equal(showInstallButton('Mozilla/5.0 (Linux; Android 14)'), false);
});

test('pinned pool has 15 dinners, 6 of them 30 min or less, and no invented ids in the fallback', () => {
  assert.equal(pool.length, 15);
  assert.equal(pool.filter(dish => dish.total_min <= 30).length, 6);
  assert.equal(new Set(pool.map(dish => dish.id)).size, 15);
  for (const dish of pool) {
    assert.match(dish.id, /^[0-9a-f-]{36}$/);
    assert.ok(dish.total_min > 0 && dish.servings > 0);
    assert.equal(fallbackCard(dish).href, `/recipe/${dish.id}`);
    assert.equal(fallbackCard(dish).username, 'will');
  }
  const under30 = filterByTime(pool.map(dish => ({ ...fallbackCard(dish) })), '30');
  assert.equal(under30.length, 6);
  assert.equal(filterByTime(pool.map(dish => ({ ...fallbackCard(dish) })), 'any').length, 15);
});

test('resolveDinnerPool drops unpublished rows when the query succeeds and uses the pinned fallback on error', () => {
  const first = pool[0];
  const ok = liveRow(first.id, { title: first.title });
  assert.equal(isLiveEligible(ok), true);
  assert.equal(isLiveEligible(liveRow(first.id, { is_deleted: true })), false);
  assert.equal(isLiveEligible(liveRow(first.id, { instructions: [] })), false);
  assert.equal(isLiveEligible(liveRow(first.id, { prep_time: null })), false);
  assert.equal(isLiveEligible(liveRow(first.id, { user_id: 'someone-else', title: first.title })), false);
  const resolved = resolveDinnerPool([
    ok,
    liveRow(pool[1].id, { is_deleted: true }),
    liveRow(pool[2].id, { instructions: [] }),
  ], false);
  assert.deepEqual(resolved.map(card => card.id), [first.id]);
  assert.equal(resolved[0].title, first.title);
  assert.equal(resolved[0].totalMin, 25);
  assert.equal(resolved[0].timeLabel, '25 min · serves 2');
  const fallback = resolveDinnerPool([], true);
  assert.equal(fallback.length, 15);
  assert.equal(fallback[0].title, first.title);
  assert.equal(fallback[0].totalMin, first.total_min);
  assert.equal(recipeCanonical(first.id), `https://www.biteclub.fun/recipe/${first.id}`);
});

test('first pick rotates by Chicago day of year and another never repeats before a reshuffle', () => {
  const noonUtc = new Date('2026-11-23T18:00:00Z'); // 12:00 PM CT on Nov 23
  assert.equal(chicagoDayOfYear(noonUtc), chicagoDayOfYear(new Date('2026-11-23T12:00:00-06:00')));
  assert.equal(defaultPickIndex(15, noonUtc), chicagoDayOfYear(noonUtc) % 15);
  assert.equal(defaultPickIndex(0), 0);
  const seen = new Set<number>();
  let current = 0;
  let remaining: number[] = [];
  for (let i = 0; i < 14; i++) {
    const next = nextPickIndex(current, remaining, 15, () => 0);
    assert.equal(seen.has(next.index), false);
    seen.add(next.index);
    current = next.index;
    remaining = next.remaining;
  }
  assert.equal(seen.size, 14);
  const reshuffled = nextPickIndex(current, remaining, 15, () => 0);
  assert.ok(reshuffled.index >= 0 && reshuffled.index < 15);
  assert.notEqual(reshuffled.index, current);
  assert.equal(dinnerTimeLabel(25, 4), '25 min · serves 4');
  assert.equal(announcePick('Smash Tacos', 25), 'Tonight: Smash Tacos, 25 minutes');
});

test('root JSON-LD no longer claims Android or Google Play', () => {
  const src = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.match(src, /operatingSystem: "iOS"/);
  assert.doesNotMatch(src, /iOS, Android|iOS and Android|Google Play/);
});
