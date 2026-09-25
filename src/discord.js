import { browseUrl } from './hn.js';

const HN_ORANGE = 0xff6600;
const MAX_DESCRIPTION = 4096;
const MAX_TITLE = 200;

function escapeMarkdown(text) {
  return text.replace(/[\\[\]()*_~`|>]/g, '\\$&');
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function formatStory(story, rank) {
  const title = escapeMarkdown(truncate(story.title, MAX_TITLE));
  const site = story.site ? ` (${story.site})` : '';
  const stats = [
    story.points !== null && plural(story.points, 'point'),
    `[${plural(story.comments, 'comment')}](${story.discussionUrl})`,
  ].filter(Boolean);
  return `**${rank}. [${title}](${story.url})**${site}\n${stats.join(' · ')}`;
}

export function buildPayload(weekStart, stories) {
  const date = new Date(`${weekStart}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  let description = '';
  for (const [i, story] of stories.entries()) {
    const entry = (description ? '\n\n' : '') + formatStory(story, i + 1);
    if (description.length + entry.length > MAX_DESCRIPTION) break;
    description += entry;
  }

  return {
    embeds: [
      {
        title: `Top Hacker News stories for the week of ${date}`,
        url: browseUrl(weekStart),
        color: HN_ORANGE,
        description,
      },
    ],
    allowed_mentions: { parse: [] },
  };
}

export async function postToWebhook(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Discord returned ${res.status}: ${await res.text()}`);
  }
}
