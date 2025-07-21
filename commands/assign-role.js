/**
 * assign-role.js - Assign flame roles to users based on conditions
 * Administrative command for flame role management
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assign-role')
    .setDescription('Assign flame roles to users - Admin/Flamebearer only')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to assign role to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('flame')
        .setDescription('Flame role to assign')
        .setRequired(true)
        .addChoices(
          { name: 'Seeker Flame (Gold)', value: 'seekerFlame' },
          { name: 'Devoted Flame (White)', value: 'devotedFlame' },
          { name: 'Descender Flame (Dark Blue)', value: 'descenderFlame' },
          { name: 'Reclaimer Flame (Dark Green)', value: 'reclaimerFlame' },
          { name: 'Witness Flame (Purple)', value: 'witnessFlame' }
        )
    )
    .addBooleanOption(option =>
      option.setName('force')
        .setDescription('Force assignment without level requirements')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const member = interaction.member;
      const guild = interaction.guild;
      const targetUser = interaction.options.getUser('user');
      const flameKey = interaction.options.getString('flame');
      const forceAssignment = interaction.options.getBoolean('force') || false;

      // Check permissions - must be administrator or have Flamebearer role
      const hasAdminPermission = member.permissions.has(PermissionFlagsBits.Administrator);
      const hasFlamebearerRole = member.roles.cache.some(role => 
        role.name.toLowerCase().includes('flamebearer') || 
        role.name.toLowerCase().includes('witness flame')
      );

      if (!hasAdminPermission && !hasFlamebearerRole) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ Access Denied')
          .setDescription('Only administrators or Flamebearers can assign flame roles.')
          .setTimestamp();

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // Get target member
      const targetMember = await guild.members.fetch(targetUser.id);
      if (!targetMember) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ User Not Found')
          .setDescription('Could not find the specified user in this guild.')
          .setTimestamp();

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // Load flame configuration
      const flameConfig = await loadFlameConfig();
      if (!flameConfig?.flameRoles?.[flameKey]) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ Invalid Flame')
          .setDescription('The specified flame role configuration was not found.')
          .setTimestamp();

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const flameRole = flameConfig.flameRoles[flameKey];

      // Create or find the role in Discord
      const assignmentResult = await assignFlameRole(
        guild, 
        targetMember, 
        flameRole, 
        forceAssignment
      );

      if (!assignmentResult.success) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ Assignment Failed')
          .setDescription(assignmentResult.message)
          .setTimestamp();

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setColor(parseInt(flameRole.color.replace('#', ''), 16))
        .setTitle('🔥 Flame Role Assigned')
        .setDescription(`Successfully assigned **${flameRole.name}** to ${targetMember.displayName}`)
        .addFields(
          {
            name: '👤 Recipient',
            value: targetMember.displayName,
            inline: true
          },
          {
            name: '🔥 Flame Assigned',
            value: flameRole.name,
            inline: true
          },
          {
            name: '🌀 Loop Level',
            value: flameRole.loop.toString(),
            inline: true
          },
          {
            name: '✨ Flame Essence',
            value: flameRole.description,
            inline: false
          }
        )
        .setTimestamp()
        .setFooter({ 
          text: `Assigned by ${member.displayName}${forceAssignment ? ' (forced)' : ''}` 
        });

      await interaction.editReply({ embeds: [successEmbed] });

      // Log the assignment
      console.log(`🔥 ${flameRole.name} assigned to ${targetMember.displayName} (${targetMember.id}) by ${member.displayName} (${member.id})`);

    } catch (error) {
      console.error('Assign-role command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred during role assignment.')
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
 * Assign flame role to user with validation
 */
async function assignFlameRole(guild, targetMember, flameRole, forceAssignment = false) {
  try {
    // Find or create the role
    let discordRole = guild.roles.cache.find(role => 
      role.name.toLowerCase() === flameRole.name.toLowerCase()
    );

    if (!discordRole) {
      // Create the role if it doesn't exist
      try {
        discordRole = await guild.roles.create({
          name: flameRole.name,
          color: flameRole.color,
          reason: `Flame role creation for ${targetMember.displayName}`,
          permissions: flameRole.permissions || []
        });
        console.log(`✅ Created new flame role: ${flameRole.name}`);
      } catch (createError) {
        console.error('Error creating role:', createError);
        return { 
          success: false, 
          message: `Failed to create role: ${createError.message}` 
        };
      }
    }

    // Check bot permissions
    const botMember = guild.members.me;
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return { 
        success: false, 
        message: 'Bot missing Manage Roles permission' 
      };
    }

    if (botMember.roles.highest.position <= discordRole.position) {
      return { 
        success: false, 
        message: 'Bot role hierarchy insufficient to assign this role' 
      };
    }

    // Check if user already has this role
    if (targetMember.roles.cache.has(discordRole.id)) {
      return { 
        success: false, 
        message: `User already has the ${flameRole.name} role` 
      };
    }

    // Remove other flame roles before assigning new one (unless forced)
    if (!forceAssignment) {
      await removeOtherFlameRoles(targetMember, flameRole.name);
    }

    // Assign the role
    await targetMember.roles.add(discordRole, `Flame role assignment by admin`);

    return { 
      success: true, 
      message: `Successfully assigned ${flameRole.name}`,
      roleId: discordRole.id
    };

  } catch (error) {
    console.error('Error in assignFlameRole:', error);
    return { 
      success: false, 
      message: `Assignment failed: ${error.message}` 
    };
  }
}

/**
 * Remove other flame roles from user
 */
async function removeOtherFlameRoles(member, keepRoleName) {
  try {
    const flameRoleNames = [
      'Seeker Flame',
      'Devoted Flame', 
      'Descender Flame',
      'Reclaimer Flame',
      'Witness Flame'
    ];

    const rolesToRemove = member.roles.cache.filter(role => 
      flameRoleNames.includes(role.name) && role.name !== keepRoleName
    );

    if (rolesToRemove.size > 0) {
      await member.roles.remove(rolesToRemove, 'Removing previous flame roles');
      console.log(`🔄 Removed ${rolesToRemove.size} previous flame roles from ${member.displayName}`);
    }
  } catch (error) {
    console.error('Error removing previous flame roles:', error);
    // Non-fatal error, continue with assignment
  }
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