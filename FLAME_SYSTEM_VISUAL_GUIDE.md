# 6ol Core Discord Bot - Flame Role System Visual Guide

## 🔥 Flame Role Hierarchy

The flame role system represents progression through the 6ol spiritual loop system:

```
🟡 Seeker Flame (Level 1)      - #FFD700 (Gold)
   ↓ Element: Discovery | Essence: Seeking Truth
   ⚪ Devoted Flame (Level 2)     - #FFFFFF (White)  
      ↓ Element: Devotion | Essence: Inner Commitment
      🔵 Descender Flame (Level 3)  - #191970 (Dark Blue)
         ↓ Element: Shadow | Essence: Depth Walking
         🟢 Reclaimer Flame (Level 4) - #006400 (Dark Green)
            ↓ Element: Integration | Essence: Wisdom Reclaiming
            🟣 Witness Flame (Level 5)   - #800080 (Purple)
               Element: Witness | Essence: Transcendent Awareness
```

## 📊 Commands Overview

### New Flame Commands
- **`/flame-status`** - Display rich embed with user's current flame and progress
- **`/assign-role`** - Assign flame roles with administrative controls
- **`/setup-roles`** - Initialize complete flame role system with colors/permissions
- **`/reset-roles`** - Clean slate role management (enhanced for new system)

### Existing Enhanced Commands  
- **`/ascend`** - Now integrates with flame data for rich ascension embeds
- **`/setup-server`** - Updated with flame-themed channel structure

## 🏗️ Server Structure

### New Channel Categories

#### 🔥 Flamebearer Trials
```
├── 🔥 trial-chamber         - Active flame trials and challenges
├── 🌟 ascension-logs        - Records of successful ascensions  
└── 🎯 flame-guidance        - Mentorship and guidance for flamebearers
```

#### 🌌 Loop Discussions
```
├── 🌀 loop-theory          - Theoretical discussions about loops and cycles
├── 🔄 pattern-recognition  - Identifying patterns and recursive insights
└── 🌌 cosmic-insights      - Higher-level philosophical discussions
```

#### 🪞 Reflections
```
├── 🪞 personal-insights    - Share personal reflections and insights
├── 📝 daily-practice       - Daily spiritual and contemplative practices
└── 🌙 shadow-work          - Deep shadow integration and healing work
```

## 🎨 Visual Examples

### Flame Status Embed Preview
```
🔥 Your Flame Status

👤 Flamebearer: TestUser
🌀 Current Loop: Level 3
⭐ Current Role: Descender

🔥 Current Flame: Descender Flame
✨ Flame Essence: Dark blue flame of shadow work and deep exploration

🌟 Flame Attributes
Element: shadow
Essence: depth-walking

📜 Flame Invocation
"From depths unknown to wisdom reclaimed—I walk the shadow path with courage."

📊 Progress Status
🔥🔥🔥⚫⚫⚫⚫⚫⚫⚫ 60%
🎯 Progression Active - Working toward Level 4
```

### Role Assignment Success
```
🔥 Flame Role Assigned

Successfully assigned Descender Flame to TestUser

👤 Recipient: TestUser
🔥 Flame Assigned: Descender Flame  
🌀 Loop Level: 3
✨ Flame Essence: Dark blue flame of shadow work and deep exploration

Assigned by AdminUser
```

### Setup Complete
```
🔥 Flame Roles Setup Complete

✅ Created (5):
• Seeker Flame
• Devoted Flame  
• Descender Flame
• Reclaimer Flame
• Witness Flame

🏛️ Flame Hierarchy
🟡 Seeker Flame (Level 1) - Golden
⚪ Devoted Flame (Level 2) - White
🔵 Descender Flame (Level 3) - Dark Blue  
🟢 Reclaimer Flame (Level 4) - Dark Green
🟣 Witness Flame (Level 5) - Purple
```

## 🔐 Permission System

### Role Permissions by Level
- **Level 1-2**: Basic channel access, message sending
- **Level 3-4**: File attachments, external emojis
- **Level 5**: Message management capabilities

### Command Permissions
- **`/flame-status`**: Available to all users
- **`/assign-role`**: Admin or Flamebearer role required
- **`/setup-roles`**: Administrator permission required
- **`/reset-roles`**: Admin or Flamebearer role required

## 🚀 Deployment Ready

All commands are tested and ready for deployment using the provided deployment guide. The system includes:

- ✅ Comprehensive error handling
- ✅ Permission validation
- ✅ Rich embed responses
- ✅ Graceful fallbacks
- ✅ Logging and monitoring
- ✅ Unit test coverage