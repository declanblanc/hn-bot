import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, formatStory, postWithThread } from '../src/discord.js';

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

test('builds an embed titled with the week', () => {
  const { embeds } = buildPayload('2026-09-14', [story]);
  assert.equal(embeds[0].title, 'Top Hacker News stories for the week of September 14, 2026');
  assert.match(embeds[0].url, /^https:\/\/hn\.algolia\.com\/\?dateRange=custom&dateStart=1789344000&/);
});

test('keeps the description within the Discord limit', () => {
  const long = { ...story, title: 'x'.repeat(500) };
  const { embeds } = buildPayload('2026-09-14', Array(30).fill(long));
  assert.ok(embeds[0].description.length <= 4096);
  assert.ok(!embeds[0].description.endsWith('\n'));
});

test('posts the message, opens a thread on it, and posts in the thread', async (t) => {
  const replies = [{ id: 'm1' }, { id: 't1' }, { id: 'm2' }];
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(replies.shift()));
  const payload = buildPayload('2026-09-14', [story]);

  await postWithThread('tok', 'c1', payload, { threadName: 'Week', threadMessage: 'Chat here' });

  const calls = fetchMock.mock.calls.map(({ arguments: [url, init] }) => ({
    url,
    auth: init.headers.Authorization,
    body: JSON.parse(init.body),
  }));
  assert.deepEqual(
    calls.map((c) => c.url),
    [
      'https://discord.com/api/v10/channels/c1/messages',
      'https://discord.com/api/v10/channels/c1/messages/m1/threads',
      'https://discord.com/api/v10/channels/t1/messages',
    ],
  );
  assert.ok(calls.every((c) => c.auth === 'Bot tok'));
  assert.deepEqual(calls[0].body, payload);
  assert.equal(calls[1].body.name, 'Week');
  assert.deepEqual(calls[2].body, { content: 'Chat here' });
});

test('surfaces Discord errors', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Missing Access', { status: 403 }));
  await assert.rejects(
    postWithThread('tok', 'c1', {}, { threadName: 'W', threadMessage: 'M' }),
    /403 for \/channels\/c1\/messages: Missing Access/,
  );
});
