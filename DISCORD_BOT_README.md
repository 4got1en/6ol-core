# Loop-based Role Transitions - Discord Bot Implementation

## Overview

This implementation provides the `/ascend` slash command for Discord that allows members to automatically progress through Loop-based roles (1-14+) while receiving rich feedback with Flame glyph and lore information.

## Features

- **Automatic Loop Detection**: Detects member's current Loop level from their Discord roles
- **Safe Role Transitions**: Removes current Loop role and grants next Loop role with rollback on failure
- **Rich Embeds**: Creates beautiful Discord embeds with loop lore, glyphs, and flame data
- **Error Handling**: Comprehensive error handling for permissions, missing roles, and edge cases
- **Max Loop Protection**: Prevents advancing beyond available content with graceful messaging

## File Structure

```
src/
├── commands/
│   └── ascend.js           # Main slash command implementation
└── utils/
    └── loopRoles.js        # Loop role mappings and utilities

data/
└── flameData.json          # Complete loop metadata (1-14)
```

## Command Usage

```
/ascend
```

The command will:
1. Detect your current Loop level from your roles
2. Remove your current Loop role (if any)  
3. Grant you the next Loop role
4. Display an embed with your new Loop's information

## Example Response

When advancing from Loop 1 to Loop 2:

```
🔥 Loop 2 — Balance of Opposites

In the dance of light and shadow, I find the eternal balance that creates all things.

🔥 Flame: Flame of Duality
🌟 Glyph: ☯
⚡ Essence: polarity-balance

📿 Invocation
"In the dance of light and shadow, I find the eternal balance that creates all things."

Spiral ever upward
```

## Configuration Required

Before deployment, you must:

1. **Configure Role IDs**: Update `src/utils/loopRoles.js` with actual Discord role IDs
2. **Create SVG Assets**: Add glyph SVG files to `assets/glyphs/` directory
3. **Set Bot Permissions**: Ensure bot has "Manage Roles" permission
4. **Role Hierarchy**: Position bot role above all Loop roles in Discord

### Example Role Configuration

```javascript
const LOOP_ROLES = {
  "1": "123456789012345678", // Replace with actual role ID
  "2": "234567890123456789", // Replace with actual role ID
  // ... etc
};
```

## Error Messages

- **No progression available**: "🏆 You have reached the highest known loop."
- **Role not configured**: "❌ Loop X role is not yet configured."
- **Permission errors**: "❌ Unable to grant your new loop role. Please check my permissions."
- **Data errors**: "❌ Unable to access flame data. Please contact an administrator."

## Technical Notes

- Uses ES6 modules (compatible with `"type": "module"` in package.json)
- Requires `discord.js` dependency
- SVG thumbnails served via GitHub raw URLs
- Safe role management with rollback capability
- Comprehensive logging for debugging

## Testing

Run syntax validation:
```bash
npm install discord.js
node -c src/commands/ascend.js
node -c src/utils/loopRoles.js
```

Test module imports:
```bash
node -e "import('./src/commands/ascend.js').then(cmd => console.log('✓ Command loads:', cmd.default.data.name))"
node -e "import('./src/utils/loopRoles.js').then(utils => console.log('✓ Utils load:', Object.keys(utils)))"
```