import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_IMAGE_URL, KITCHEN_USER_ID, WILL_USER_ID, INDEXABLE_AUTHOR_IDS, sameAuthorLineage, SITE_ORIGIN, ingredientLines, instructionSteps, isImageId, isoDuration,
  jsonLdScript, needsRecipeLineage, recipeCanonical, recipeCoverUrl, recipeImageId, recipeJsonLd, recipeSchemaImage, recipeSitemapRows, recipeVisibility,
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
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER, profiles: { username: 'will' } })), 'unlisted');
  assert.equal(recipeVisibility(recipe({ is_deleted: false, visibility: 'public' })), 'indexable');
  // Only pinned or explicitly passed author ids qualify.
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER })), 'unlisted');
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

test('stable image URL: same-origin cover even without a photo, no unsafe ids', () => {
  assert.equal(recipeCoverUrl(ID), `https://www.biteclub.fun/recipe/${ID}/cover`);
  assert.equal(recipeImageId(recipe()), 'abc123-image');
  // Falls back to the original recipe's media for copies; skips videos.
  assert.equal(recipeImageId(recipe({
    recipe_media: [{ media_uri: 'vid', media_type: 'video' }],
    original_recipes: { user_id: null, original_recipe_media: [{ media_uri: 'orig-img', media_type: null }] },
  })), 'orig-img');
  const noPhoto = recipe({ recipe_media: [] });
  assert.equal(recipeImageId(noPhoto), null);
  assert.deepEqual(recipeJsonLd(noPhoto).image, [recipeCoverUrl(ID)]);
  assert.equal(recipeSchemaImage(noPhoto), recipeCoverUrl(ID));
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
  assert.deepEqual(statics, ['https://www.biteclub.fun/', 'https://www.biteclub.fun/whats-for-dinner', 'https://www.biteclub.fun/thanksgiving', 'https://www.biteclub.fun/terms', 'https://www.biteclub.fun/privacy']);

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
  assert.equal(sanitizeAnalyticsUrl('https://example.com/path?utm_source=x&email=ada@example.com&ct=web_home&s=aB3dE6gH&utm_source=y#secret'),
    'https://example.com/path?utm_source=x&ct=web_home&s=aB3dE6gH&utm_source=y');
  // Unknown utm_* keys are dropped.
  assert.equal(sanitizeAnalyticsUrl('https://example.com/path?utm_future=x&utm_token=abc&utm_medium=social'),
    'https://example.com/path?utm_medium=social');
  // Email-looking UTM values are dropped; long ones are capped at 200.
  assert.equal(sanitizeAnalyticsUrl('https://example.com/path?utm_content=ada@example.com&utm_campaign=home'),
    'https://example.com/path?utm_campaign=home');
  assert.equal(sanitizeAnalyticsUrl(`https://example.com/path?utm_term=${'a'.repeat(300)}`),
    `https://example.com/path?utm_term=${'a'.repeat(200)}`);
  // ct must pass the allowlist and s the share-id check.
  for (const junk of ['ct=ada@example.com', 'ct=evil', 's=123', 's=ada@example.com', 's=aB3dE6gH9']) {
    assert.equal(sanitizeAnalyticsUrl(`https://example.com/path?${junk}`), 'https://example.com/path', junk);
  }
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
  assert.equal(body.properties.$referrer, 'https://www.google.com');
  assert.equal(body.properties.$referring_domain, 'www.google.com');
  assert.equal(body.properties.destination, 'https://example.com/join?ct=pin_recipe');
  assert.deepEqual(body.properties.nested, { urls: ['https://example.com/'] });
  assert.equal(body.properties.label, 'plain text');
  assert.equal(body.properties.path, '/recipe/123');
  const { api_key, ...capture } = body;
  assert.ok(api_key);
  assert.doesNotMatch(JSON.stringify(capture), /invite=|private-code|ada|secret/);
  const emailUtm = buildCapture({ ...input, href: 'https://www.biteclub.fun/recipe/123?utm_source=ig&utm_content=ada@example.com' });
  assert.equal(emailUtm?.properties.utm_source, 'ig');
  assert.equal('utm_content' in (emailUtm?.properties ?? {}), false);
  assert.equal(emailUtm?.properties.$current_url, 'https://www.biteclub.fun/recipe/123?utm_source=ig');
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


test('lineage gates visibility, sitemap and cover for all ancestry paths', () => {
  assert.deepEqual(INDEXABLE_AUTHOR_IDS, [KITCHEN_USER_ID, WILL_USER_ID]);
  for (const user_id of INDEXABLE_AUTHOR_IDS) assert.equal(recipeVisibility(recipe({ user_id })), 'indexable');
  const blocked: RecipeRow[] = [];
  for (const [pointer, name] of [
    ['parent_recipe_id', 'parent'], ['copied_from_recipe_id', 'copied_from'], ['branched_from_recipe_id', 'branched_from'],
  ]) {
    blocked.push(recipe({ [pointer]: 'ancestor', [name]: { id: 'ancestor', user_id: OTHER_USER } }));
    blocked.push(recipe({ [pointer]: 'missing' }));
    blocked.push(recipe({ [pointer]: 'ancestor', [name]: { id: 'ancestor' } }));
  }
  for (const original_recipes of [null, {}, { user_id: undefined }, { user_id: OTHER_USER }]) {
    blocked.push(recipe({ original_recipe_id: 'original', original_recipes }));
  }
  blocked.push(recipe({ parent_recipe_id: 'parent', __lineage: new Map([
    ['parent', { id: 'parent', user_id: KITCHEN_USER_ID, copied_from_recipe_id: 'foreign' }],
    ['foreign', { id: 'foreign', user_id: OTHER_USER }],
  ]) }));
  assert.equal(recipeVisibility(recipe({ parent_recipe_id: ID })), 'indexable'); // Self-parent root is a terminal.
  blocked.push(recipe({
    parent_recipe_id: 'other',
    __lineage: new Map([
      ['other', { id: 'other', user_id: KITCHEN_USER_ID, parent_recipe_id: ID }],
    ]),
  })); // A → B → A is still a cycle.
  for (const username of ['will', 'kitchen']) blocked.push(recipe({ user_id: OTHER_USER, profiles: { username } }));
  for (const row of blocked) {
    assert.equal(recipeVisibility(row), 'unlisted');
    assert.deepEqual(recipeSitemapRows([row], INDEXABLE_AUTHOR_IDS), []);
    assert.equal(recipeVisibility(row) === 'indexable', false); // Cover route gate.
  }
  for (const user_id of [null, KITCHEN_USER_ID]) {
    assert.equal(recipeVisibility(recipe({ original_recipe_id: 'original', original_recipes: { user_id } })), 'indexable');
  }
  assert.equal(sameAuthorLineage(recipe({ parent_recipe_id: 'own', parent_recipe: { id: 'own', user_id: KITCHEN_USER_ID } })), true);
  assert.equal(sameAuthorLineage(recipe({ parent_recipe_id: 'own', __lineage: { own: { id: 'own', user_id: KITCHEN_USER_ID } } })), true);
  const chain = Array.from({ length: 22 }, (_, i) => ({ id: String(i), user_id: KITCHEN_USER_ID, parent_recipe_id: i < 21 ? String(i + 1) : null }));
  assert.equal(sameAuthorLineage(recipe({ parent_recipe_id: '0', __lineage: new Map(chain.map(r => [r.id, r])) })), false);
});

test('original media requires explicit null or same-author ownership; own image wins', () => {
  for (const user_id of [undefined, OTHER_USER, null, KITCHEN_USER_ID]) {
    const original_recipes = { user_id, original_recipe_media: [{ media_uri: 'original-image', media_type: 'image' }] };
    assert.equal(recipeImageId(recipe({ recipe_media: [], original_recipes })),
      user_id === null || user_id === KITCHEN_USER_ID ? 'original-image' : null);
    assert.equal(recipeImageId(recipe({ original_recipes })), 'abc123-image');
  }
});

test('link-only pages keep the original photo; indexable output keeps the same-author rule', () => {
  const original_recipes = { user_id: KITCHEN_USER_ID, original_recipe_media: [{ media_uri: 'original-image', media_type: 'image' }] };
  // An ordinary user's copy of someone else's recipe: unlisted, photo restored for the share page and OG.
  const copy = recipe({ user_id: OTHER_USER, recipe_media: [], original_recipe_id: 'orig', original_recipes });
  assert.equal(recipeVisibility(copy), 'unlisted');
  assert.equal(recipeImageId(copy, { sameAuthorMedia: false }), 'original-image');
  // Indexable output (cover route, JSON-LD, indexable page) still refuses a foreign original's media.
  assert.equal(recipeImageId(copy), null);
  assert.equal(recipeImageId(copy, { sameAuthorMedia: true }), null);
  const foreignOriginal = recipe({ recipe_media: [], original_recipes: { ...original_recipes, user_id: OTHER_USER } });
  assert.equal(recipeImageId(foreignOriginal), null);
  // BIT-609: JSON-LD always points at the stable /cover route; that route uses the strict same-author resolver (no foreign original).
  assert.deepEqual(recipeJsonLd(foreignOriginal).image, [recipeCoverUrl(foreignOriginal.id)]);
  // Videos are still skipped on link-only pages.
  assert.equal(recipeImageId(recipe({ user_id: OTHER_USER, recipe_media: [{ media_uri: 'vid', media_type: 'video' }] }), { sameAuthorMedia: false }), null);
});

test('lineage walk only for allowlisted authors; everyone else is unlisted without it', () => {
  for (const user_id of INDEXABLE_AUTHOR_IDS) assert.equal(needsRecipeLineage(recipe({ user_id })), true);
  for (const user_id of [OTHER_USER, null, undefined, '']) assert.equal(needsRecipeLineage(recipe({ user_id })), false);
  assert.equal(needsRecipeLineage(null), false);
  // A skipped walk (no __lineage) fails closed for other authors, even with clean or no ancestry.
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER })), 'unlisted');
  assert.equal(recipeVisibility(recipe({ user_id: OTHER_USER, parent_recipe_id: 'p' })), 'unlisted');
  // An allowlisted row missing its lineage still fails closed rather than passing.
  assert.equal(recipeVisibility(recipe({ parent_recipe_id: 'p' })), 'unlisted');
});

test('club capture strips invite codes and referrer credentials, paths and queries', () => {
  const body = buildCapture({ key: 'k', event: '$pageview', distinctId: 'mem-1',
    href: 'https://www.biteclub.fun/club/123?invite=private-club-code',
    referrer: 'https://user:password@www.google.com/search?q=secret#hash' });
  assert.ok(body);
  assert.equal(body.properties.$current_url, 'https://www.biteclub.fun/club/123');
  assert.equal(body.properties.$referrer, 'https://www.google.com');
  assert.equal(body.properties.$referring_domain, 'www.google.com');
  const { api_key, ...capture } = body;
  assert.doesNotMatch(JSON.stringify(capture), /invite=|private-club-code|password|secret/);
});

test('PostHog public env is read as a static member, never through a process polyfill import', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const files: string[] = [];
  async function walk(dir: string) {
    for (const ent of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) await walk(p);
      else if (/\.(ts|tsx|js|mjs|cjs)$/.test(ent.name)) files.push(p);
    }
  }
  for (const root of ['app', 'lib']) await walk(new URL(`../${root}`, import.meta.url).pathname);

  const polyfill = /import\s+(?:type\s+)?(?:process\b|\*\s+as\s+process)\s+from\s*['"](?:node:)?process(?:\/browser)?['"]|require\(\s*['"](?:node:)?process(?:\/browser)?['"]\s*\)/;
  const computed = /process\.env\s*\[\s*['"]NEXT_PUBLIC_POSTHOG_(?:KEY|HOST)['"]\s*\]/;
  const destructure = /(?:const|let|var)\s+\{[^}]*NEXT_PUBLIC_POSTHOG_(?:KEY|HOST)[^}]*\}\s*=\s*process\.env/;
  let keyReads = 0;
  let hostReads = 0;
  for (const f of files) {
    const src = await readFile(f, 'utf8');
    assert.doesNotMatch(src, polyfill, `${f} must not import the Node process polyfill`);
    assert.doesNotMatch(src, computed, `${f} must not use computed PostHog env access`);
    assert.doesNotMatch(src, destructure, `${f} must not destructure PostHog env`);
    keyReads += (src.match(/process\.env\.NEXT_PUBLIC_POSTHOG_KEY/g) || []).length;
    hostReads += (src.match(/process\.env\.NEXT_PUBLIC_POSTHOG_HOST/g) || []).length;
  }
  assert.ok(keyReads >= 2, 'web and pick capture must both read NEXT_PUBLIC_POSTHOG_KEY as a literal member');
  assert.ok(hostReads >= 2, 'web and pick capture must both read NEXT_PUBLIC_POSTHOG_HOST as a literal member');
});
