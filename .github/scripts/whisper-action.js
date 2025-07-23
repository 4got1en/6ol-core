#!/usr/bin/env node
/**
 * whisper-action.js - Posts daily whispers to Discord
 * 
 * This script:
 * 1. Reads Discord credentials from environment variables
 * 2. Randomly selects a file from the scrolls/loop1/ directory  
 * 3. Extracts the first 6 lines from the selected file
 * 4. Posts the extracted lines as a message in Discord using the Discord API
 */

const fs = require('fs').promises;
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

async function main() {
  // Read Discord credentials from environment
  const discordToken = process.env.DISCORD_TOKEN;
  const discordChannelId = process.env.DISCORD_CHANNEL_ID;

  if (!discordToken) {
    console.error('❌ DISCORD_TOKEN environment variable is required');
    process.exit(1);
  }

  if (!discordChannelId) {
    console.error('❌ DISCORD_CHANNEL_ID environment variable is required');
    process.exit(1);
  }

  try {
    // Get path to scrolls/loop1 directory
    const scrollsDir = path.join(__dirname, '..', '..', 'scrolls', 'loop1');
    console.log(`📁 Looking for files in: ${scrollsDir}`);

    // Read all files from the scrolls/loop1 directory
    const files = await fs.readdir(scrollsDir);
    const scrollFiles = files.filter(file => 
      file.endsWith('.html') || file.endsWith('.md') || file.endsWith('.txt')
    );

    if (scrollFiles.length === 0) {
      console.error('❌ No scroll files found in scrolls/loop1/ directory');
      process.exit(1);
    }

    console.log(`📜 Found ${scrollFiles.length} scroll files: ${scrollFiles.join(', ')}`);

    // Randomly select a file
    const randomFile = scrollFiles[Math.floor(Math.random() * scrollFiles.length)];
    const filePath = path.join(scrollsDir, randomFile);
    
    console.log(`🎯 Selected file: ${randomFile}`);

    // Read the selected file
    const fileContent = await fs.readFile(filePath, 'utf8');

    let message = '';
    
    // If it's HTML, extract meaningful content by removing common HTML tags
    if (randomFile.endsWith('.html')) {
      // Remove HTML tags and entities, then extract meaningful lines
      const cleanedContent = fileContent
        .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove script tags
        .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove style tags
        .replace(/<head[^>]*>.*?<\/head>/gis, '') // Remove head section
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&[^;]*;/g, ' ') // Remove HTML entities
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length > 10) // Filter out very short lines
        .slice(0, 6) // Take first 6 meaningful lines
        .join('\n');
      
      message = cleanedContent;
    } else {
      // For non-HTML files, just take the first 6 lines
      const lines = fileContent.split('\n');
      message = lines.slice(0, 6).join('\n');
    }

    // Ensure the message isn't too long (Discord has a 2000 character limit)
    if (message.length > 1900) {
      message = message.substring(0, 1900) + '...';
    }

    console.log(`📝 Message to send:\n${message}`);

    // Create Discord client
    const client = new Client({ 
      intents: [GatewayIntentBits.Guilds]
    });

    // Login to Discord
    await client.login(discordToken);
    console.log('✅ Discord client logged in successfully');

    // Get the channel
    const channel = await client.channels.fetch(discordChannelId);
    if (!channel) {
      console.error(`❌ Could not find channel with ID: ${discordChannelId}`);
      process.exit(1);
    }

    console.log(`📢 Posting to channel: ${channel.name || 'Unknown'}`);

    // Send the message
    const whisperMessage = `🌅 **Daily Whisper from the Scrolls**\n\n${message}\n\n*— From ${randomFile} in Loop Level 1*`;
    
    await channel.send(whisperMessage);
    
    console.log('✅ Daily whisper posted successfully!');

  } catch (error) {
    console.error('❌ Error posting daily whisper:', error);
    process.exit(1);
  } finally {
    // Clean up the Discord client
    if (typeof client !== 'undefined' && client.destroy) {
      client.destroy();
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };