# [⬅️ Back to Start](../README.md)
# 6ol Core Monitoring & Reporting

## Automated Monitoring
- **/health Command:** Use in Discord to check if the bot is online.
- **GitHub Actions:** All workflows report status in the Actions tab.
- **PM2:** Use `pm2 status` to check bot uptime and logs.

on:
jobs:

## Adding Automated Reporting
You can add workflows to periodically check bot health and notify maintainers, and to generate daily/weekly summary reports.

### Example: Scheduled Health Check Workflow

Create `.github/workflows/health-check.yml`:
```yaml
name: Scheduled Health Check
on:
  schedule:
    - cron: '0 * * * *' # Every hour
jobs:
  health:
    runs-on: ubuntu-latest
    steps:
      - name: Check 6ol Bot Health
        run: |
          curl -f https://your-bot-health-endpoint || echo "Bot health check failed!"
      # Add notification step here (e.g., Discord webhook, email)
```

### Example: Daily/Weekly Summary Reporting (Placeholder)

You can create a workflow or script to summarize user activity (reflections, ascensions, etc.) and post to a Discord channel or email. Example steps:

1. Query the vault or bot logs for activity in the last day/week.
2. Format a summary message (e.g., number of reflections, new ascensions).
3. Use a Discord webhook or email action to send the report.

_See [Actions documentation](https://docs.github.com/en/actions) for custom workflow scripting._

## Manual Monitoring
- Check Discord for `/health` responses
- Review logs in Render, PM2, or GitHub Actions

---

For advanced monitoring, consider integrating with Discord webhooks, email, or external services.
