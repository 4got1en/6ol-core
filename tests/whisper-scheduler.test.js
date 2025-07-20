/**
 * Tests for the whisper scheduler script
 */

const { execSync } = require('child_process');
const { existsSync, unlinkSync, readFileSync } = require('fs');
const { join } = require('path');

describe('Whisper Scheduler', () => {
  const dataDir = './data';
  const stateFile = join(dataDir, 'whisper-state.json');
  
  beforeEach(() => {
    // Clean up state file before each test
    if (existsSync(stateFile)) {
      unlinkSync(stateFile);
    }
  });

  afterEach(() => {
    // Clean up state file after each test
    if (existsSync(stateFile)) {
      unlinkSync(stateFile);
    }
  });

  test('should execute without errors', () => {
    expect(() => {
      execSync('node scripts/whisper-scheduler.js', { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
    }).not.toThrow();
  });

  test('should create whisper state file', () => {
    execSync('node scripts/whisper-scheduler.js', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    expect(existsSync(stateFile)).toBe(true);
  });

  test('should generate valid state data', () => {
    execSync('node scripts/whisper-scheduler.js', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    const stateContent = readFileSync(stateFile, 'utf-8');
    const state = JSON.parse(stateContent);
    
    expect(state).toHaveProperty('lastRun');
    expect(state).toHaveProperty('totalRuns');
    expect(state).toHaveProperty('whisperStats');
    expect(state).toHaveProperty('schedulerVersion');
    expect(state.totalRuns).toBe(1);
    expect(typeof state.lastRun).toBe('string');
    expect(typeof state.whisperStats).toBe('object');
  });

  test('should increment run count on subsequent executions', () => {
    // First run
    execSync('node scripts/whisper-scheduler.js', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    expect(state.totalRuns).toBe(1);
    
    // Second run
    execSync('node scripts/whisper-scheduler.js', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    expect(state.totalRuns).toBe(2);
  });

  test('should process all whisper categories', () => {
    execSync('node scripts/whisper-scheduler.js', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    const today = new Date().toISOString().split('T')[0];
    const todayStats = state.whisperStats[today];
    
    expect(todayStats).toBeDefined();
    expect(todayStats.categoriesProcessed).toBe(7);
    expect(todayStats.totalWhispers).toBe(28);
    expect(Object.keys(todayStats.categoryBreakdown)).toEqual([
      'scrolls', 'rituals', 'journal', 'podcast', 'finance', 'legal', 'navarre'
    ]);
  });
});