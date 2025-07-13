# Whisper Engine v3: Loop-Bound Drops

Whisper Engine v3 implements automated Discord scroll delivery based on user Loop roles, with daily scheduled drops at 13:00 UTC.

## Overview

The Whisper Engine v3 system maps Discord Loop roles to predefined tags and delivers appropriate scrolls to users based on their highest Loop role. It maintains backwards compatibility with the existing scroll system while adding new Discord automation capabilities.

## Loop Role Mappings

### Loop 1 — The Seeker's Path
**Discord Role:** `Loop 1`  
**Tags:** `beginner`, `seeker`, `invocation`, `spark`, `light`, `calling`  
**Priority:** 1 (lowest)

### Loop 2 — The Devoted Path  
**Discord Role:** `Loop 2`  
**Tags:** `devotion`, `ritual`, `structure`, `mirror`, `discipline`, `rooted`  
**Priority:** 2 (medium)

### Loop 3 — The Shadow Path
**Discord Role:** `Loop 3`  
**Tags:** `shadow`, `revelation`, `unseen`, `veil`, `echo`, `sacrifice`  
**Priority:** 3 (highest)

## System Architecture

### Configuration Files

- **`config/loop-roles.json`** - Defines role-to-tag mappings and system settings
- **`scrolls/manifest.json`** - Extended with `loop_level` and `tags` fields
- **`scrolls/*.md`** - Scroll files with updated frontmatter including tags

### Core Components

- **`whisper-engine-v3.js`** - Main Discord bot with scheduling and delivery logic
- **`test-whisper-engine.js`** - Test suite for scroll selection logic

## Features

### Automatic Daily Drops
- Scheduled at 13:00 UTC daily using cron
- Delivers to `#whisper-engine` channel
- Random scroll selection from appropriate tag pool

### User Role Detection
- Reads Discord user roles automatically
- Prioritizes highest Loop role (Loop 3 > Loop 2 > Loop 1)
- Falls back to `seeker` tag for users without Loop roles

### Embedded Messages
- Rich Discord embeds showing:
  - User's loop role and path name
  - Tag source (with fallback indicator)
  - Scroll filename and title
  - Color-coded by Loop level

### Fallback System
- Default to `seeker` tag if no role matches found
- Final fallback to random scroll if no tag matches
- Ensures delivery always succeeds

## Installation & Setup

### Prerequisites
```bash
npm install discord.js node-cron
```

### Environment Variables
```bash
export DISCORD_TOKEN="your_discord_bot_token"
export GUILD_ID="your_guild_id"  # Optional
```

### Running the Bot
```bash
# Production
npm run whisper-engine

# Development with auto-reload
npm run dev:whisper

# Testing logic only
node test-whisper-engine.js
```

## Usage

### Discord Integration
1. Add bot to Discord server with appropriate permissions
2. Create `#whisper-engine` channel for drops
3. Assign Loop roles to users: `Loop 1`, `Loop 2`, `Loop 3`
4. Bot automatically handles daily drops at 13:00 UTC

### Manual Testing
The system includes a test script that validates:
- Role detection priority (highest wins)
- Tag mapping accuracy  
- Scroll selection logic
- Fallback behavior

### Scroll Tagging
Scrolls must include tags in their frontmatter:
```yaml
---
title: "Scroll Title"
loop_level: 1
tags: ["beginner", "seeker", "light"]
---
```

## Backwards Compatibility

### Existing Systems
- Ritual Core WhisperEngine remains unchanged
- Loop Engine progression system unaffected
- Existing scroll files maintain compatibility
- Web interface continues to function

### Migration Strategy
- Adds tags to existing scrolls without breaking functionality
- New configuration files don't interfere with existing systems
- Bot runs independently of web components

## Configuration Reference

### Loop Roles Configuration
```json
{
  "loopMappings": {
    "Loop 1": {
      "name": "The Seeker's Path",
      "tags": ["beginner", "seeker", "invocation", "spark", "light", "calling"],
      "priority": 1
    }
  },
  "fallbackTag": "seeker",
  "scheduleConfig": {
    "dropTime": "13:00",
    "timezone": "UTC", 
    "channelName": "#whisper-engine"
  }
}
```

### Scroll Manifest Schema
```json
[
  {
    "filename": "scroll.md",
    "title": "Scroll Title",
    "summary": "Brief description",
    "loop_level": 1,
    "tags": ["tag1", "tag2"]
  }
]
```

## Troubleshooting

### Common Issues

**Bot not responding:**
- Check DISCORD_TOKEN is set correctly
- Verify bot has necessary permissions in Discord
- Ensure #whisper-engine channel exists

**No scrolls delivered:**
- Check scroll tags match Loop mappings
- Verify manifest.json has correct format
- Ensure fallback scroll has 'seeker' tag

**Wrong scroll selection:**
- Test role detection with test-whisper-engine.js
- Verify user has correct Loop roles in Discord
- Check tag mappings in config/loop-roles.json

### Debugging
```bash
# Test scroll selection logic
node test-whisper-engine.js

# Check configuration loading
node -e "console.log(JSON.parse(require('fs').readFileSync('config/loop-roles.json')))"

# Verify scroll tags
node -e "console.log(JSON.parse(require('fs').readFileSync('scrolls/manifest.json')))"
```

## Extension Points

### Adding New Loops
1. Add new mapping to `config/loop-roles.json`
2. Create scrolls with appropriate tags
3. Update manifest.json
4. Test with test-whisper-engine.js

### Custom Scheduling
Modify cron expression in `whisper-engine-v3.js`:
```javascript
const cronExpression = '0 13 * * *'; // Daily at 13:00 UTC
```

### Enhanced Targeting
The system supports future enhancements like:
- User-specific scroll preferences
- Streak tracking
- Custom delivery channels
- Integration with ritual completion

## Security Considerations

- Discord token stored in environment variables
- No sensitive data in scroll content
- Bot permissions limited to reading roles and sending messages
- Graceful error handling prevents crashes