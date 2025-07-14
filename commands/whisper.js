/**
 * whisper.js - Discord slash command for accessing whisper engine content
 * Provides loop-level gated content with formatted embeds
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LoopRoleManager = require('../utils/loopRoles');
const fs = require('fs').promises;
const path = require('path');

// Available whisper content by level
const WHISPER_CONTENT = {
  1: [
    {
      title: 'Daylight Initiation',
      path: 'scrolls/daylight.md',
      passphrase: 'sol',
      description: 'The first light breaks through the veil of unknowing'
    }
  ],
  2: [
    {
      title: 'Night-Vision Insight',
      path: 'scrolls/nightvision.md', 
      passphrase: 'luna',
      description: 'Seeing through the darkness within and without'
    }
  ],
  3: [
    {
      title: 'Shadow Work Depth',
      path: 'scrolls/shadowdepth.md',
      passphrase: 'umbra', 
      description: 'Embracing the depths that others fear to explore'
    }
  ],
  4: [
    {
      title: 'Architectural Wisdom',
      path: 'scrolls/architecture.md',
      passphrase: 'forma',
      description: 'Building structures that support transformation'
    }
  ],
  5: [
    {
      title: 'Lightbearer\'s Call',
      path: 'scrolls/lightbearer.md',
      passphrase: 'lux',
      description: 'Carrying the flame forward for others to follow'
    }
  ]
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whisper')
    .setDescription('Access whisper engine content')
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Specific content to access (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const member = interaction.member;
      const guild = interaction.guild;
      const roleManager = new LoopRoleManager(guild);
      const requestedContent = interaction.options.getString('content');

      // Get user's current level
      const currentLevel = await roleManager.getCurrentLoopLevel(member);
      
      // Get available content for user's level
      const availableContent = getAvailableContent(currentLevel);
      
      if (availableContent.length === 0) {
        const embed = createNoContentEmbed(currentLevel);
        return await interaction.editReply({ embeds: [embed] });
      }

      // If specific content requested, try to serve it
      if (requestedContent) {
        const specificContent = findRequestedContent(availableContent, requestedContent);
        if (specificContent) {
          const embed = await createContentEmbed(specificContent, currentLevel);
          return await interaction.editReply({ embeds: [embed] });
        } else {
          const embed = createContentNotFoundEmbed(requestedContent, currentLevel);
          return await interaction.editReply({ embeds: [embed] });
        }
      }

      // Otherwise, show available content menu
      const menuEmbed = createContentMenuEmbed(availableContent, currentLevel);
      await interaction.editReply({ embeds: [menuEmbed] });

    } catch (error) {
      console.error('Whisper command error:', error);
      
      const errorEmbed = createErrorEmbed(
        'Command Error',
        'An unexpected error occurred while accessing whisper content'
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
 * Get available content based on user's level
 */
function getAvailableContent(userLevel) {
  const available = [];
  
  for (let level = 1; level <= userLevel; level++) {
    if (WHISPER_CONTENT[level]) {
      available.push(...WHISPER_CONTENT[level].map(content => ({
        ...content,
        requiredLevel: level
      })));
    }
  }
  
  return available;
}

/**
 * Find specific requested content
 */
function findRequestedContent(availableContent, requestedName) {
  return availableContent.find(content => 
    content.title.toLowerCase().includes(requestedName.toLowerCase()) ||
    content.passphrase.toLowerCase() === requestedName.toLowerCase()
  );
}

/**
 * Create content menu embed
 */
function createContentMenuEmbed(availableContent, currentLevel) {
  const embed = new EmbedBuilder()
    .setColor(0x8e44ad)
    .setTitle('🌌 Whisper Engine')
    .setDescription(`Available content for Level ${currentLevel}`)
    .setTimestamp();

  availableContent.forEach((content, index) => {
    embed.addFields({
      name: `${index + 1}. ${content.title}`,
      value: `*${content.description}*\n**Passphrase:** \`${content.passphrase}\` | **Level:** ${content.requiredLevel}`,
      inline: false
    });
  });

  embed.addFields({
    name: 'How to Access',
    value: 'Use `/whisper content:[title or passphrase]` to access specific content',
    inline: false
  });

  embed.setFooter({ 
    text: `${availableContent.length} whisper(s) available` 
  });

  return embed;
}

/**
 * Create individual content embed
 */
async function createContentEmbed(content, userLevel) {
  try {
    const contentText = await loadContentText(content.path);
    
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🌟 ${content.title}`)
      .setDescription(content.description)
      .setTimestamp();

    if (contentText) {
      // Extract preview from content
      const preview = extractContentPreview(contentText);
      embed.addFields({
        name: 'Content Preview',
        value: preview,
        inline: false
      });
    }

    embed.addFields(
      {
        name: 'Passphrase',
        value: `\`${content.passphrase}\``,
        inline: true
      },
      {
        name: 'Required Level',
        value: `${content.requiredLevel}`,
        inline: true
      },
      {
        name: 'Your Level',
        value: `${userLevel}`,
        inline: true
      }
    );

    // Add full content link if available
    if (content.path) {
      embed.addFields({
        name: 'Full Content',
        value: `Access the complete whisper at: [${content.title}](https://4got1en.github.io/6ol-core/${content.path})`,
        inline: false
      });
    }

    embed.setFooter({ 
      text: 'Whisper Engine • 6ol Core' 
    });

    return embed;
  } catch (error) {
    console.error('Error creating content embed:', error);
    return createSimpleContentEmbed(content, userLevel);
  }
}

/**
 * Create simple content embed as fallback
 */
function createSimpleContentEmbed(content, userLevel) {
  return new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle(`🌟 ${content.title}`)
    .setDescription(content.description)
    .addFields(
      {
        name: 'Passphrase',
        value: `\`${content.passphrase}\``,
        inline: true
      },
      {
        name: 'Required Level',
        value: `${content.requiredLevel}`,
        inline: true
      },
      {
        name: 'Your Level', 
        value: `${userLevel}`,
        inline: true
      }
    )
    .setFooter({ text: 'Whisper Engine • 6ol Core' })
    .setTimestamp();
}

/**
 * Load content text from file
 */
async function loadContentText(contentPath) {
  try {
    const fullPath = path.join(__dirname, '..', contentPath);
    const content = await fs.readFile(fullPath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error loading content from ${contentPath}:`, error);
    return null; // Graceful degradation
  }
}

/**
 * Extract preview from content text
 */
function extractContentPreview(contentText) {
  const lines = contentText.split('\n').filter(line => line.trim());
  let preview = '';
  
  // Find first substantial content line
  for (const line of lines) {
    if (line.length > 20 && !line.startsWith('---') && !line.includes(':') && !line.startsWith('#')) {
      preview = line.substring(0, 200);
      if (preview.length < line.length) preview += '...';
      break;
    }
  }
  
  return preview || 'Content preview unavailable';
}

/**
 * Create embed for when no content is available
 */
function createNoContentEmbed(currentLevel) {
  return new EmbedBuilder()
    .setColor(0x95a5a6)
    .setTitle('🌌 Whisper Engine')
    .setDescription(`No whisper content available for Level ${currentLevel}`)
    .addFields({
      name: 'How to Unlock',
      value: 'Progress through the loops using `/ascend` to unlock more whisper content',
      inline: false
    })
    .setFooter({ text: 'Continue your journey to discover new whispers' })
    .setTimestamp();
}

/**
 * Create embed for when requested content is not found
 */
function createContentNotFoundEmbed(requestedContent, currentLevel) {
  return new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle('❌ Content Not Found')
    .setDescription(`Could not find whisper content: "${requestedContent}"`)
    .addFields({
      name: 'Your Level',
      value: `${currentLevel}`,
      inline: true
    }, {
      name: 'Suggestion',
      value: 'Use `/whisper` without options to see available content',
      inline: false
    })
    .setTimestamp();
}

/**
 * Create error embed
 */
function createErrorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}