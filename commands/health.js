const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('health')
    .setDescription('Check if the 6ol bot is online and healthy.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x43b581)
      .setTitle('6ol Bot Health Check')
      .setDescription('✅ 6ol bot is online and running!')
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
