# Discord Whisper Action Setup Guide

This directory contains the whisper-action.js script that automatically posts daily whispers to Discord.

## Required GitHub Secrets

To use this automation, you need to set up the following secrets in your GitHub repository:

1. **DISCORD_TOKEN**: Your Discord bot token
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Add new repository secret with name: `DISCORD_TOKEN`
   - Value should be your Discord bot token

2. **DISCORD_CHANNEL_ID**: The Discord channel ID where messages should be posted
   - Go to GitHub repository → Settings → Secrets and variables → Actions  
   - Add new repository secret with name: `DISCORD_CHANNEL_ID`
   - Value should be the Discord channel ID (numeric string)

## How it works

The script:
1. Randomly selects a file from the `scrolls/loop1/` directory
2. Extracts the first 6 meaningful lines of content
3. Posts formatted message to the specified Discord channel
4. Runs automatically daily at 1 PM UTC via GitHub Actions

## Manual Testing

To test the script manually (requires Discord credentials):

```bash
DISCORD_TOKEN="your_token" DISCORD_CHANNEL_ID="your_channel_id" node .github/scripts/whisper-action.js
```

## Files

- `whisper-action.js`: The main script that posts whispers to Discord
- `../workflows/whisper.yml`: GitHub Actions workflow that runs the script daily