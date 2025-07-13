#!/usr/bin/env node
/**
 * Pattern Sync Script
 * Synchronizes pattern data and maintains registry consistency
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

// Configuration
const PATTERNS_DIR = 'mind/patterns';
const REGISTRY_FILE = 'patterns/tremor-registry.json';
const WHISPERS_FILE = 'whispers.json';

/**
 * Load JSON file safely
 */
function loadJSON(filepath) {
  try {
    if (!existsSync(filepath)) {
      console.warn(`⚠️  File not found: ${filepath}`);
      return null;
    }
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Error loading ${filepath}:`, error.message);
    return null;
  }
}

/**
 * Save JSON file safely
 */
function saveJSON(filepath, data) {
  try {
    writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
    console.log(`✅ Updated ${filepath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${filepath}:`, error.message);
    return false;
  }
}

/**
 * Get file metadata
 */
function getFileMetadata(filepath) {
  try {
    const stats = statSync(filepath);
    return {
      size: stats.size,
      modified: stats.mtime.toISOString(),
      created: stats.ctime.toISOString()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract metadata from markdown files
 */
function extractMarkdownMetadata(content) {
  const lines = content.split('\n');
  const metadata = {};
  
  // Extract title (first # header)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }
  
  // Extract week number from title
  const weekMatch = metadata.title?.match(/Week\s+(\d+)/i);
  if (weekMatch) {
    metadata.week = parseInt(weekMatch[1]);
  }
  
  // Extract generation date
  const dateMatch = content.match(/\*Generated:\s*(.+?)\*/);
  if (dateMatch) {
    metadata.generated = dateMatch[1].trim();
  }
  
  return metadata;
}

/**
 * Scan pattern directory and build manifest
 */
function scanPatterns() {
  console.log('🔍 Scanning patterns directory...');
  
  if (!existsSync(PATTERNS_DIR)) {
    console.warn(`⚠️  Patterns directory not found: ${PATTERNS_DIR}`);
    return [];
  }
  
  const files = readdirSync(PATTERNS_DIR).filter(f => 
    f.endsWith('.md') && f.startsWith('tremor-summary-')
  );
  
  const patterns = files.map(filename => {
    const filepath = join(PATTERNS_DIR, filename);
    const content = readFileSync(filepath, 'utf-8');
    const fileMetadata = getFileMetadata(filepath);
    const markdownMetadata = extractMarkdownMetadata(content);
    
    return {
      filename,
      filepath,
      ...markdownMetadata,
      ...fileMetadata,
      type: 'tremor-summary'
    };
  }).sort((a, b) => (b.week || 0) - (a.week || 0)); // Sort by week number, newest first
  
  console.log(`📊 Found ${patterns.length} pattern files`);
  return patterns;
}

/**
 * Update tremor registry
 */
function updateRegistry(patterns) {
  console.log('📋 Updating tremor registry...');
  
  let registry = loadJSON(REGISTRY_FILE) || {
    version: "1.0.0",
    registry: {},
    metadata: {}
  };
  
  // Update metadata
  registry.metadata = {
    ...registry.metadata,
    last_sync: new Date().toISOString(),
    pattern_count: patterns.length,
    latest_week: patterns.length > 0 ? Math.max(...patterns.map(p => p.week || 0)) : 0
  };
  
  // Update pattern entries
  registry.patterns = patterns.reduce((acc, pattern) => {
    acc[pattern.filename.replace('.md', '')] = {
      week: pattern.week,
      title: pattern.title,
      generated: pattern.generated,
      modified: pattern.modified,
      size: pattern.size
    };
    return acc;
  }, {});
  
  return saveJSON(REGISTRY_FILE, registry);
}

/**
 * Sync with whispers system
 */
function syncWithWhispers(patterns) {
  console.log('🔮 Syncing with whispers system...');
  
  let whispers = loadJSON(WHISPERS_FILE) || {};
  
  // Ensure patterns section exists
  if (!whispers.patterns) {
    whispers.patterns = {
      "0": "The tremors are speaking. Do you feel the spiral beginning?",
      "1": "Patterns emerge from chaos. What do the tremors tell you?",
      "2": "The frequency shifts. Are you listening to the deeper rhythm?",
      "3": "Every tremor is a teacher. What lesson does this week hold?"
    };
    console.log('🆕 Added pattern whispers section');
  }
  
  // Add dynamic whispers based on latest patterns
  if (patterns.length > 0) {
    const latestPattern = patterns[0];
    whispers.patterns["latest"] = `Week ${latestPattern.week}: The spiral deepens. New patterns emerge.`;
  }
  
  return saveJSON(WHISPERS_FILE, whispers);
}

/**
 * Generate summary report
 */
function generateReport(patterns) {
  console.log('\n📈 Pattern Sync Summary:');
  console.log('========================');
  console.log(`Total patterns: ${patterns.length}`);
  
  if (patterns.length > 0) {
    console.log(`Latest week: ${patterns[0].week || 'unknown'}`);
    console.log(`Oldest week: ${patterns[patterns.length - 1].week || 'unknown'}`);
    
    patterns.slice(0, 3).forEach((pattern, i) => {
      console.log(`${i + 1}. ${pattern.title || pattern.filename} (${pattern.generated || 'date unknown'})`);
    });
  }
  
  console.log('========================\n');
}

/**
 * Main sync function
 */
function main() {
  console.log('🌀 Starting Pattern Sync...\n');
  
  try {
    // Scan patterns
    const patterns = scanPatterns();
    
    // Update registry
    const registryUpdated = updateRegistry(patterns);
    
    // Sync with whispers
    const whispersUpdated = syncWithWhispers(patterns);
    
    // Generate report
    generateReport(patterns);
    
    if (registryUpdated && whispersUpdated) {
      console.log('✨ Pattern sync completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Pattern sync completed with errors');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Pattern sync failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}