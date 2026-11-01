import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  afterVote, COPY, headline, NOT_FOUND_CT, isPickToken, pickCt, pickVariant, resultRows, senderLine,
  showInstallButton, storeUrl, timeLabel, viewFor, votesLabel, type PickPollPublic,
} from '../lib/pick/logic.ts';

const opt = (position: number, extra: Partial<PickPollPublic['options'][number]> = {}) => ({
  position, title: `Dish ${position}`, total_time_min: 30, photo_url: null, media_id: null, available: true, ...extra,
});
const poll = (extra: Partial<PickPollPublic> = {}): PickPollPublic => ({
  poll_id: '11111111-1111-4111-8111-11111111111a', state: 'open', sender_first_name: 'Will', deck: 'default',
  pack_id: null, closes_at: '2026-11-04T20:00:00Z', n_cards: 3, options: [opt(1), opt(2), opt(3)],
  my_position: null, counts: null, total_votes: null, ...extra,
});

test('token shape', () => {
  assert.equal(isPickToken('A'.repeat(32)), true);
  assert.equal(isPickToken('Ab-_'.repeat(8)), true);
  assert.equal(isPickToken('A'.repeat(31)), false);
  assert.equal(isPickToken('A'.repeat(31) + '='), false);
  assert.equal(isPickToken('x'), false);
  assert.equal(isPickToken(undefined), false);
});

test('variant is fixed per poll and both arms occur', () => {
  assert.equal(pickVariant('11111111-1111-4111-8111-11111111111a'), 'a');
  assert.equal(pickVariant('11111111-1111-4111-8111-11111111111b'), 'b');
  assert.equal(pickVariant('11111111-1111-4111-8111-111111111110'), 'a');
  assert.equal(pickVariant('11111111-1111-4111-8111-111111111111'), 'b');
});

test('ct: link value wins when well formed, else rebuilt from the poll', () => {
  const p = poll();
  assert.equal(pickCt(p, 'share_decide_202611_b'), 'share_decide_202611_b');
  assert.equal(pickCt(p, 'evil<script>'), 'share_decide_202611_a');
  assert.equal(pickCt(p, null), 'share_decide_202611_a');
  assert.equal(pickCt({ ...p, closes_at: '2026-12-03T01:00:00Z' }, null), 'share_decide_202611_a');
  assert.ok(pickCt(p, null).length <= 30);
});

test('store link carries pt and ct', () => {
  assert.equal(storeUrl('share_decide_202611_a'),
    'https://apps.apple.com/app/apple-store/id6748471652?pt=127915368&ct=share_decide_202611_a&mt=8');
});

test('copy', () => {
  assert.equal(headline('default'), 'Help pick dinner');
  assert.equal(headline('thanksgiving'), 'Help pick Thanksgiving');
  assert.equal(senderLine('Will'), "Will can't decide. Tap the one you'd eat.");
  assert.equal(senderLine(null), "Your friend can't decide. Tap the one you'd eat.");
  assert.equal(senderLine('  '), "Your friend can't decide. Tap the one you'd eat.");
  assert.equal(votesLabel(0), '0 votes');
  assert.equal(votesLabel(1), '1 vote');
  assert.equal(votesLabel(3), '3 votes');
  assert.equal(timeLabel(null), null);
  assert.equal(timeLabel(45), '45 min');
});

test('result rows sort by votes, ties keep order, every top row is a top pick', () => {
  const rows = resultRows(poll({ counts: [1, 3, 3], total_votes: 7 }));
  assert.deepEqual(rows.map(r => r.option.position), [2, 3, 1]);
  assert.deepEqual(rows.map(r => r.isTop), [true, true, false]);
  assert.deepEqual(resultRows(poll({ counts: [0, 0, 0] })).map(r => r.isTop), [false, false, false]);
  assert.deepEqual(resultRows(poll({ counts: null })).map(r => r.count), [0, 0, 0]);
});

test('view states (P3, P4)', () => {
  assert.deepEqual(viewFor({ state: 'not_found' }), { kind: 'not_found' });
  assert.deepEqual(viewFor(poll()), { kind: 'vote' });
  assert.deepEqual(viewFor(poll({ my_position: 2, counts: [0, 1, 0] })), { kind: 'result', note: null });
  assert.deepEqual(viewFor(poll({ state: 'closed', counts: [0, 0, 0] })), { kind: 'closed' });
  const gone = { ...opt(1), title: null, available: false };
  assert.deepEqual(viewFor(poll({ options: [gone, { ...gone, position: 2 }] })), { kind: 'not_found' });
  assert.deepEqual(viewFor(poll({ options: [gone, opt(2)] })), { kind: 'vote' });
});

test('vote statuses (P3)', () => {
  assert.deepEqual(afterVote('ok'), { kind: 'result', note: null });
  assert.deepEqual(afterVote('full'), { kind: 'result', note: COPY.full });
  assert.deepEqual(afterVote('closed'), { kind: 'closed' });
  assert.deepEqual(afterVote('not_found'), { kind: 'not_found' });
  assert.deepEqual(afterVote('invalid'), { kind: 'retry' });
  assert.deepEqual(afterVote('owner'), { kind: 'owner' });
});

test('install button hidden on Android', () => {
  assert.equal(showInstallButton('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), true);
  assert.equal(showInstallButton('Mozilla/5.0 (Linux; Android 14; Pixel 8)'), false);
});

test('not-found store link uses an arm-less ct within the 30-char limit', () => {
  assert.equal(NOT_FOUND_CT, 'share_decide_notfound');
  assert.ok(NOT_FOUND_CT.length <= 30);
  assert.ok(!/_[ab]$/.test(NOT_FOUND_CT));
  assert.match(storeUrl(NOT_FOUND_CT), /ct=share_decide_notfound&mt=8$/);
});
