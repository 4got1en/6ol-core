// Example: Auto-Crosspost Bot for Announcement Channels
// Requires discord.js v14+
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('messageCreate', async (message) => {
  if (message.channel.type === 5 && !message.crosspostable) return; // Announcement channel
  if (message.author.bot) return;
  try {
    if (message.crosspostable) await message.crosspost();
  } catch (err) {
    console.error('Auto-crosspost failed:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);
