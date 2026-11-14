import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_IMAGE_URL, KITCHEN_USER_ID, SITE_ORIGIN, ingredientLines, instructionSteps, isImageId, isoDuration,
  jsonLdScript, recipeCanonical, recipeCoverUrl, recipeImageId, recipeJsonLd, recipeSitemapRows, recipeVisibility,
  siteUrl, staticSitemapRows, type RecipeRow,
} from '../lib/seo.ts';
import { buildCapture, campaignCt, isAllowedCt, referringDomain, sanitizeAnalyticsUrl, shareId } from '../lib/campaign.ts';
import { storeUrl } from '../lib/pick/logic.ts';

const ID = '0b6c3c55-4a8e-4b8e-9d3e-2f1f6a7b8c9d';
const OTHER_USER = '99999999-9999-4999-8999-999999999999';

const recipe = (extra: Partial<RecipeRow> = {}): RecipeRow => ({
  id: ID,
  title: 'Brown Butter Pasta',
  description: 'Weeknight pasta.',
  ingredients_text: ['200g pasta', '{"text":"3 tbsp butter"}', '  '],
  instructions: [{ text: 'Boil pasta.' }, 'Brown the butter.', { step: 3 }],
  prep_time: 10,
  cook_time: 20,
  servings: 2,
  created_at: '2026-11-01T12:00:00Z',
  user_id: KITCHEN_USER_ID,
  profiles: { username: 'kitchen', full_name: 'BiteClub Kitchen' },
  recipe_media: [{ media_uri: 'abc123-image', media_type: 'image' }],
  ...extra,
});

test('canonical host and path are www + /recipe/<id>', () => {
  assert.equal(SITE_ORIGIN, 'https://www.biteclub.fun');
  assert.equal(recipeCanonical(ID), `https://www.biteclub.fun/recipe/${ID}`);
  assert.equal(siteUrl('/sitemap.xml'), 'https://www.biteclub.fun/sitemap.xml');
  assert.equal(siteUrl('terms'), 'https://www.biteclub.fun/terms');
  assert.ok(!recipeCanonical(ID).startsWith('https://biteclub.fun'));
});

test('visibility: deleted/missing are gone, private/draft/other authors unlisted, kitchen indexable', () => {
  assert.equal(recipeVisibility(null), 'gone');
  assert.equal(recipeVisibility(recipe({ is_deleted: true })), 'gone');
  assert.equal(recipeVisibility(recipe({ deleted_at: '2026-11-02T00:00:00Z' })), 'gone');
  assert.equal(recipeVisibility(recipe({ is_public: false })), 'unlisted');
  assert.equal(recipeVisibility(recipe({ visibility: 'friends' })), 'unlisted');
  assert.equal(recipeVisibility(recipe({ status: 'draft' })), 'unlisted');
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER, profiles: { username: 'someone' } })), 'unlisted');
  assert.equal(recipeVisibility(recipe({ title: '  ' })), 'unlisted');
  assert.equal(recipeVisibility(recipe()), 'indexable');
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER, profiles: { username: 'will' } })), 'indexable');
  assert.equal(recipeVisibility(recipe({ is_deleted: false, visibility: 'public' })), 'indexable');
  // By username when the id differs, and by an explicitly passed author id.
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER })), 'indexable');
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER, profiles: null }), [KITCHEN_USER_ID, OTHER_USER]), 'indexable');
});

test('iso durations', () => {
  assert.equal(isoDuration(45), 'PT45M');
  assert.equal(isoDuration(60), 'PT1H');
  assert.equal(isoDuration(90), 'PT1H30M');
  assert.equal(isoDuration(0), undefined);
  assert.equal(isoDuration(-5), undefined);
  assert.equal(isoDuration(null), undefined);
  assert.equal(isoDuration('45'), undefined);
  assert.equal(isoDuration(Number.NaN), undefined);
});

test('ingredient and instruction unwrapping matches the page', () => {
  assert.deepEqual(ingredientLines(['1 egg', '{"text":"2 cups flour"}', '{"text": broken', '', { text: 'salt' }]),
    ['1 egg', '2 cups flour', '{"text": broken', 'salt']);
  assert.deepEqual(ingredientLines(undefined), []);
  assert.deepEqual(instructionSteps('Mix.\n\n  Bake.  \n'), ['Mix.', 'Bake.']);
  assert.deepEqual(instructionSteps([{ text: 'A' }, 'B', { step: 3 }, null]), ['A', 'B', '3']);
  assert.deepEqual(instructionSteps(42), []);
});

test('Recipe JSON-LD has required fields and a stable image', () => {
  const ld = recipeJsonLd(recipe());
  assert.equal(ld['@context'], 'https://schema.org');
  assert.equal(ld['@type'], 'Recipe');
  assert.equal(ld.name, 'Brown Butter Pasta');
  assert.equal(ld.url, recipeCanonical(ID));
  assert.deepEqual(ld.image, [`https://www.biteclub.fun/recipe/${ID}/cover`]);
  assert.ok(!JSON.stringify(ld).includes('imagedelivery.net'));
  assert.ok(!JSON.stringify(ld).includes('sig='));
  assert.deepEqual(ld.author, { '@type': 'Person', name: 'kitchen' });
  assert.deepEqual(ld.recipeIngredient, ['200g pasta', '3 tbsp butter']);
  assert.deepEqual(ld.recipeInstructions, [
    { '@type': 'HowToStep', text: 'Boil pasta.' },
    { '@type': 'HowToStep', text: 'Brown the butter.' },
    { '@type': 'HowToStep', text: '3' },
  ]);
  assert.equal(ld.prepTime, 'PT10M');
  assert.equal(ld.cookTime, 'PT20M');
  assert.equal(ld.totalTime, 'PT30M');
  assert.equal(ld.recipeYield, '2');
});

test('Recipe JSON-LD omits missing times, yield and author rather than inventing them', () => {
  const ld = recipeJsonLd(recipe({ prep_time: null, cook_time: 25, servings: null, description: null, profiles: null }));
  assert.equal('prepTime' in ld, false);
  assert.equal(ld.cookTime, 'PT25M');
  assert.equal('totalTime' in ld, false);
  assert.equal('recipeYield' in ld, false);
  assert.equal('description' in ld, false);
  assert.equal('author' in ld, false);
  assert.equal('recipeCuisine' in ld, false);
  const none = recipeJsonLd(recipe({ prep_time: undefined, cook_time: undefined }));
  assert.equal('prepTime' in none || 'cookTime' in none || 'totalTime' in none, false);
});

test('JSON-LD script escapes < so recipe text cannot close the tag', () => {
  const out = jsonLdScript(recipeJsonLd(recipe({ title: '</script><script>alert(1)</script>' })));
  assert.ok(!out.includes('</script>'));
  assert.equal(JSON.parse(out).name, '</script><script>alert(1)</script>');
});

test('stable image URL: same-origin cover for public photos, tomato fallback, no unsafe ids', () => {
  assert.equal(recipeCoverUrl(ID), `https://www.biteclub.fun/recipe/${ID}/cover`);
  assert.equal(recipeImageId(recipe()), 'abc123-image');
  // Falls back to the original recipe's media for copies; skips videos.
  assert.equal(recipeImageId(recipe({
    recipe_media: [{ media_uri: 'vid', media_type: 'video' }],
    original_recipes: { original_recipe_media: [{ media_uri: 'orig-img', media_type: null }] },
  })), 'orig-img');
  const noPhoto = recipe({ recipe_media: [] });
  assert.equal(recipeImageId(noPhoto), null);
  assert.deepEqual(recipeJsonLd(noPhoto).image, [FALLBACK_IMAGE_URL]);
  assert.equal(FALLBACK_IMAGE_URL, 'https://www.biteclub.fun/tomato.png');
  for (const bad of ['../secret', 'https://evil.example/x.png', 'a//b', '', '/abs', 'x?sig=1']) {
    assert.equal(isImageId(bad), false, bad);
  }
  assert.equal(isImageId('2cdc28f0-017a-49c4-9ed7-87056c83901'), true);
});

test('cover route gate: only indexable recipes are served (everything else 404s)', () => {
  // app/recipe/[id]/cover/route.ts serves iff recipeVisibility(...) === 'indexable'.
  const served = (r: RecipeRow | null) => recipeVisibility(r) === 'indexable';
  assert.equal(served(recipe()), true);
  assert.equal(served(recipe({ is_deleted: true })), false);
  assert.equal(served(recipe({ is_private: true })), false);
  assert.equal(served(recipe({ user_id: OTHER_USER, profiles: { username: 'someone' } })), false);
  assert.equal(served(null), false);
});

test('sitemap: static pages on www, indexable recipes only, kitchen first, no /pick', () => {
  const statics = staticSitemapRows().map(r => r.url);
  assert.deepEqual(statics, ['https://www.biteclub.fun/', 'https://www.biteclub.fun/terms', 'https://www.biteclub.fun/privacy']);

  const OWNER = '11111111-1111-4111-8111-111111111111';
  const rows = recipeSitemapRows([
    recipe({ id: 'owner-1', user_id: OWNER, profiles: null, created_at: '2026-10-01T00:00:00Z' }),
    recipe({ id: 'k-1', updated_at: '2026-11-10T00:00:00Z' }),
    recipe({ id: 'k-deleted', is_deleted: true }),
    recipe({ id: 'k-draft', status: 'draft' }),
    recipe({ id: 'stranger', user_id: OTHER_USER, profiles: null }),
    recipe({ id: 'k-1' }),
    recipe({ id: 'k-nodate', created_at: null }),
  ], [KITCHEN_USER_ID, OWNER]);
  const urls = rows.map(r => r.url);
  assert.deepEqual(urls, [
    'https://www.biteclub.fun/recipe/k-1',
    'https://www.biteclub.fun/recipe/k-nodate',
    'https://www.biteclub.fun/recipe/owner-1',
  ]);
  assert.ok(urls.every(u => u.startsWith('https://www.biteclub.fun/recipe/') && !u.includes('/pick')));
  assert.equal(rows[0].lastModified?.toISOString(), '2026-11-10T00:00:00.000Z');
  assert.equal(rows[1].lastModified, undefined);
  assert.equal(rows[2].lastModified?.toISOString(), '2026-10-01T00:00:00.000Z');
});

test('store URL: allowlisted incoming ct wins, otherwise web_recipe', () => {
  const base = 'https://apps.apple.com/app/apple-store/id6748471652?pt=127915368&ct=';
  assert.equal(storeUrl(campaignCt({})), `${base}web_recipe&mt=8`);
  assert.equal(storeUrl(campaignCt({ ct: 'share_recipe_202611' })), `${base}share_recipe_202611&mt=8`);
  assert.equal(campaignCt({ ct: 'share_decide_202611_b' }), 'share_decide_202611_b');
  assert.equal(campaignCt({ ct: 'invite_home_202612' }), 'invite_home_202612');
  assert.equal(campaignCt({ ct: 'web_thanksgiving' }), 'web_thanksgiving');
  assert.equal(campaignCt({ ct: ['web_meal', 'web_club'] }), 'web_meal');
  assert.equal(campaignCt({ utm_campaign: 'web_home' }), 'web_recipe');
  assert.equal(campaignCt({ ct: 'evil<script>', utm_campaign: 'share_meal_202611' }), 'web_recipe');
  for (const bad of ['evil', 'share_recipe_202613', 'share_recipe_2026111', 'web_admin', 'share_decide_202611_c', 'SHARE_recipe_202611', 'x'.repeat(31), 'share_decide_202611', 'tt_decide_20261320_a', 'tt_decide_20261132', 'tt_decide_20261100', 'email_abcdefghijklmnop_20261120_a']) {
    assert.equal(isAllowedCt(bad), false, bad);
    assert.equal(campaignCt({ ct: bad }), 'web_recipe');
  }
});

test('campaign placements and UTM derivation respect precedence and page fallback', () => {
  for (const ct of ['tt_decide_20261120_a', 'tt_expa_a', 'tt_expa_b', 'ig_expa_a', 'ig_expa_b',
    'pin_recipe', 'pin_thanks', 'invite_settings_202611', 'invite_pick_202611',
    'x_future_20260131', 'yt_chef_20260201_b', 'email_launch_20261201', 'web_thanks_20261120',
    'pin_thanks_20261120', 'share_future_202611', 'invite_future_202611']) {
    assert.equal(isAllowedCt(ct), true, ct);
    assert.equal(campaignCt({ ct }), ct);
  }
  assert.equal(campaignCt({ ct: 'pin_thanks' }, 'web_thanksgiving'), 'pin_thanks');
  assert.equal(campaignCt({}, 'web_thanksgiving'), 'web_thanksgiving');
  assert.equal(campaignCt({ utm_source: 'ig', utm_campaign: 'decide_20261120_a' }), 'ig_decide_20261120_a');
  assert.equal(campaignCt({ utm_source: 'web', utm_campaign: 'home' }), 'web_home');
  assert.equal(campaignCt({ utm_source: [' IG ', 'web'], utm_campaign: [' Decide_20261120_A ', 'home'] }), 'ig_decide_20261120_a');
  assert.equal(campaignCt({ ct: 'pin_recipe', utm_source: 'web', utm_campaign: 'home' }), 'pin_recipe');
  assert.equal(campaignCt({ ct: 'evil', utm_source: 'web', utm_campaign: 'home' }), 'web_home');
  assert.equal(isAllowedCt('invite_abcdefghijklmnop_202611'), true); // Exactly 30 characters.
});

test('analytics URL sanitizer keeps allowed parameters in order and drops credentials and hashes', () => {
  assert.equal(sanitizeAnalyticsUrl('https://example.com/path?utm_future=x&email=ada@example.com&ct=web_home&s=123&utm_future=y#secret'),
    'https://example.com/path?utm_future=x&ct=web_home&s=123&utm_future=y');
  assert.equal(sanitizeAnalyticsUrl('https://user:password@example.com/path?invite=secret#hash'), 'https://example.com/path');
  for (const value of ['', 'ada@example.com', '/recipe/path', 'ftp://example.com/path']) {
    assert.equal(sanitizeAnalyticsUrl(value), null);
  }
});

test('capture sanitizes current, referring and custom URLs before returning the body', () => {
  const input = {
    key: 'k', event: '$pageview', distinctId: 'mem-1',
    href: 'https://www.biteclub.fun/recipe/123?ct=web_recipe&invite=private-code&s=aB3dE6gH&email=ada@example.com&utm_source=ig#secret',
    referrer: 'https://www.google.com/search?q=secret+query&email=ada@example.com',
    properties: {
      destination: 'https://example.com/join?invite=private-code&email=ada@example.com&ct=pin_recipe#secret',
      nested: { urls: ['https://example.com/?email=ada@example.com'] },
      label: 'plain text', path: '/recipe/123',
    },
  };
  const body = buildCapture(input);
  assert.ok(body);
  assert.equal(body.properties.$current_url, 'https://www.biteclub.fun/recipe/123?ct=web_recipe&s=aB3dE6gH&utm_source=ig');
  assert.equal(body.properties.$referrer, 'https://www.google.com/search');
  assert.equal(body.properties.$referring_domain, 'www.google.com');
  assert.equal(body.properties.destination, 'https://example.com/join?ct=pin_recipe');
  assert.deepEqual(body.properties.nested, { urls: ['https://example.com/'] });
  assert.equal(body.properties.label, 'plain text');
  assert.equal(body.properties.path, '/recipe/123');
  const { api_key, ...capture } = body;
  assert.ok(api_key);
  assert.doesNotMatch(JSON.stringify(capture), /invite=|private-code|ada|secret/);
  for (const referrer of ['', 'ada@example.com', 'not a url', 'mailto:ada@example.com']) {
    const direct = buildCapture({ ...input, referrer });
    assert.equal(direct?.properties.$referrer, '$direct');
    assert.equal(direct?.properties.$referring_domain, '$direct');
  }
});

test('share id: 8-char base62 or null', () => {
  assert.equal(shareId('aB3dE6gH'), 'aB3dE6gH');
  assert.equal(shareId(['aB3dE6gH']), 'aB3dE6gH');
  assert.equal(shareId('aB3dE6g'), null);
  assert.equal(shareId('aB3dE6g!'), null);
  assert.equal(shareId(undefined), null);
});

test('pageview: no-op without a key, skips /pick, cookieless and person-less', () => {
  const input = {
    event: '$pageview',
    href: `https://www.biteclub.fun/recipe/${ID}?ct=share_recipe_202611&s=aB3dE6gH&utm_source=google&utm_medium=organic#x`,
    referrer: 'https://www.google.com/',
    distinctId: 'mem-1',
    now: new Date('2026-11-14T00:00:00Z'),
  };
  assert.equal(buildCapture({ ...input, key: undefined }), null);
  assert.equal(buildCapture({ ...input, key: '' }), null);
  assert.equal(buildCapture({ ...input, key: 'k', href: 'https://www.biteclub.fun/pick/' + 'A'.repeat(32) }), null);
  assert.equal(buildCapture({ ...input, key: 'k', href: 'https://www.biteclub.fun/pick' }), null);

  const KEY = 'phc_test_key_do_not_print';
  const body = buildCapture({ ...input, key: KEY });
  assert.ok(body);
  assert.equal(body.event, '$pageview');
  assert.equal(body.distinct_id, 'mem-1');
  const p = body.properties;
  assert.equal(p.ct, 'share_recipe_202611');
  assert.equal(p.share_id, 'aB3dE6gH');
  assert.equal(p.utm_source, 'google');
  assert.equal(p.utm_medium, 'organic');
  assert.equal(p.$pathname, `/recipe/${ID}`);
  assert.equal(p.$referring_domain, 'www.google.com');
  assert.equal(p.$process_person_profile, false);
  assert.ok(!String(p.$current_url).includes('#'));
  // The key travels only as the top-level api_key, never inside event properties.
  assert.equal(body.api_key, KEY);
  assert.ok(!JSON.stringify(p).includes(KEY));

  const plain = buildCapture({ ...input, key: KEY, href: `https://www.biteclub.fun/recipe/${ID}`, referrer: '' });
  assert.equal(plain?.properties.ct, 'web_recipe');
  assert.equal(plain?.properties.share_id, null);
  assert.equal(plain?.properties.$referring_domain, '$direct');
  assert.equal(buildCapture({ ...input, key: KEY, href: 'https://www.biteclub.fun/' })?.properties.ct, 'web_home');
});

test('store tap event carries page, ct, share_id, placement and event_version 1, not is_guest', () => {
  const props = { page: 'recipe', ct: 'web_recipe', share_id: null, placement: 'header', event_version: 1 };
  const body = buildCapture({
    key: 'k', event: 'web:store_button_tapped', href: `https://www.biteclub.fun/recipe/${ID}`, referrer: '',
    distinctId: 'mem-1', properties: props,
  });
  assert.equal(body?.properties.page, 'recipe');
  assert.equal(body?.properties.ct, 'web_recipe');
  assert.equal(body?.properties.share_id, null);
  assert.equal(body?.properties.placement, 'header');
  assert.equal(body?.properties.event_version, 1);
  assert.equal('is_guest' in (body?.properties ?? {}), false);
});

test('StoreLink sends event_version 1 and does not set is_guest', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../app/recipe/[id]/StoreLink.tsx', import.meta.url), 'utf8');
  assert.match(src, /event_version:\s*1/);
  assert.doesNotMatch(src, /is_guest/);
});

test('referring domain', () => {
  assert.equal(referringDomain('https://www.google.com/search?q=x'), 'www.google.com');
  assert.equal(referringDomain(''), '$direct');
  assert.equal(referringDomain('not a url'), '$direct');
});

test('analytics code never logs (the key cannot reach console output)', async () => {
  const { readFile } = await import('node:fs/promises');
  for (const f of ['lib/campaign.ts', 'lib/webAnalytics.ts', 'app/PageviewTracker.tsx', 'app/recipe/[id]/StoreLink.tsx']) {
    const src = await readFile(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.ok(!/console\./.test(src), `${f} must not log`);
    assert.ok(!/localStorage\.|sessionStorage\.|document\.cookie/.test(src), `${f} must stay cookieless`);
  }
});
