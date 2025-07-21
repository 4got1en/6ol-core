/**
 * ascend.js - Discord slash command for user ascension
 * Handles role progression with comprehensive error handling
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LoopRoleManager = require('../utils/loopRoles');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ascend')
    .setDescription('Ascend to the next loop level. Use this after completing all scrolls and reflections for your current level.'),
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const member = interaction.member;
      const guild = interaction.guild;
      const roleManager = new LoopRoleManager(guild);

      // Check if user can ascend
      const ascensionCheck = await roleManager.canAscendToNextLevel(member);
      
      if (!ascensionCheck.canAscend) {
        const embed = await createErrorEmbed(
          'Cannot Ascend',
          ascensionCheck.reason || 'Requirements not met',
          ascensionCheck.currentLevel
        );
        return await interaction.editReply({ embeds: [embed] });
      }

      // Attempt role assignment
      const assignmentResult = await roleManager.assignLoopRole(
        member, 
        ascensionCheck.nextLevel
      );

      if (!assignmentResult.success) {
        const embed = await createErrorEmbed(
          'Ascension Failed',
          assignmentResult.message,
          ascensionCheck.currentLevel
        );
        return await interaction.editReply({ embeds: [embed] });
      }

      // Success - create celebration embed
      const successEmbed = await createSuccessEmbed(
        member,
        ascensionCheck.currentLevel,
        ascensionCheck.nextLevel,
        roleManager
      );

      await interaction.editReply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Ascend command error:', error);
      
      const errorEmbed = await createErrorEmbed(
        'Command Error',
        'An unexpected error occurred during ascension',
        null
      );

      try {
        if (interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error response:', replyError);
      }
    }
  },
};

/**
 * Create success embed for ascension
 */
async function createSuccessEmbed(member, fromLevel, toLevel, roleManager) {
  try {
    const flameData = await loadFlameData();
    const roleInfo = roleManager.getRoleInfo(toLevel);
    const flameInfo = flameData?.flames?.[toLevel.toString()];

    const embed = new EmbedBuilder()
      .setColor(0xf5c84c)
      .setTitle('🌟 Ascension Complete')
      .setDescription(`${member.displayName} has ascended to **${roleInfo?.name || 'Unknown'}** (Level ${toLevel})`)
      .setTimestamp();

    if (flameInfo) {
      embed.addFields(
        {
          name: '🔥 Flame Awakened',
          value: flameInfo.title || 'Unknown Flame',
          inline: true
        },
        {
          name: '✨ Element',
          value: flameInfo.element || 'Unknown',
          inline: true
        },
        {
          name: '🎯 Essence',
          value: flameInfo.essence || 'Unknown',
          inline: true
        }
      );

      if (flameInfo.invocation) {
        embed.addFields({
          name: '📜 Invocation',
          value: `*"${flameInfo.invocation}"*`,
          inline: false
        });
      }
    }

    embed.setFooter({
      text: `Previous level: ${fromLevel} → Current level: ${toLevel}`
    });

    return embed;
  } catch (error) {
    console.error('Error creating success embed:', error);
    return createSimpleSuccessEmbed(member, fromLevel, toLevel);
  }
}

/**
 * Fallback simple success embed
 */
function createSimpleSuccessEmbed(member, fromLevel, toLevel) {
  return new EmbedBuilder()
    .setColor(0xf5c84c)
    .setTitle('🌟 Ascension Complete')
    .setDescription(`${member.displayName} has ascended from Level ${fromLevel} to Level ${toLevel}`)
    .setTimestamp();
}

/**
 * Create error embed with consistent formatting
 */
async function createErrorEmbed(title, description, currentLevel) {
  const embed = new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();

  if (currentLevel) {
    embed.setFooter({ text: `Current level: ${currentLevel}` });
  }

  return embed;
}

/**
 * Load flame data with error handling
 */
async function loadFlameData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'flameData.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading flame data:', error);
    return null; // Graceful degradation
  }
}