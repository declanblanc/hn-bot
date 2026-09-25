import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchTopStories, parseHits, searchUrl, weekRange } from '../src/hn.js';

const hits = [
  {
    objectID: '101',
    title: 'Rust & "Go" – a comparison',
    url: 'https://www.example.com/a?x=1&y=2',
    points: 758,
    num_comments: 782,
  },
  { objectID: '102', title: 'Ask HN: What are you working on?', url: null, points: 1, num_comments: null },
];

test('spans Monday 00:00 UTC to the next Monday', () => {
  const { start, end } = weekRange('2026-09-14');
  assert.equal(new Date(start * 1000).toISOString(), '2026-09-14T00:00:00.000Z');
  assert.equal(new Date(end * 1000).toISOString(), '2026-09-21T00:00:00.000Z');
});

test('filters the search to the week', () => {
  const params = new URL(searchUrl('2026-09-14', 10)).searchParams;
  assert.equal(params.get('tags'), 'story');
  assert.equal(params.get('numericFilters'), 'created_at_i>=1789344000,created_at_i<1789948800');
  assert.equal(params.get('hitsPerPage'), '10');
});

test('maps link posts', () => {
  const [story] = parseHits(hits);
  assert.deepEqual(story, {
    id: '101',
    title: 'Rust & "Go" – a comparison',
    url: 'https://www.example.com/a?x=1&y=2',
    site: 'example.com',
    points: 758,
    comments: 782,
    discussionUrl: 'https://news.ycombinator.com/item?id=101',
  });
});

test('points self posts at the HN discussion', () => {
  const [, story] = parseHits(hits);
  assert.equal(story.url, 'https://news.ycombinator.com/item?id=102');
  assert.equal(story.site, null);
  assert.equal(story.comments, 0);
});

test('retries rate-limited requests', async (t) => {
  const responses = [new Response('', { status: 429 }), Response.json({ hits })];
  t.mock.method(globalThis, 'fetch', async () => responses.shift());
  const result = await fetchTopStories('2026-09-14', 10, { delayMs: 0 });
  assert.equal(result.length, 2);
});

test('fails fast on client errors', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 400 }));
  await assert.rejects(fetchTopStories('2026-09-14', 10, { delayMs: 0 }), /400/);
});
