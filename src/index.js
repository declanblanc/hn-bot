import { fetchFrontPage } from './hn.js';
import { buildPayload, postToWebhook } from './discord.js';

function yesterdayUtc() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const day = process.env.HN_DAY || yesterdayUtc();
const count = Number(process.env.STORY_COUNT) || 10;
const dryRun = process.argv.includes('--dry-run');

if (!webhookUrl && !dryRun) {
  console.error('DISCORD_WEBHOOK_URL is not set. Pass --dry-run to print the payload instead.');
  process.exit(1);
}

const stories = (await fetchFrontPage(day)).slice(0, count);
if (stories.length === 0) throw new Error(`No stories found for ${day}`);

const payload = buildPayload(day, stories);
if (dryRun) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  await postToWebhook(webhookUrl, payload);
  console.log(`Posted ${stories.length} stories for ${day}`);
}
