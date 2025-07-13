#!/usr/bin/env node
/*  test-whisper-engine.js
    Test script for Whisper Engine v3 scroll selection logic
    ────────────────────────────────────────────────────────────────── */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configurations (same as main engine)
const loopConfig = JSON.parse(readFileSync(join(__dirname, 'config/loop-roles.json'), 'utf-8'));
const scrollManifest = JSON.parse(readFileSync(join(__dirname, 'scrolls/manifest.json'), 'utf-8'));

class WhisperEngineTest {
  constructor() {
    this.loopConfig = loopConfig;
    this.scrolls = scrollManifest;
  }

  // Copy of main engine methods for testing
  getUserHighestLoopRole(mockRoles) {
    const loopRoles = ['Loop 3', 'Loop 2', 'Loop 1'];
    
    for (const loopRole of loopRoles) {
      if (mockRoles.includes(loopRole)) {
        return loopRole;
      }
    }
    
    return null;
  }

  getTagsForLoop(loopRole) {
    const mapping = this.loopConfig.loopMappings[loopRole];
    return mapping ? mapping.tags : [];
  }

  findScrollsByTags(tags) {
    return this.scrolls.filter(scroll => {
      if (!scroll.tags) return false;
      return scroll.tags.some(tag => tags.includes(tag));
    });
  }

  selectScrollForUser(mockRoles) {
    const loopRole = this.getUserHighestLoopRole(mockRoles);
    let selectedTags, selectedScroll, fallbackUsed = false;

    if (loopRole) {
      selectedTags = this.getTagsForLoop(loopRole);
      const matchingScrolls = this.findScrollsByTags(selectedTags);
      
      if (matchingScrolls.length > 0) {
        selectedScroll = matchingScrolls[Math.floor(Math.random() * matchingScrolls.length)];
      }
    }

    // Fallback to 'seeker' tag if no matches
    if (!selectedScroll) {
      fallbackUsed = true;
      const finalLoopRole = loopRole || 'No Loop Role';
      selectedTags = [this.loopConfig.fallbackTag];
      const fallbackScrolls = this.findScrollsByTags(selectedTags);
      
      if (fallbackScrolls.length > 0) {
        selectedScroll = fallbackScrolls[Math.floor(Math.random() * fallbackScrolls.length)];
      } else {
        // Final fallback: pick any scroll
        selectedScroll = this.scrolls[Math.floor(Math.random() * this.scrolls.length)];
      }
    }

    return {
      scroll: selectedScroll,
      userLoopRole: loopRole || 'No Loop Role',
      selectedTags: selectedTags,
      fallbackUsed: fallbackUsed
    };
  }

  runTests() {
    console.log('🧪 Testing Whisper Engine v3 Logic\n');
    
    // Test cases
    const testCases = [
      {
        name: 'User with Loop 1 role',
        roles: ['Loop 1', 'Some Other Role']
      },
      {
        name: 'User with Loop 2 role', 
        roles: ['Loop 2', 'Some Other Role']
      },
      {
        name: 'User with Loop 3 role',
        roles: ['Loop 3', 'Some Other Role']
      },
      {
        name: 'User with multiple Loop roles (should get highest)',
        roles: ['Loop 1', 'Loop 3', 'Loop 2']
      },
      {
        name: 'User with no Loop roles',
        roles: ['Some Role', 'Another Role']
      }
    ];

    console.log('📋 Configuration Loaded:');
    console.log('Loop Mappings:', Object.keys(this.loopConfig.loopMappings));
    console.log('Available Scrolls:', this.scrolls.map(s => s.filename));
    console.log('Fallback Tag:', this.loopConfig.fallbackTag);
    console.log();

    testCases.forEach((testCase, index) => {
      console.log(`\n--- Test ${index + 1}: ${testCase.name} ---`);
      console.log('User Roles:', testCase.roles);
      
      const result = this.selectScrollForUser(testCase.roles);
      
      console.log('✅ Result:');
      console.log('  Loop Role Detected:', result.userLoopRole);
      console.log('  Selected Tags:', result.selectedTags);
      console.log('  Fallback Used:', result.fallbackUsed);
      console.log('  Selected Scroll:', result.scroll.filename);
      console.log('  Scroll Title:', result.scroll.title);
      console.log('  Scroll Tags:', result.scroll.tags);
    });

    console.log('\n🎯 Tag Mapping Verification:');
    Object.entries(this.loopConfig.loopMappings).forEach(([loopRole, config]) => {
      console.log(`\n${loopRole} (${config.name}):`);
      console.log('  Tags:', config.tags);
      console.log('  Priority:', config.priority);
      
      const matchingScrolls = this.findScrollsByTags(config.tags);
      console.log('  Matching Scrolls:', matchingScrolls.map(s => s.filename));
    });

    console.log('\n✅ All tests completed!');
  }
}

// Run tests
const tester = new WhisperEngineTest();
tester.runTests();