const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all 6ol bot commands, onboarding, and documentation links.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xf5c84c)
      .setTitle('6ol Bot Help & Onboarding')
      .setDescription('Welcome to the 6ol Core system! Here’s how to get started:')
      .addFields(
        { name: 'Commands', value: '`/ascend` — Ascend to next loop level\n`/reflect` — Daily reflection prompt\n`/whisper` — Access scrolls\n`/health` — Bot health check\n`/help` — This help message' },
        { name: 'Onboarding', value: '1. Use `/ascend` and `/reflect` to progress.\n2. Use `/whisper` to access scrolls.\n3. All input is journaled to the vault.' },
        { name: 'Docs & Links', value: '[Start Here Funnel](https://github.com/4got1en/6ol-core#-start-here-the-6ol-funnel)\n[Bot Usage & Commands](https://github.com/4got1en/6ol-core/blob/main/DISCORD_BOT_README.md)\n[Scrolls & Rituals Guide](https://github.com/4got1en/6ol-core/blob/main/docs/scrolls.md)\n[Usage Examples](https://github.com/4got1en/6ol-core/blob/main/docs/usage-examples.md)\n[Monitoring & Automation](https://github.com/4got1en/6ol-core/blob/main/docs/monitoring.md)\n[Contributing](https://github.com/4got1en/6ol-core/blob/main/CONTRIBUTING.md)' }
      )
      .setFooter({ text: '6ol Core · Ritual Engine · v1.0' });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
