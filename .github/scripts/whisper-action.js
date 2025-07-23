#!/usr/bin/env node

/**
 * Daily Whisper Drop Action for 6ol-core
 * Automatically delivers daily whispers via Discord webhook
 * Part of Phase 1 - Full Repair Pass
 */

const fs = require('fs').promises;
const path = require('path');

// Handle fetch for different Node.js versions
let fetch;
if (typeof globalThis.fetch !== 'undefined') {
  fetch = globalThis.fetch;
} else {
  // Fallback to node-fetch or https for older Node versions
  try {
    fetch = require('node-fetch');
  } catch {
    // Use built-in https module as fallback
    const https = require('https');
    const { URL } = require('url');
    
    fetch = async (url, options = {}) => {
      return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const requestOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname + parsedUrl.search,
          method: options.method || 'GET',
          headers: options.headers || {}
        };
        
        const req = https.request(requestOptions, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              statusText: res.statusMessage,
              text: () => Promise.resolve(data)
            });
          });
        });
        
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
      });
    };
  }
}

// Configuration
const CONFIG = {
  WHISPERS_FILE: path.join(__dirname, '../../whispers.json'),
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  DEBUG: process.env.DEBUG === 'true'
};

// Logging utilities
const log = (...args) => console.log('[WhisperAction]', new Date().toISOString(), ...args);
const error = (...args) => console.error('[WhisperAction]', new Date().toISOString(), ...args);

/**
 * Load whispers from the whispers.json file
 */
async function loadWhispers() {
  try {
    const data = await fs.readFile(CONFIG.WHISPERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    error('Failed to load whispers:', err.message);
    throw err;
  }
}

/**
 * Select a random whisper from available categories
 */
function selectRandomWhisper(whispers) {
  const categories = Object.keys(whispers);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  const categoryWhispers = whispers[randomCategory];
  const whisperKeys = Object.keys(categoryWhispers);
  const randomKey = whisperKeys[Math.floor(Math.random() * whisperKeys.length)];
  
  return {
    category: randomCategory,
    level: randomKey,
    message: categoryWhispers[randomKey]
  };
}

/**
 * Format whisper for Discord
 */
function formatWhisperMessage(whisper) {
  const categoryEmojis = {
    scrolls: '📜',
    rituals: '🕯️',
    journal: '📓',
    podcast: '🎙️',
    finance: '💰',
    legal: '⚖️',
    navarre: '🔍'
  };

  const emoji = categoryEmojis[whisper.category] || '✨';
  const categoryName = whisper.category.charAt(0).toUpperCase() + whisper.category.slice(1);
  
  return {
    content: null,
    embeds: [{
      title: `${emoji} Daily Whisper Drop`,
      description: whisper.message,
      color: 0x2f3136, // Dark theme color
      fields: [
        {
          name: "Category",
          value: categoryName,
          inline: true
        },
        {
          name: "Level",
          value: whisper.level,
          inline: true
        }
      ],
      footer: {
        text: "6ol Core • Daily Whisper System",
        icon_url: null
      },
      timestamp: new Date().toISOString()
    }]
  };
}

/**
 * Send message to Discord via webhook
 */
async function sendToDiscord(message) {
  if (!CONFIG.DISCORD_WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL environment variable is not set');
  }

  try {
    const response = await fetch(CONFIG.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    log('Successfully sent whisper to Discord');
    return true;
  } catch (err) {
    error('Failed to send to Discord:', err.message);
    throw err;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    log('Starting daily whisper drop...');
    
    // Validate environment
    if (!CONFIG.DISCORD_WEBHOOK_URL) {
      throw new Error('DISCORD_WEBHOOK_URL secret is required');
    }

    // Load whispers
    log('Loading whispers...');
    const whispers = await loadWhispers();
    
    // Select random whisper
    const selectedWhisper = selectRandomWhisper(whispers);
    log(`Selected whisper from ${selectedWhisper.category} level ${selectedWhisper.level}`);
    
    if (CONFIG.DEBUG) {
      log('Selected whisper:', selectedWhisper);
    }
    
    // Format message
    const discordMessage = formatWhisperMessage(selectedWhisper);
    
    // Send to Discord
    log('Sending whisper to Discord...');
    await sendToDiscord(discordMessage);
    
    log('Daily whisper drop completed successfully');
    
  } catch (err) {
    error('Daily whisper drop failed:', err.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  loadWhispers,
  selectRandomWhisper,
  formatWhisperMessage,
  sendToDiscord,
  main
};