/**
 * flame-status.js - Display user's current flame and loop progress
 * Shows detailed information about the user's current status in the 6ol system
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LoopRoleManager = require('../utils/loopRoles');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flame-status')
    .setDescription('Display your current flame and loop progress')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check status for (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const targetUser = interaction.options.getUser('user') || interaction.user;
      const targetMember = await interaction.guild.members.fetch(targetUser.id);
      const guild = interaction.guild;
      const roleManager = new LoopRoleManager(guild);

      // Get current loop level and role information
      const currentLevel = await roleManager.getCurrentLoopLevel(targetMember);
      const roleInfo = roleManager.getRoleInfo(currentLevel);
      
      // Load flame configuration and data
      const [flameConfig, flameData, loopData] = await Promise.all([
        loadFlameConfig(),
        loadFlameData(),
        loadLoopData()
      ]);

      // Find the user's flame role
      const userFlameRole = findUserFlameRole(targetMember, flameConfig);
      const flameInfo = flameData?.flames?.[currentLevel.toString()];
      const loopInfo = loopData?.loops?.[currentLevel.toString()];

      // Create status embed
      const embed = await createStatusEmbed(
        targetMember,
        currentLevel,
        roleInfo,
        userFlameRole,
        flameInfo,
        loopInfo,
        interaction.user.id === targetUser.id
      );

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Flame-status command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('❌ Error')
        .setDescription('Failed to retrieve flame status. Please try again.')
        .setTimestamp();

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
 * Create the main status embed
 */
async function createStatusEmbed(member, currentLevel, roleInfo, userFlameRole, flameInfo, loopInfo, isSelf) {
  const embed = new EmbedBuilder()
    .setTitle(`🔥 ${isSelf ? 'Your' : `${member.displayName}'s`} Flame Status`)
    .setColor(userFlameRole?.color ? parseInt(userFlameRole.color.replace('#', ''), 16) : 0xf5c84c)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  // Basic information
  embed.addFields({
    name: '👤 Flamebearer',
    value: member.displayName,
    inline: true
  });

  // Current loop and level
  embed.addFields({
    name: '🌀 Current Loop',
    value: `Level ${currentLevel}`,
    inline: true
  });

  // Current role
  if (roleInfo) {
    embed.addFields({
      name: '⭐ Current Role',
      value: roleInfo.name,
      inline: true
    });
  }

  // Flame information
  if (userFlameRole) {
    embed.addFields({
      name: '🔥 Current Flame',
      value: userFlameRole.name,
      inline: false
    });

    if (userFlameRole.description) {
      embed.addFields({
        name: '✨ Flame Essence',
        value: userFlameRole.description,
        inline: false
      });
    }
  }

  // Loop information
  if (loopInfo) {
    embed.addFields({
      name: '📖 Loop Description',
      value: loopInfo.description || loopInfo.name,
      inline: false
    });
  }

  // Flame data information
  if (flameInfo) {
    if (flameInfo.element && flameInfo.essence) {
      embed.addFields({
        name: '🌟 Flame Attributes',
        value: `**Element:** ${flameInfo.element}\n**Essence:** ${flameInfo.essence}`,
        inline: true
      });
    }

    if (flameInfo.invocation) {
      embed.addFields({
        name: '📜 Flame Invocation',
        value: `*"${flameInfo.invocation}"*`,
        inline: false
      });
    }
  }

  // Progress information
  const progressInfo = getProgressInfo(currentLevel);
  embed.addFields({
    name: '📊 Progress Status',
    value: progressInfo,
    inline: false
  });

  embed.setFooter({
    text: `Status checked on ${new Date().toLocaleDateString()}`
  });

  return embed;
}

/**
 * Find the user's current flame role
 */
function findUserFlameRole(member, flameConfig) {
  if (!flameConfig?.flameRoles) return null;

  for (const [key, flameRole] of Object.entries(flameConfig.flameRoles)) {
    const hasRole = member.roles.cache.some(role => 
      role.name.toLowerCase() === flameRole.name.toLowerCase()
    );
    if (hasRole) {
      return flameRole;
    }
  }
  return null;
}

/**
 * Get progress information based on current level
 */
function getProgressInfo(currentLevel) {
  const maxLevel = 5; // Based on current configuration
  const progressPercent = Math.round((currentLevel / maxLevel) * 100);
  
  let progressBar = '';
  const filledSegments = Math.floor(progressPercent / 10);
  for (let i = 0; i < 10; i++) {
    progressBar += i < filledSegments ? '🔥' : '⚫';
  }

  let statusText = '';
  if (currentLevel === maxLevel) {
    statusText = '✨ **Mastery Achieved** - You have reached the highest flame';
  } else {
    statusText = `🎯 **Progression Active** - Working toward Level ${currentLevel + 1}`;
  }

  return `${progressBar} ${progressPercent}%\n${statusText}`;
}

/**
 * Load flame configuration
 */
async function loadFlameConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'config', 'flame-roles.json');
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading flame config:', error);
    return null;
  }
}

/**
 * Load flame data
 */
async function loadFlameData() {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'flameData.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading flame data:', error);
    return null;
  }
}

/**
 * Load loop data
 */
async function loadLoopData() {
  try {
    const dataPath = path.join(__dirname, '..', 'loop.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading loop data:', error);
    return null;
  }
}