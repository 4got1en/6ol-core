
# 6ol Discord Bot

A Discord bot for the 6ol Core system, providing ritual management, progression tracking, vault journaling, and automated workflows.


## Features

- `/ascend` — Manage user ascension and role progression
- `/reflect` — Daily reflection prompts, tracked and journaled to the vault
- `/whisper` — Access whisper engine content (loop-level gated)
- `/health` — Check if the bot is online and healthy
- **Vault Journaling** — All reflections and rituals are committed to the [6ol-data-vault](https://github.com/4got1en/6ol-data-vault)
- **Automated Workflows** — CI/CD, scheduled jobs, and persistent hosting

## Setup

### Prerequisites

- Node.js 16+
- Discord bot token
- Bot permissions: Manage Roles, Send Messages, Use Slash Commands


### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your bot configuration:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   GUILD_ID=your_server_id_here
   VAULT_PUSH_TOKEN=your_github_token_for_vault
   ```

3. Configure role and channel IDs in `config/bot-config.json`:
   ```json
   {
     "roles": {
       "initiate": "role_id_here",
       "seeker": "role_id_here",
       "witness": "role_id_here",
       "architect": "role_id_here",
       "lightbearer": "role_id_here"
     },
     "channels": {
       "reflections": "channel_id_here",
       "whispers": "channel_id_here"
     }
   }
   ```


### Running the Bot

```bash
node bot.js
# or use PM2 for persistent hosting
pm2 start bot.js --name 6ol-bot
```


## Commands

### `/ascend`
Promotes user to the next loop level if requirements are met.

**Permissions Required:**
- Bot must have "Manage Roles" permission
- Bot role must be higher than target roles in hierarchy

**Error Handling:**
- Gracefully handles missing permissions
- Validates role hierarchy before assignment
- Provides clear error messages to users

### `/reflect`
Prompts for daily reflection based on user's current loop level.

**Features:**
- Level-appropriate reflection prompts
- Progress tracking
- **Vault journaling:** Each reflection is committed to the [6ol-data-vault](https://github.com/4got1en/6ol-data-vault) via GitHub API
- Graceful handling of missing flame data

### `/whisper`
Provides access to whisper engine content.

**Features:**
- Loop-level gated content
- Formatted embeds
- Error handling for missing content

### `/health`
Checks if the bot is online and healthy.

**Features:**
- Quick status check for uptime and monitoring


## Configuration

All configuration is externalized to prevent hard-coded values:

- Role IDs in `config/bot-config.json`
- Flame data in `data/flameData.json`
- Environment variables in `.env`


## Vault Journaling

- **All reflections and rituals** are automatically committed to the [6ol-data-vault](https://github.com/4got1en/6ol-data-vault) repository.
- Uses a GitHub token (`VAULT_PUSH_TOKEN`) for secure API access.
- See `utils/vaultCommit.js` for commit logic.

## Health Check

- Use `/health` to verify the bot is online and responding.
- Useful for monitoring and troubleshooting.

## Automation & Workflows

- **CI/CD:** Automated tests run on every push/PR (`.github/workflows/test.yml`).
- **Deploy:** Bot auto-deploys to Render on main branch push (`.github/workflows/deploy-bot.yml`).
- **Scheduler:** Daily whisper jobs via GitHub Actions (`.github/workflows/whisper-scheduler.yml`).
- **Persistent Hosting:** Use PM2 for uptime and autostart.

## Error Handling

The bot implements comprehensive error handling:

- All async operations wrapped in try/catch
- Graceful degradation for missing data
- User-friendly error messages
- Detailed logging for debugging

## Testing

Run tests with:
```bash
npm test
```

Tests cover:
- Command success paths
- Error conditions
- Permission validation
- Role hierarchy checks

## Architecture

- `bot.js` - Main bot file and command registration
- `slash/ascend.js` - Ascension command logic
- `slash/reflect.js` - Reflection command logic  
- `slash/whisper.js` - Whisper command logic
- `utils/loopRoles.js` - Role management utilities
- `config/` - Configuration files
- `data/` - Static data files