import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { menu, THANKSGIVING_CT, THANKSGIVING_PATH } from '../lib/thanksgiving/menu.ts';
import { groceries, groceryGroups, groceryText } from '../lib/thanksgiving/groceries.ts';
import { buildCapture, campaignCt, pageCt } from '../lib/campaign.ts';
import { storeUrl } from '../lib/pick/logic.ts';
import { KITCHEN_USER_ID, kitchenRecipeHref, publishedKitchenRecipe, recipeCoverUrl, siteUrl, staticSitemapRows, type RecipeRow } from '../lib/seo.ts';

const titles = [
  'Herb-Roasted Turkey Breast', 'Make-Ahead Turkey Gravy', 'Sage and Onion Stuffing',
  'Cranberry-Orange Sauce', 'Green Bean Casserole', 'Maple-Roasted Sweet Potatoes',
  'Crispy Roasted Brussels Sprouts', 'Wild Rice Stuffed Butternut Squash',
  'Toasted Turkey Cranberry Brie Sandwich', 'Skillet Turkey Pot Pie',
  'Leftover Turkey Enchiladas Verdes', 'Pecan Pie', 'Chocolate Chess Pie',
];
const published: RecipeRow = { id: 'live-recipe', title: titles[0], user_id: KITCHEN_USER_ID };

test('Thanksgiving route, www canonical and sitemap inclusion preserve pick exclusion', () => {
  assert.equal(THANKSGIVING_PATH, '/thanksgiving');
  assert.equal(siteUrl(THANKSGIVING_PATH), 'https://www.biteclub.fun/thanksgiving');
  const urls = staticSitemapRows().map(row => row.url);
  assert.ok(urls.includes(siteUrl(THANKSGIVING_PATH)));
  assert.ok(urls.every(url => !new URL(url).pathname.startsWith('/pick')));
  const source = readFileSync(new URL('../app/thanksgiving/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /canonical: siteUrl\(THANKSGIVING_PATH\)/);
  assert.match(source, /recipeCoverUrl\(turkey.id\)/);
  assert.match(source, /siteUrl\('\/og-image.png'\)/);
});

test('store attribution defaults and incoming allowlist apply to links and pageviews', () => {
  assert.equal(campaignCt({}, THANKSGIVING_CT), 'web_thanksgiving');
  assert.equal(storeUrl(campaignCt({}, THANKSGIVING_CT)), 'https://apps.apple.com/app/apple-store/id6748471652?pt=127915368&ct=web_thanksgiving&mt=8');
  assert.equal(campaignCt({ ct: 'share_recipe_202611', utm_campaign: 'web_home' }, THANKSGIVING_CT), 'share_recipe_202611');
  assert.equal(campaignCt({ ct: 'invalid', utm_campaign: 'web_club' }, THANKSGIVING_CT), 'web_club');
  assert.equal(campaignCt({ ct: 'invalid' }, THANKSGIVING_CT), THANKSGIVING_CT);
  assert.equal(new URL(storeUrl(campaignCt({ ct: 'web_recipe' }, THANKSGIVING_CT))).searchParams.get('ct'), 'web_recipe');
  assert.equal(pageCt(THANKSGIVING_PATH), THANKSGIVING_CT);
  const capture = buildCapture({ key: 'test', event: '$pageview', href: siteUrl(THANKSGIVING_PATH), referrer: '', distinctId: 'test' });
  assert.equal(capture?.properties.ct, THANKSGIVING_CT);
});

test('approved manifest has all 13 titles in order, correct sections and no invented IDs', () => {
  assert.deepEqual(menu.map(dish => dish.title), titles);
  assert.deepEqual(['table', 'leftovers', 'desserts'].map(section => menu.filter(dish => dish.section === section).length), [8, 3, 2]);
  for (const dish of menu) {
    assert.ok(dish.servings > 0 && dish.prep_time > 0 && dish.cook_time > 0);
    assert.ok(!('id' in dish) && !('href' in dish));
  }
  assert.doesNotMatch(JSON.stringify(menu), /\/recipe\/|[a-f0-9]{8}-[a-f0-9]{4}-/);
});

test('unpublished, deleted, private, other-author and non-exact titles have no recipe href', () => {
  for (const dish of menu) assert.equal(kitchenRecipeHref(dish.title, []), undefined);
  for (const extra of [{ is_deleted: true }, { deleted_at: '2026-11-14' }, { is_draft: true }, { is_public: false }, { visibility: 'private' }, { user_id: 'someone-else', profiles: { username: 'will' } }, { title: titles[0].toLowerCase() }]) {
    assert.equal(kitchenRecipeHref(titles[0], [{ ...published, ...extra }]), undefined);
  }
  assert.equal(kitchenRecipeHref(titles[0], [published]), '/recipe/live-recipe');
  assert.equal(publishedKitchenRecipe(titles[0], [{ ...published, user_id: 'kitchen-profile', profiles: { username: 'kitchen' } }])?.id, published.id);
  assert.equal(recipeCoverUrl(published.id), 'https://www.biteclub.fun/recipe/live-recipe/cover');
});

test('reviewed groceries cover every recipe in five groups with source amounts and stable checkbox IDs', () => {
  assert.deepEqual(groceryGroups, ['produce', 'meat', 'dairy', 'pantry', 'bakery']);
  assert.deepEqual(new Set(groceries.map(item => item.group)), new Set(groceryGroups));
  assert.equal(new Set(groceries.map(item => item.id)).size, groceries.length);
  assert.deepEqual(new Set(groceries.flatMap(item => item.requirements.map(line => line.recipe))), new Set(menu.map(dish => dish.slug)));
  for (const item of groceries) for (const line of item.requirements) assert.ok(line.text.trim());
  assert.equal(groceries.filter(item => item.id === 'butter').length, 1);
  assert.equal(groceries.find(item => item.id === 'butter')?.requirements.length, 8);
  assert.match(groceryText(), /Reserve turkey and cranberry sauce/);
  assert.match(groceryText(), /1 boneless, skin-on turkey breast, about 3 lb/);
  assert.equal(groceryText(), groceryText());
});
