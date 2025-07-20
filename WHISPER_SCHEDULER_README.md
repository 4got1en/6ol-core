# Whisper Scheduler

The Whisper Scheduler is an automated daily process that manages whisper delivery and tracking for the 6ol Core system.

## Overview

The scheduler runs daily at 13:00 UTC via GitHub Actions and performs the following tasks:

1. **Whisper Statistics Processing**: Analyzes the whisper categories and tracks delivery metrics
2. **State Management**: Maintains persistent state data for tracking across runs
3. **Data Cleanup**: Removes old statistics (older than 30 days) to prevent data bloat
4. **Daily Reporting**: Generates comprehensive reports of whisper activity

## Features

- **Automated Execution**: Runs daily via GitHub Actions workflow
- **State Persistence**: Maintains run history and statistics in `data/whisper-state.json`
- **Category Tracking**: Processes all whisper categories (scrolls, rituals, journal, podcast, finance, legal, navarre)
- **Error Handling**: Graceful error handling with proper exit codes
- **Data Cleanup**: Automatic cleanup of old data to prevent storage bloat

## File Structure

```
scripts/
├── whisper-scheduler.js    # Main scheduler script
data/
├── whisper-state.json     # Persistent state data (auto-generated)
tests/
├── whisper-scheduler.test.js # Test suite for scheduler
```

## State Data Format

The scheduler maintains state in `data/whisper-state.json`:

```json
{
  "lastRun": "2025-07-20T08:44:36.630Z",
  "totalRuns": 1,
  "whisperStats": {
    "2025-07-20": {
      "date": "2025-07-20",
      "categoriesProcessed": 7,
      "totalWhispers": 28,
      "categoryBreakdown": {
        "scrolls": {
          "count": 4,
          "processed": true,
          "timestamp": "2025-07-20T08:44:36.630Z"
        }
        // ... other categories
      }
    }
  },
  "schedulerVersion": "1.0.0",
  "created": "2025-07-20T08:44:36.630Z"
}
```

## Running Locally

```bash
# Run the scheduler manually
node scripts/whisper-scheduler.js

# Run tests
npm test -- whisper-scheduler.test.js
```

## GitHub Actions Integration

The scheduler is automatically executed by the `whisper-scheduler.yml` workflow:

- **Schedule**: Daily at 13:00 UTC
- **Trigger**: Can also be manually triggered via `workflow_dispatch`
- **Environment**: Ubuntu latest with Node.js 22.x
- **Permissions**: Has access to GITHUB_TOKEN for potential future integrations

## Output Example

```
🌟 Starting Whisper Scheduler
⏰ Run time: 2025-07-20T08:44:36.629Z
🔄 Scheduler run #1
📊 Processed 7 whisper categories
📝 Total whispers tracked: 28
💾 Whisper state saved successfully

📋 Daily Whisper Report
========================
Date: 2025-07-20
Total Categories: 7
Total Whispers: 28

Category Breakdown:
  scrolls: 4 whispers
  rituals: 4 whispers
  journal: 4 whispers
  podcast: 4 whispers
  finance: 4 whispers
  legal: 4 whispers
  navarre: 4 whispers

✅ Daily processing complete
🎉 Whisper Scheduler completed successfully
```