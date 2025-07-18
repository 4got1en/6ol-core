// app.js - Main entry for DeitiesByDesign automation system

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { serverStructure } = require('./utils/serverStructure');
const fs = require('fs');
const path = require('path');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // Required for MessageCreate event
  ]
});

// Scheduled task: Daily scroll drop (example)
function scheduleDailyScrollDrop() {
  setInterval(() => {
    // Example: Post a message to #🌀whisper-engine
    client.guilds.cache.forEach(async guild => {
      const channel = guild.channels.cache.find(c => c.name === '🌀whisper-engine' && c.isTextBased());
      if (channel) {
        await channel.send('🌌 Daily scroll drop: ' + new Date().toLocaleDateString());
      }
    });
  }, 1000 * 60 * 60 * 24); // Every 24 hours
}

// Keep-alive loop
function keepAliveLoop() {
  setInterval(() => {
    console.log('🟢 App keep-alive ping:', new Date().toISOString());
  }, 1000 * 60 * 5);
}

// Logging and GitHub sync (manual trigger)
function syncServerLog() {
  const logFile = path.join(__dirname, 'data/server-setup-log.txt');
  try {
    require('child_process').execSync(`git add ${logFile}`);
    require('child_process').execSync(`git commit -m "chore: update server setup log [auto-sync]"`);
    require('child_process').execSync(`git push`);
    console.log('✅ Log file committed and pushed to GitHub.');
  } catch (err) {
    console.error('❌ Error syncing log file:', err.message);
  }
}

// Bot ready event
client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  scheduleDailyScrollDrop();
  keepAliveLoop();
});

// Import and register commands/events as needed

// 🔔 Auto-crosspost announcements
require('./crosspost')(client);
// ...existing bot logic...

client.login(process.env.DISCORD_TOKEN);

module.exports = { client, scheduleDailyScrollDrop, keepAliveLoop, syncServerLog };
