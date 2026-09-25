# hn-bot

Posts the previous day's top [Hacker News](https://news.ycombinator.com/front) stories to a Discord channel once a day.

The bot reads `news.ycombinator.com/front?day=YYYY-MM-DD` and posts the stories as one embed through a Discord webhook. It has no dependencies and needs no always-on server.

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
| `HN_DAY`              | yesterday (UTC)   | Day to post, as `YYYY-MM-DD`  |

## Deployment

[.github/workflows/daily.yml](.github/workflows/daily.yml) runs the bot every day at 14:00 UTC.

1. Push this repository to GitHub.
2. Add the webhook URL as the `DISCORD_WEBHOOK_URL` repository secret.
3. Optional: set a `STORY_COUNT` repository variable.
4. To test, run the workflow from the **Actions** tab. You can pass a specific day.

GitHub disables scheduled workflows after 60 days without repository activity. Re-enable the workflow from the **Actions** tab if that happens.

## Tests

```bash
npm test
```
