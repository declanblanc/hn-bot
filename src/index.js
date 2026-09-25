import { fetchTopStories } from './hn.js';
import { buildPayload, postToWebhook } from './discord.js';

function lastWeekStartUtc() {
  const d = new Date();
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday - 7);
  return d.toISOString().slice(0, 10);
}

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const weekStart = process.env.WEEK_START || lastWeekStartUtc();
const count = Number(process.env.STORY_COUNT) || 10;
const dryRun = process.argv.includes('--dry-run');

if (!webhookUrl && !dryRun) {
  console.error('DISCORD_WEBHOOK_URL is not set. Pass --dry-run to print the payload instead.');
  process.exit(1);
}

const stories = await fetchTopStories(weekStart, count);
if (stories.length === 0) throw new Error(`No stories found for the week of ${weekStart}`);

const payload = buildPayload(weekStart, stories);
if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  await postToWebhook(webhookUrl, payload);
  console.log(`Posted ${stories.length} stories for the week of ${weekStart}`);
}
