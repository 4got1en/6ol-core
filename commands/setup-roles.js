/**
 * setup-roles.js - Initialize flame roles and permissions
 * Administrative command for setting up the complete flame role system
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Initialize all flame roles with proper colors and permissions - Admin only')
    .addBooleanOption(option =>
      option.setName('recreate')
        .setDescription('Delete and recreate existing roles')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const member = interaction.member;
      const guild = interaction.guild;
      const recreateRoles = interaction.options.getBoolean('recreate') || false;

      // Check permissions - must be administrator
      if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ Access Denied')
          .setDescription('Only administrators can use this command.')
          .setTimestamp();

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // Load flame configuration
      const flameConfig = await loadFlameConfig();
      if (!flameConfig?.flameRoles) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ Configuration Error')
          .setDescription('Could not load flame role configuration.')
          .setTimestamp();

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const results = {
        created: [],
        updated: [],
        errors: [],
        deleted: []
      };

      // Setup each flame role
      for (const [key, flameRole] of Object.entries(flameConfig.flameRoles)) {
        const result = await setupFlameRole(guild, flameRole, recreateRoles);
        
        if (result.success) {
          if (result.action === 'created') {
            results.created.push(flameRole.name);
          } else if (result.action === 'updated') {
            results.updated.push(flameRole.name);
          } else if (result.action === 'deleted_recreated') {
            results.deleted.push(flameRole.name);
            results.created.push(flameRole.name);
          }
        } else {
          results.errors.push(`${flameRole.name}: ${result.message}`);
        }
      }

      // Create results embed
      const embed = await createResultsEmbed(results, member);
      await interaction.editReply({ embeds: [embed] });

      // Log the setup
      console.log(`🔥 Flame roles setup completed by ${member.displayName} (${member.id})`);
      console.log(`Created: ${results.created.length}, Updated: ${results.updated.length}, Errors: ${results.errors.length}`);

    } catch (error) {
      console.error('Setup-roles command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('❌ Setup Error')
        .setDescription('An unexpected error occurred during role setup.')
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
 * Setup individual flame role
 */
async function setupFlameRole(guild, flameRole, recreateRoles = false) {
  try {
    // Check if role already exists
    let existingRole = guild.roles.cache.find(role => 
      role.name.toLowerCase() === flameRole.name.toLowerCase()
    );

    // Handle recreation
    if (existingRole && recreateRoles) {
      try {
        await existingRole.delete(`Recreating flame role: ${flameRole.name}`);
        console.log(`🗑️ Deleted existing role: ${flameRole.name}`);
        existingRole = null;
      } catch (deleteError) {
        return { 
          success: false, 
          message: `Failed to delete existing role: ${deleteError.message}` 
        };
      }
    }

    // Convert permissions to Discord permission flags
    const permissions = convertPermissions(flameRole.permissions);

    if (!existingRole) {
      // Create new role
      try {
        const newRole = await guild.roles.create({
          name: flameRole.name,
          color: flameRole.color,
          reason: `Flame role setup: ${flameRole.name}`,
          permissions: permissions,
          mentionable: true,
          hoist: false // Don't display separately in member list
        });

        console.log(`✅ Created flame role: ${flameRole.name} (${newRole.id})`);
        return { 
          success: true, 
          action: recreateRoles ? 'deleted_recreated' : 'created',
          roleId: newRole.id
        };
      } catch (createError) {
        return { 
          success: false, 
          message: `Failed to create role: ${createError.message}` 
        };
      }
    } else {
      // Update existing role
      try {
        await existingRole.edit({
          color: flameRole.color,
          permissions: permissions,
          reason: `Flame role update: ${flameRole.name}`
        });

        console.log(`🔄 Updated flame role: ${flameRole.name} (${existingRole.id})`);
        return { 
          success: true, 
          action: 'updated',
          roleId: existingRole.id
        };
      } catch (updateError) {
        return { 
          success: false, 
          message: `Failed to update role: ${updateError.message}` 
        };
      }
    }
  } catch (error) {
    console.error(`Error setting up flame role ${flameRole.name}:`, error);
    return { 
      success: false, 
      message: `Setup failed: ${error.message}` 
    };
  }
}

/**
 * Convert permission names to Discord permission flags
 */
function convertPermissions(permissions = []) {
  const permissionMap = {
    'VIEW_CHANNEL': PermissionFlagsBits.ViewChannel,
    'SEND_MESSAGES': PermissionFlagsBits.SendMessages,
    'READ_MESSAGE_HISTORY': PermissionFlagsBits.ReadMessageHistory,
    'EMBED_LINKS': PermissionFlagsBits.EmbedLinks,
    'ATTACH_FILES': PermissionFlagsBits.AttachFiles,
    'USE_EXTERNAL_EMOJIS': PermissionFlagsBits.UseExternalEmojis,
    'MANAGE_MESSAGES': PermissionFlagsBits.ManageMessages,
    'ADD_REACTIONS': PermissionFlagsBits.AddReactions,
    'USE_SLASH_COMMANDS': PermissionFlagsBits.UseApplicationCommands
  };

  let combinedPermissions = BigInt(0);
  
  for (const permission of permissions) {
    if (permissionMap[permission]) {
      combinedPermissions |= permissionMap[permission];
    }
  }

  return combinedPermissions;
}

/**
 * Create results embed
 */
async function createResultsEmbed(results, member) {
  const embed = new EmbedBuilder()
    .setTitle('🔥 Flame Roles Setup Complete')
    .setColor(0xf5c84c)
    .setTimestamp()
    .setFooter({ text: `Setup by ${member.displayName}` });

  let description = '';

  if (results.created.length > 0) {
    description += `**✅ Created (${results.created.length}):**\n`;
    description += results.created.map(role => `• ${role}`).join('\n');
    description += '\n\n';
  }

  if (results.updated.length > 0) {
    description += `**🔄 Updated (${results.updated.length}):**\n`;
    description += results.updated.map(role => `• ${role}`).join('\n');
    description += '\n\n';
  }

  if (results.deleted.length > 0) {
    description += `**🗑️ Recreated (${results.deleted.length}):**\n`;
    description += results.deleted.map(role => `• ${role}`).join('\n');
    description += '\n\n';
  }

  if (results.errors.length > 0) {
    description += `**⚠️ Errors (${results.errors.length}):**\n`;
    description += results.errors.map(error => `• ${error}`).join('\n');
    description += '\n\n';
  }

  if (results.created.length === 0 && results.updated.length === 0 && results.errors.length === 0) {
    description = '✨ All flame roles were already properly configured.';
  }

  embed.setDescription(description);

  // Add field with flame role hierarchy
  const hierarchyText = [
    '🟡 **Seeker Flame** (Level 1) - Golden',
    '⚪ **Devoted Flame** (Level 2) - White', 
    '🔵 **Descender Flame** (Level 3) - Dark Blue',
    '🟢 **Reclaimer Flame** (Level 4) - Dark Green',
    '🟣 **Witness Flame** (Level 5) - Purple'
  ].join('\n');

  embed.addFields({
    name: '🏛️ Flame Hierarchy',
    value: hierarchyText,
    inline: false
  });

  return embed;
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