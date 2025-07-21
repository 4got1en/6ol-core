const { SlashCommandBuilder } = require('discord.js');
const { serverStructure } = require('../utils/serverStructure');

function isAdmin(member) {
  return member.permissions.has('Administrator');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-server')
    .setDescription('Creates all categories and channels for the DeitiesByDesign system (admin only)'),

  async execute(interaction) {
    if (!interaction.guild) return interaction.reply({ content: 'Server-only command.', ephemeral: true });
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ content: 'You must be an admin to run this command.', ephemeral: true });
    }

    await interaction.reply('⚙️ Setting up the DeitiesByDesign system...');
    const log = [];

    for (const category of serverStructure) {
      const categoryChannel = await interaction.guild.channels.create({
        name: category.name,
        type: 4, // CATEGORY
      });
      log.push(`Created category: ${category.name}`);

      for (const ch of category.channels) {
        const channelObj = await interaction.guild.channels.create({
          name: ch.toLowerCase().replace(/\s+/g, '-'),
          type: 0, // TEXT
          parent: categoryChannel.id,
          permissionOverwrites: category.hidden
            ? [
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['ViewChannel']
                }
              ]
            : []
        });
        log.push(`  Created channel: ${channelObj.name}`);
      }
    }

    // Save log to file for GitHub sync
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../data/server-setup-log.txt');
    fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Setup by ${interaction.user.tag}:\n` + log.join('\n'));

    await interaction.followUp('✅ Server setup complete. Log saved for sync.');
  }
};
