import { fetchTopStories } from './hn.js';
import { buildPayload, formatWeek, postWithThread } from './discord.js';
import { identify } from './gateway.js';

const THREAD_MESSAGE = 'Want to chat about an article? Use this thread!';

function lastWeekStartUtc() {
  const d = new Date();
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday - 7);
  return d.toISOString().slice(0, 10);
}

const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
const weekStart = process.env.WEEK_START || lastWeekStartUtc();
const count = Number(process.env.STORY_COUNT) || 10;
const dryRun = process.argv.includes('--dry-run');

if ((!token || !channelId) && !dryRun) {
  console.error('Set DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID, or pass --dry-run to print the payload instead.');
  process.exit(1);
}

const stories = await fetchTopStories(weekStart, count);
if (stories.length === 0) throw new Error(`No stories found for the week of ${weekStart}`);

const payload = buildPayload(weekStart, stories);
if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  await identify(token);
  await postWithThread(token, channelId, payload, {
    threadName: `Week of ${formatWeek(weekStart)}`,
    threadMessage: THREAD_MESSAGE,
  });
  console.log(`Posted ${stories.length} stories for the week of ${weekStart}`);
}
