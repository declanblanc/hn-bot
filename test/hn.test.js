import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseFrontPage } from '../src/hn.js';

const html = await readFile(new URL('./fixtures/front.html', import.meta.url), 'utf8');
const stories = parseFrontPage(html);

test('parses every story row', () => {
  assert.deepEqual(stories.map((s) => s.id), ['101', '102', '103']);
});

test('decodes entities in titles and URLs', () => {
  assert.equal(stories[0].title, 'Rust & "Go" – a comparison');
  assert.equal(stories[0].url, 'https://example.com/a?x=1&y=2');
});

test('reads points, comments, and site', () => {
  assert.equal(stories[0].points, 758);
  assert.equal(stories[0].comments, 782);
  assert.equal(stories[0].site, 'example.com');
  assert.equal(stories[0].discussionUrl, 'https://news.ycombinator.com/item?id=101');
});

test('resolves self posts to absolute HN URLs', () => {
  assert.equal(stories[1].url, 'https://news.ycombinator.com/item?id=102');
  assert.equal(stories[1].site, null);
  assert.equal(stories[1].points, 1);
  assert.equal(stories[1].comments, 0);
});

test('handles job posts without a score', () => {
  assert.equal(stories[2].points, null);
  assert.equal(stories[2].comments, 0);
});
