// Discord Permission Audit Script (manual run)
// Requires discord.js v14+
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  const guild = client.guilds.cache.first();
  if (!guild) return console.error('No guild found');
  console.log(`Auditing roles for: ${guild.name}`);
  guild.roles.cache.forEach(role => {
    if (role.permissions.has('ADMINISTRATOR')) {
      console.log(`Role ${role.name} has ADMINISTRATOR permission.`);
    }
    // Add more permission checks as needed
  });
  process.exit();
});

client.login(process.env.DISCORD_TOKEN);
