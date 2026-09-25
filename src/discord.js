import { browseUrl } from './hn.js';

const API = 'https://discord.com/api/v10';
const USER_AGENT = 'DiscordBot (https://github.com/declanblanc/hn-bot, 1.0.0)';
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

export function formatWeek(weekStart) {
  return new Date(`${weekStart}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function buildPayload(weekStart, stories) {
  let description = '';
  for (const [i, story] of stories.entries()) {
    const entry = (description ? '\n\n' : '') + formatStory(story, i + 1);
    if (description.length + entry.length > MAX_DESCRIPTION) break;
    description += entry;
  }

  return {
    embeds: [
      {
        title: `Top Hacker News stories for the week of ${formatWeek(weekStart)}`,
        url: browseUrl(weekStart),
        color: HN_ORANGE,
        description,
      },
    ],
    allowed_mentions: { parse: [] },
  };
}

async function discordRequest(token, path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Discord returned ${res.status} for ${path}: ${await res.text()}`);
  }
  return res.json();
}

export async function postWithThread(token, channelId, payload, { threadName, threadMessage }) {
  const message = await discordRequest(token, `/channels/${channelId}/messages`, payload);
  const thread = await discordRequest(token, `/channels/${channelId}/messages/${message.id}/threads`, {
    name: threadName,
    auto_archive_duration: 10080,
  });
  await discordRequest(token, `/channels/${thread.id}/messages`, { content: threadMessage });
  return { message, thread };
}
