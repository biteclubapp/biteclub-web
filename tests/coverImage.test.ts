import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as seo from '../lib/seo.ts';

const ID = '0b6c3c55-4a8e-4b8e-9d3e-2f1f6a7b8c9d';

test('accepted cover result rejects errors, non-strings and unsafe ids', () => {
  assert.equal(seo.acceptedCoverImageId('own-photo', null), 'own-photo');
  for (const error of [{ code: 'PGRST202' }, new Error('network'), false]) {
    assert.equal(seo.acceptedCoverImageId('own-photo', error), null);
  }
  for (const data of [null, undefined, {}, ['photo'], 123, '', '../secret', '/abs', 'a//b', 'https://evil.test/photo', 'x?sig=1']) {
    assert.equal(seo.acceptedCoverImageId(data, null), null);
  }
});

test('actual resolver prefers RPC and quietly falls back on missing, failed or unsafe results', async () => {
  // Compile the server module for Node's test runner and inject only its anon transport.
  // The pure acceptance and original-media checks above/below use the real SEO functions.
  const source = await readFile(new URL('../lib/coverImage.ts', import.meta.url), 'utf8');
  let result: unknown = { data: 'rpc-photo', error: null };
  let calls = 0;
  const exports: Record<string, any> = {};
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports,
    require(name: string) {
      if (name === 'server-only') return {};
      if (name === './seo') return seo;
      if (name === './supabase') return { supabase: { async rpc(name: string, args: unknown) {
        calls++;
        assert.equal(name, 'recipe_cover_image_id');
        assert.equal(JSON.stringify(args), JSON.stringify({ p_recipe_id: ID }));
        if (result instanceof Error) throw result;
        return result;
      } } };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  const row: seo.RecipeRow = { id: ID, user_id: seo.KITCHEN_USER_ID,
    original_recipes: { user_id: seo.KITCHEN_USER_ID,
      original_recipe_media: [{ media_uri: 'safe-original', media_type: 'image' }] } };
  assert.equal(await exports.resolveRecipeImageId(row), 'rpc-photo');
  for (const response of [
    { data: null, error: null },
    { data: 'rpc-photo', error: { code: 'PGRST202' } },
    { data: 'rpc-photo', error: { code: 'other-error' } },
    { data: '../unsafe', error: null },
    { data: { media_uri: 'row' }, error: null },
    new Error('transport failed'),
  ]) {
    result = response;
    assert.equal(await exports.resolveRecipeImageId(row), 'safe-original');
    assert.equal(await exports.resolveRecipeImageId({ ...row,
      original_recipes: { ...row.original_recipes, user_id: 'foreign' } }), null);
  }
  const before = calls;
  for (const id of ['', 'not-a-uuid', '-'.repeat(36), `${ID}/extra`]) {
    assert.equal(await exports.fetchOwnRecipeCoverId(id), null);
  }
  assert.equal(calls, before);
});

test('cover path uses anon RPC without privileged access or policy grants', async () => {
  for (const path of ['lib/coverImage.ts', 'app/recipe/[id]/cover/route.ts']) {
    const source = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /createServerClient|SUPABASE_SERVICE_ROLE_KEY/);
    assert.doesNotMatch(source, /grant[\s\S]*recipe_media[\s\S]*anon/i);
  }
  const helper = await readFile(new URL('../lib/coverImage.ts', import.meta.url), 'utf8');
  assert.match(helper, /import 'server-only'/);
  assert.doesNotMatch(helper, /console\./);
  const route = await readFile(new URL('../app/recipe/[id]/cover/route.ts', import.meta.url), 'utf8');
  assert.ok(route.indexOf("!== 'indexable'") < route.indexOf('await resolveRecipeImageId'));
  const tomato = route.match(/Location: '\/tomato\.png', 'Cache-Control': '([^']+)'/);
  assert.equal(tomato?.[1], 'public, max-age=300, s-maxage=300');
  assert.match(route, /status: 200[\s\S]*s-maxage=3600/);
  const page = await readFile(new URL('../app/recipe/[id]/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /visibility === 'indexable'\s*\? await resolveRecipeImageId\(recipe as RecipeRow\)\s*: recipeImageId/);
});
