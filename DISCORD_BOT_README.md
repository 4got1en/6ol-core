# 6ol Discord Bot

A Discord bot for the 6ol Core system, providing ritual management and progression tracking.

## Features

- `/ascend` - Manage user ascension and role progression
- `/reflect` - Daily reflection prompts and tracking
- `/whisper` - Access whisper engine content

## Setup

### Prerequisites

- Node.js 16+
- Discord bot token
- Bot permissions: Manage Roles, Send Messages, Use Slash Commands

### Installation

1. Clone the repository and install dependencies:
```bash
npm install discord.js
```

2. Create a `.env` file with your bot configuration:
```
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
```

3. Configure role IDs in `config/bot-config.json`:
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
- Graceful handling of missing flame data

### `/whisper`
Provides access to whisper engine content.

**Features:**
- Loop-level gated content
- Formatted embeds
- Error handling for missing content

## Configuration

All configuration is externalized to prevent hard-coded values:

- Role IDs in `config/bot-config.json`
- Flame data in `data/flameData.json`
- Environment variables in `.env`

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
- `commands/ascend.js` - Ascension command logic
- `commands/reflect.js` - Reflection command logic  
- `commands/whisper.js` - Whisper command logic
- `utils/loopRoles.js` - Role management utilities
- `config/` - Configuration files
- `data/` - Static data files