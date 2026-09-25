import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, formatStory } from '../src/discord.js';

const story = {
  id: '1',
  title: 'Show HN: [Beta] my_project',
  url: 'https://example.com/',
  site: 'example.com',
  points: 42,
  comments: 1,
  discussionUrl: 'https://news.ycombinator.com/item?id=1',
};

test('formats a story as a markdown link with stats', () => {
  assert.equal(
    formatStory(story, 3),
    '**3. [Show HN: \\[Beta\\] my\\_project](https://example.com/)** (example.com)\n' +
      '42 points · [1 comment](https://news.ycombinator.com/item?id=1)',
  );
});

test('omits points and site when absent', () => {
  const line = formatStory({ ...story, points: null, site: null }, 1);
  assert.match(line, /\)\*\*\n\[1 comment\]/);
});

test('builds an embed titled with the day', () => {
  const { embeds } = buildPayload('2026-09-23', [story]);
  assert.equal(embeds[0].title, 'Top Hacker News stories for Wednesday, September 23, 2026');
  assert.equal(embeds[0].url, 'https://news.ycombinator.com/front?day=2026-09-23');
});

test('keeps the description within the Discord limit', () => {
  const long = { ...story, title: 'x'.repeat(500) };
  const { embeds } = buildPayload('2026-09-23', Array(30).fill(long));
  assert.ok(embeds[0].description.length <= 4096);
  assert.ok(!embeds[0].description.endsWith('\n'));
});
