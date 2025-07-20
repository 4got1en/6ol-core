#!/usr/bin/env node
/**
 * Whisper Scheduler - Daily automated whisper processing
 * Runs as part of GitHub Actions to manage whisper delivery and state
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = './data';
const WHISPER_STATE_FILE = join(DATA_DIR, 'whisper-state.json');
const WHISPERS_FILE = './whispers.json';

/**
 * Load whisper data
 */
function loadWhispers() {
  try {
    const content = readFileSync(WHISPERS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load whispers.json:', error.message);
    process.exit(1);
  }
}

/**
 * Load or initialize whisper state
 */
function loadWhisperState() {
  if (!existsSync(WHISPER_STATE_FILE)) {
    // Initialize default state
    const defaultState = {
      lastRun: null,
      totalRuns: 0,
      whisperStats: {},
      schedulerVersion: '1.0.0',
      created: new Date().toISOString()
    };
    saveWhisperState(defaultState);
    return defaultState;
  }

  try {
    const content = readFileSync(WHISPER_STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('⚠️  Failed to load whisper state, initializing fresh:', error.message);
    return {
      lastRun: null,
      totalRuns: 0,
      whisperStats: {},
      schedulerVersion: '1.0.0',
      created: new Date().toISOString()
    };
  }
}

/**
 * Save whisper state
 */
function saveWhisperState(state) {
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      import('fs').then(fs => fs.mkdirSync(DATA_DIR, { recursive: true }));
    }
    
    writeFileSync(WHISPER_STATE_FILE, JSON.stringify(state, null, 2) + '\n');
    console.log('💾 Whisper state saved successfully');
  } catch (error) {
    console.error('❌ Failed to save whisper state:', error.message);
  }
}

/**
 * Process daily whisper statistics
 */
function processWhisperStats(whispers, state) {
  const categories = Object.keys(whispers);
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize stats for today if not exists
  if (!state.whisperStats[today]) {
    state.whisperStats[today] = {
      date: today,
      categoriesProcessed: 0,
      totalWhispers: 0,
      categoryBreakdown: {}
    };
  }

  const todayStats = state.whisperStats[today];

  // Process each category
  categories.forEach(category => {
    const categoryWhispers = whispers[category];
    const whisperCount = Object.keys(categoryWhispers).length;
    
    todayStats.categoryBreakdown[category] = {
      count: whisperCount,
      processed: true,
      timestamp: new Date().toISOString()
    };
    
    todayStats.totalWhispers += whisperCount;
  });

  todayStats.categoriesProcessed = categories.length;
  
  console.log(`📊 Processed ${categories.length} whisper categories`);
  console.log(`📝 Total whispers tracked: ${todayStats.totalWhispers}`);
  
  return state;
}

/**
 * Clean up old statistics (keep last 30 days)
 */
function cleanupOldStats(state) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  
  let cleanedCount = 0;
  Object.keys(state.whisperStats).forEach(date => {
    if (date < cutoffDate) {
      delete state.whisperStats[date];
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} old statistic entries`);
  }
  
  return state;
}

/**
 * Generate daily report
 */
function generateDailyReport(state) {
  const today = new Date().toISOString().split('T')[0];
  const todayStats = state.whisperStats[today];
  
  if (!todayStats) {
    console.log('📋 No statistics available for today');
    return;
  }

  console.log('\n📋 Daily Whisper Report');
  console.log('========================');
  console.log(`Date: ${today}`);
  console.log(`Total Categories: ${todayStats.categoriesProcessed}`);
  console.log(`Total Whispers: ${todayStats.totalWhispers}`);
  console.log('\nCategory Breakdown:');
  
  Object.entries(todayStats.categoryBreakdown).forEach(([category, data]) => {
    console.log(`  ${category}: ${data.count} whispers`);
  });
  
  console.log('\n✅ Daily processing complete');
}

/**
 * Main scheduler function
 */
async function runWhisperScheduler() {
  console.log('🌟 Starting Whisper Scheduler');
  console.log(`⏰ Run time: ${new Date().toISOString()}`);
  
  try {
    // Load data
    const whispers = loadWhispers();
    let state = loadWhisperState();
    
    // Update run tracking
    state.lastRun = new Date().toISOString();
    state.totalRuns += 1;
    
    console.log(`🔄 Scheduler run #${state.totalRuns}`);
    
    // Process whisper statistics
    state = processWhisperStats(whispers, state);
    
    // Clean up old data
    state = cleanupOldStats(state);
    
    // Save updated state
    saveWhisperState(state);
    
    // Generate report
    generateDailyReport(state);
    
    console.log('\n🎉 Whisper Scheduler completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Whisper Scheduler failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the scheduler
runWhisperScheduler();