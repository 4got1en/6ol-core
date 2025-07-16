/**
 * reflect.js - Discord slash command for daily reflections
 * Provides level-appropriate reflection prompts with progress tracking
 */

const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const LoopRoleManager = require('../utils/loopRoles');
const fs = require('fs').promises;
const path = require('path');

// Reflection prompts by level
const REFLECTION_PROMPTS = {
  1: [
    "What sparked your curiosity to begin this journey?",
    "What are you hoping to discover about yourself?",
    "What feels most challenging about starting something new?"
  ],
  2: [
    "How has your understanding of yourself shifted since beginning?",
    "What patterns in your life are becoming clearer?",
    "What resistance are you noticing within yourself?"
  ],
  3: [
    "What shadow within you is ready to be acknowledged?",
    "What aspect of yourself have you been avoiding?",
    "How does embracing your shadow change your perspective?"
  ],
  4: [
    "What patterns are you ready to architect into your life?",
    "How will you build upon the insights you've gained?",
    "What structures support your continued growth?"
  ],
  5: [
    "How will you carry this light forward into the world?",
    "What wisdom are you ready to share with others?",
    "How has this journey transformed your purpose?"
  ]
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reflect')
    .setDescription('Engage with a daily reflection prompt'),

  async execute(interaction) {
    try {
      const member = interaction.member;
      const guild = interaction.guild;
      const roleManager = new LoopRoleManager(guild);

      // Get user's current level
      const currentLevel = await roleManager.getCurrentLoopLevel(member);
      
      // Get appropriate reflection prompt
      const prompt = getReflectionPrompt(currentLevel);
      
      // Check if user has already reflected today
      const hasReflectedToday = await checkTodaysReflection(member.id);
      
      if (hasReflectedToday) {
        const embed = createAlreadyReflectedEmbed(currentLevel);
        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // Create reflection embed
      const reflectionEmbed = createReflectionEmbed(currentLevel, prompt);
      
      // Create modal for reflection input
      const modal = createReflectionModal(prompt);
      
      await interaction.showModal(modal);

      // Handle modal submission
      const filter = (i) => i.customId === 'reflection_modal' && i.user.id === interaction.user.id;
      
      try {
        const modalSubmission = await interaction.awaitModalSubmit({ 
          filter, 
          time: 300000 // 5 minutes
        });

        await handleReflectionSubmission(modalSubmission, member, currentLevel, prompt);
        
      } catch (error) {
        if (error.code === 'InteractionCollectorError') {
          // Modal timed out - this is normal, user might have cancelled
          console.log('Reflection modal timed out for user:', member.id);
        } else {
          console.error('Error handling reflection modal:', error);
        }
      }

    } catch (error) {
      console.error('Reflect command error:', error);
      
      const errorEmbed = createErrorEmbed(
        'Command Error',
        'An unexpected error occurred while preparing your reflection'
      );

      try {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      } catch (replyError) {
        console.error('Failed to send error response:', replyError);
      }
    }
  },
};

/**
 * Get appropriate reflection prompt for user's level
 */
function getReflectionPrompt(level) {
  const prompts = REFLECTION_PROMPTS[level] || REFLECTION_PROMPTS[1];
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const promptIndex = dayOfYear % prompts.length;
  
  return prompts[promptIndex];
}

/**
 * Create reflection embed
 */
function createReflectionEmbed(level, prompt) {
  return new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🪞 Daily Reflection')
    .setDescription(`**Level ${level} Reflection:**\n\n*"${prompt}"*`)
    .addFields({
      name: 'Instructions',
      value: 'Click the button below to open a form for your reflection. Take your time to provide a thoughtful response.',
      inline: false
    })
    .setFooter({ text: 'Reflections help track your growth and unlock deeper insights' })
    .setTimestamp();
}

/**
 * Create reflection modal
 */
function createReflectionModal(prompt) {
  const modal = new ModalBuilder()
    .setCustomId('reflection_modal')
    .setTitle('Daily Reflection');

  const reflectionInput = new TextInputBuilder()
    .setCustomId('reflection_text')
    .setLabel('Your Reflection')
    .setPlaceholder(`Reflect on: "${prompt}"`)
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(10)
    .setMaxLength(1000)
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder().addComponents(reflectionInput);
  modal.addComponents(firstActionRow);

  return modal;
}

/**
 * Handle reflection submission
 */
async function handleReflectionSubmission(modalSubmission, member, level, prompt) {
  try {
    await modalSubmission.deferReply({ ephemeral: true });

    const reflection = modalSubmission.fields.getTextInputValue('reflection_text');
    
    // Save reflection
    await saveReflection(member.id, level, prompt, reflection);
    
    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle('✨ Reflection Recorded')
      .setDescription('Your reflection has been saved. Thank you for taking time to engage with your inner wisdom.')
      .addFields({
        name: 'Reflection Preview',
        value: reflection.length > 100 ? reflection.substring(0, 100) + '...' : reflection,
        inline: false
      })
      .setFooter({ text: `Level ${level} reflection complete` })
      .setTimestamp();

    await modalSubmission.editReply({ embeds: [successEmbed] });

  } catch (error) {
    console.error('Error handling reflection submission:', error);
    
    const errorEmbed = createErrorEmbed(
      'Submission Error',
      'There was an error saving your reflection. Please try again.'
    );

    try {
      await modalSubmission.editReply({ embeds: [errorEmbed] });
    } catch (replyError) {
      console.error('Failed to send submission error response:', replyError);
    }
  }
}

/**
 * Check if user has reflected today
 */
async function checkTodaysReflection(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const reflectionPath = path.join(__dirname, '..', 'data', 'reflections', `${userId}-${today}.json`);
    
    await fs.access(reflectionPath);
    return true; // File exists, user has reflected today
  } catch (error) {
    return false; // File doesn't exist, user hasn't reflected today
  }
}

/**
 * Save reflection to file
 */
async function saveReflection(userId, level, prompt, reflection) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const reflectionsDir = path.join(__dirname, '..', 'data', 'reflections');
    
    // Ensure reflections directory exists
    await fs.mkdir(reflectionsDir, { recursive: true });
    
    const reflectionData = {
      userId,
      date: today,
      level,
      prompt,
      reflection,
      timestamp: new Date().toISOString()
    };
    
    const reflectionPath = path.join(reflectionsDir, `${userId}-${today}.json`);
    await fs.writeFile(reflectionPath, JSON.stringify(reflectionData, null, 2));
    
  } catch (error) {
    console.error('Error saving reflection:', error);
    throw error; // Re-throw to handle in calling function
  }
}

/**
 * Create embed for when user has already reflected
 */
function createAlreadyReflectedEmbed(level) {
  return new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🪞 Reflection Complete')
    .setDescription('You have already completed your reflection for today. Return tomorrow for a new prompt.')
    .addFields({
      name: 'Current Level',
      value: `Level ${level}`,
      inline: true
    })
    .setFooter({ text: 'Consistency in reflection builds deeper awareness' })
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