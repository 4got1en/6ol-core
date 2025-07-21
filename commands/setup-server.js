const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-server')
    .setDescription('Auto-setup the DeitiesByDesign server structure (categories/channels)'),
  async execute(interaction) {
    // Load structure from config
    const configPath = path.join(__dirname, '../config/deitiesbydesign-server-structure.json');
    let structure;
    try {
      structure = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      await interaction.reply({ content: 'Error loading server structure config.', ephemeral: true });
      return;
    }
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: 'This command must be run in a server.', ephemeral: true });
      return;
    }
    // Create categories and channels (new structure)
    for (const categoryDef of structure.categories) {
      let category = guild.channels.cache.find(c => c.name === categoryDef.name && c.type === 4); // 4 = Category
      if (!category) {
        category = await guild.channels.create({ name: categoryDef.name, type: 4 });
      }
      for (const channelDef of categoryDef.channels) {
        let channel = guild.channels.cache.find(c => c.name === channelDef.name && c.parentId === category.id);
        if (!channel) {
          await guild.channels.create({
            name: channelDef.name,
            type: 0, // 0 = Text
            parent: category.id,
            topic: channelDef.description || undefined
          });
        }
      }
    }
    await interaction.reply({ content: 'Server structure setup complete!', ephemeral: true });
  }
};
