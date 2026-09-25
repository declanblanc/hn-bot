# hn-bot

Posts last week's top [Hacker News](https://news.ycombinator.com/) stories to a Discord channel every Monday.

The bot queries the [HN Search API](https://hn.algolia.com/api) for stories posted Monday through Sunday (UTC), ranks them by points, and posts them as one embed through a Discord webhook. It has no dependencies and needs no always-on server.

## Setup

1. In Discord, open **Server Settings > Integrations > Webhooks** and create a webhook for the target channel. Copy its URL.
2. Run a dry run to preview the payload:

   ```bash
   npm run start -- --dry-run
   ```

3. Post for real:

   ```bash
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... npm start
   ```

## Configuration

| Variable              | Default           | Description                   |
| --------------------- | ----------------- | ----------------------------- |
| `DISCORD_WEBHOOK_URL` | required          | Webhook to post to            |
| `STORY_COUNT`         | `10`              | Number of stories to post     |
| `WEEK_START`          | last week (UTC)   | Monday of the week to post, as `YYYY-MM-DD` |

## Deployment

[.github/workflows/weekly.yml](.github/workflows/weekly.yml) runs the bot every Monday at 14:00 UTC.

1. Push this repository to GitHub.
2. Add the webhook URL as the `DISCORD_WEBHOOK_URL` repository secret.
3. Optional: set a `STORY_COUNT` repository variable.
4. To test, run the workflow from the **Actions** tab. You can pass a specific week.

GitHub disables scheduled workflows after 60 days without repository activity. Re-enable the workflow from the **Actions** tab if that happens.

## Tests

```bash
npm test
```
