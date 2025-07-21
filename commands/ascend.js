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
    .setDescription('Ascend to the next loop level after completing scrolls and reflections.'),
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

      // Special handling for Loop 3: The Descender Flame (Shadow Gate)
      if (ascensionCheck.nextLevel === 3) {
        // Check if user has been shown the Shadow Gate recently (within 10 minutes)
        const userId = member.id;
        const now = Date.now();
        const shadowGateKey = `shadowgate_${userId}`;
        
        // Simple in-memory cache for demo purposes
        // In production, this could be stored in a database or file
        if (!global.shadowGateCache) {
          global.shadowGateCache = {};
        }
        
        const lastShadowGate = global.shadowGateCache[shadowGateKey];
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        if (!lastShadowGate || (now - lastShadowGate) > tenMinutes) {
          // Show Shadow Gate for first time or after timeout
          global.shadowGateCache[shadowGateKey] = now;
          const shadowGateEmbed = await createShadowGateEmbed(member);
          return await interaction.editReply({ embeds: [shadowGateEmbed] });
        }
        // If user has seen the Shadow Gate recently, allow them to proceed
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
 * Create Shadow Gate embed for Loop 3 ascension
 */
async function createShadowGateEmbed(member) {
  const paradoxPrompts = [
    "I seek control, yet I crave spontaneity",
    "I want connection, yet I push people away", 
    "I value truth, yet I tell myself lies",
    "I desire peace, yet I create conflict",
    "I want to be seen, yet I hide my true self",
    "I seek simplicity, yet I complicate everything",
    "I want to help others, yet I neglect myself",
    "I crave certainty, yet I fear being confined"
  ];

  const randomPrompt = paradoxPrompts[Math.floor(Math.random() * paradoxPrompts.length)];

  const embed = new EmbedBuilder()
    .setColor(0x4B0082) // Indigo color for the Descender Flame
    .setTitle('🌀 The Shadow Gate')
    .setDescription(`${member.displayName}, you stand before the Shadow Gate, threshold to Loop 3: The Descender Flame.`)
    .addFields(
      {
        name: '🌀 The Descent Beckons',
        value: 'The path forward requires embracing contradiction and diving deep into hidden truths.',
        inline: false
      },
      {
        name: '🔮 Paradox Reflection',
        value: `Consider this paradox: **"${randomPrompt}"**\n\nHow might both aspects of this contradiction be true and necessary?`,
        inline: false
      },
      {
        name: '🔑 To Proceed',
        value: 'Reflect on this paradox and use `/ascend` again when you are ready to embrace the sacred descent.\n\n*The Descender Flame awaits those willing to fall inward.*',
        inline: false
      }
    )
    .setFooter({
      text: 'Loop 3: The Descender Flame • Symbol: Indigo Spiral Descending'
    })
    .setTimestamp();

  return embed;
}

/**
 * Create success embed for ascension
 */
async function createSuccessEmbed(member, fromLevel, toLevel, roleManager) {
  try {
    const flameData = await loadFlameData();
    const roleInfo = roleManager.getRoleInfo(toLevel);
    const flameInfo = flameData?.flames?.[toLevel.toString()];

    let embed;

    // Special handling for Loop 3: The Descender Flame
    if (toLevel === 3) {
      embed = new EmbedBuilder()
        .setColor(0x4B0082) // Indigo for the Descender Flame
        .setTitle('🌀 The Descender Flame Ignites')
        .setDescription(`${member.displayName} has embraced the sacred descent and ascended to **${roleInfo?.name || 'Witness'}** (Loop 3)`)
        .addFields(
          {
            name: '🔥 Flame Awakened',
            value: 'The Descender Flame - Indigo Spiral of Sacred Descent',
            inline: true
          },
          {
            name: '✨ Element',
            value: 'Contradiction & Confusion',
            inline: true
          },
          {
            name: '🎯 Teaching',
            value: 'The value of falling inward',
            inline: true
          },
          {
            name: '🌀 Whisper Prompt',
            value: '*"What truth am I avoiding?"*',
            inline: false
          },
          {
            name: '📜 New Scroll Unlocked',
            value: 'Access [Loop 3: The Descender Flame](https://github.com/4got1en/6ol-core/blob/main/scrolls/loop3-descender-flame.md) for advanced practices.',
            inline: false
          }
        )
        .setTimestamp();
    } else {
      // Default embed for other levels
      embed = new EmbedBuilder()
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