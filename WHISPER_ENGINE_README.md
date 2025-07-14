# WhisperEngine Setup Instructions

## Overview

The WhisperEngine provides loop-aware scroll delivery with per-loop memory management and shadow scroll access control for users with Loop 3 access.

## Core Features

- **Loop-aware delivery**: Scrolls are delivered based on user's current loop level
- **Per-loop memory**: No repeated scrolls until all scrolls in a loop are delivered
- **Automatic reset**: When all scrolls in a loop are used, the system resets for a fresh cycle
- **Shadow scrolls**: Special scrolls in `/scrolls/shadow/` directory, accessible only to Loop 3 users
- **State persistence**: Uses `data/scrollCache.json` for tracking delivery state
- **GitHub Actions compatible**: Designed for bot runner integration

## Files Structure

```
whisperEngine.js          # Main engine (CREATED)
data/scrollCache.json      # State tracking (CREATED)
scrolls/shadow/            # Shadow scrolls directory (CREATED)
├── forbidden-truth.md     # Shadow scroll 1 (CREATED)
└── shadow-mastery.md      # Shadow scroll 2 (CREATED)
whisper-test.html          # Test console (CREATED)
```

## Integration with Existing System

The WhisperEngine integrates with the existing `loop-engine.js`:
- Reads current loop level from `localStorage.getItem('6ol_loop_level')`
- Uses same passphrase system (sol=1, luna=2, umbra=3)
- Maintains user identification via localStorage

## Environment Setup

### For Local Development

1. **File System Access**: The engine currently simulates file system access using localStorage
2. **CORS**: Serve files through a local server to avoid CORS issues
3. **Test Console**: Use `whisper-test.html` for manual testing

### For GitHub Actions/Bot Integration

The engine is designed to work in server environments with these environment variables:

```bash
# Optional: Set debug mode
WHISPER_DEBUG=true

# Storage paths (customize as needed)
WHISPER_CACHE_PATH=./data/scrollCache.json
WHISPER_SCROLLS_PATH=./scrolls/
WHISPER_SHADOW_PATH=./scrolls/shadow/

# User identification method (for bot integration)
WHISPER_USER_ID_METHOD=session|persistent|uuid
```

### For Production Deployment

1. **File System**: Ensure read/write access to `data/` directory
2. **Scroll Files**: Ensure all scroll files (.md) are accessible
3. **Persistence**: For server deployment, replace localStorage with proper database
4. **Rate Limiting**: Add rate limiting for scroll delivery in production

## API Usage

### Basic Usage

```javascript
// Initialize engine
const engine = new WhisperEngine();
await engine.initialize();

// Get next regular scroll
const scroll = await engine.getNextScroll();

// Get shadow scroll (requires Loop 3)
const shadowScroll = await engine.getNextScroll(null, 'shadow');

// Get user statistics
const stats = await engine.getUserStats();
```

### Response Format

#### Successful Scroll Delivery
```javascript
{
  success: true,
  scroll: {
    name: "daylight",
    type: "regular",
    loop: 1,
    path: "./scrolls/daylight.md",
    deliveredAt: "2024-01-01T00:00:00.000Z"
  },
  remaining: 0,
  delivered: 1
}
```

#### Loop Reset Response
```javascript
{
  success: true,
  message: "Loop 1 completed! All scrolls delivered. Starting fresh cycle.",
  scroll: null,
  action: "LOOP_RESET",
  loopCompleted: 1
}
```

#### Error Response
```javascript
{
  success: false,
  message: "Access requires Loop Level 1 or higher. Use passphrase 'sol' to unlock.",
  code: "INSUFFICIENT_LOOP_LEVEL"
}
```

## State Management

### ScrollCache Structure

The `data/scrollCache.json` tracks:
- User profiles with loop progress
- Available vs delivered scrolls per loop
- Shadow scroll state for Loop 3 users
- Global statistics and metadata

### Reset Logic

- **Per-loop reset**: When all scrolls in a loop are delivered, that loop's memory resets
- **Shadow reset**: Shadow scrolls reset independently from regular Loop 3 scrolls  
- **User reset**: Admin function to completely reset a user's progress

## Testing

### Manual Testing

1. Open `whisper-test.html` in a browser
2. Set different loop levels using the buttons
3. Request scrolls and observe delivery behavior
4. Test loop reset functionality
5. Verify shadow scroll access control

### Automated Testing

The engine includes comprehensive error handling and logging. In production:

1. Monitor console logs for delivery patterns
2. Check `data/scrollCache.json` for state consistency
3. Verify file access permissions for scroll directories
4. Test shadow scroll access restrictions

## Security Considerations

### Shadow Scroll Protection

- Shadow scrolls are only accessible to Loop 3 users
- Access is verified against current loop level stored in localStorage
- Shadow scroll directory is separate from regular scrolls

### State Protection

- User IDs are generated using crypto.randomUUID()
- State is tracked per user to prevent cross-contamination
- Reset functionality requires explicit admin action

## Bot Integration Example

```javascript
// Bot integration example
class ScrollBot {
  constructor() {
    this.engine = new WhisperEngine();
  }

  async deliverDailyScroll(userId) {
    try {
      await this.engine.initialize();
      const result = await this.engine.getNextScroll(userId);
      
      if (result.success && result.scroll) {
        // Send scroll content to user
        await this.sendMessage(userId, await this.loadScrollContent(result.scroll.path));
      } else {
        // Handle error or no-scroll cases
        await this.sendMessage(userId, result.message);
      }
    } catch (error) {
      console.error('Bot delivery failed:', error);
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Insufficient Loop Level"**: User needs to unlock higher loop with passphrase
2. **"No scrolls available"**: All scrolls in current loop delivered, waiting for reset
3. **"Shadow access denied"**: User not at Loop 3 or shadow scrolls disabled
4. **Cache corruption**: Clear localStorage and reinitialize

### Debug Mode

Enable debug logging by setting `CONFIG.DEBUG = true` in whisperEngine.js or by adding:
```javascript
window.whisperEngine.CONFIG.DEBUG = true;
```

All operations will log detailed information to the console.