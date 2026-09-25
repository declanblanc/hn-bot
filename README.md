# hn-bot

Posts last week's top [Hacker News](https://news.ycombinator.com/) stories to a Discord channel every Monday.

The bot queries the [HN Search API](https://hn.algolia.com/api) for stories posted Monday through Sunday (UTC), ranks them by points, and posts them as one embed. It then opens a thread on the post for discussion. It has no dependencies and needs no always-on server.

## Setup

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application. On the **Bot** page, reset and copy the token.
2. Invite the bot to your server. Replace `APP_ID` with the application ID from the **General Information** page:

   ```text
   https://discord.com/oauth2/authorize?client_id=APP_ID&scope=bot&permissions=309237664768
   ```

   This grants View Channel, Send Messages, Embed Links, Create Public Threads, and Send Messages in Threads.
3. In Discord, enable **User Settings > Advanced > Developer Mode**. Right-click the target channel and choose **Copy Channel ID**.
4. Run a dry run to preview the payload:

   ```bash
   npm run start -- --dry-run
   ```

5. Post for real:

   ```bash
   DISCORD_BOT_TOKEN=... DISCORD_CHANNEL_ID=... npm start
   ```

## Configuration

| Variable             | Default         | Description                                 |
| -------------------- | --------------- | ------------------------------------------- |
| `DISCORD_BOT_TOKEN`  | required        | Bot token                                   |
| `DISCORD_CHANNEL_ID` | required        | Channel to post to                          |
| `STORY_COUNT`        | `10`            | Number of stories to post                   |
| `WEEK_START`         | last week (UTC) | Monday of the week to post, as `YYYY-MM-DD` |

## Deployment

[.github/workflows/weekly.yml](.github/workflows/weekly.yml) runs the bot every Monday at 14:00 UTC.

1. Push this repository to GitHub.
2. Add the bot token as the `DISCORD_BOT_TOKEN` repository secret.
3. Add the channel ID as the `DISCORD_CHANNEL_ID` repository variable.
4. Optional: set a `STORY_COUNT` repository variable.
5. To test, run the workflow from the **Actions** tab. You can pass a specific week.

GitHub disables scheduled workflows after 60 days without repository activity. Re-enable the workflow from the **Actions** tab if that happens.

## Tests

```bash
npm test
```
