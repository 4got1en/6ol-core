/**
 * setup-roles.js - Discord slash command for automatic flame role creation
 * Creates the required flame roles for Loop Ascension system
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Create flame roles required for Loop Ascension system'),
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const guild = interaction.guild;
      if (!guild) {
        await interaction.editReply({ content: 'This command must be run in a server.', ephemeral: true });
        return;
      }

      // Check if the bot has permission to manage roles
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        const embed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ Permission Error')
          .setDescription('Bot lacks the "Manage Roles" permission required to create roles.')
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Define the flame roles to create
      const flameRoles = [
        {
          name: 'Seeker Flame',
          color: 0xFFD700, // Gold
          description: 'Loop 1 - Awareness',
          loop: 1
        },
        {
          name: 'Devoted Flame', 
          color: 0xFFFFFF, // White
          description: 'Loop 2 - Discipline',
          loop: 2
        },
        {
          name: 'Descender Flame',
          color: 0x00008B, // DarkBlue
          description: 'Loop 3 - Shadow Integration',
          loop: 3
        },
        {
          name: 'Reclaimer Flame',
          color: 0x006400, // DarkGreen
          description: 'Loop 4 - Retrieval of Power',
          loop: 4
        },
        {
          name: 'Witness Flame',
          color: 0x800080, // Purple
          description: 'Loop 14 - Final Gaze',
          loop: 14
        }
      ];

      const results = {
        created: [],
        skipped: [],
        errors: []
      };

      // Process each flame role
      for (const roleData of flameRoles) {
        try {
          // Check if role already exists
          const existingRole = guild.roles.cache.find(role => role.name === roleData.name);
          
          if (existingRole) {
            results.skipped.push({
              name: roleData.name,
              reason: 'Role already exists'
            });
            console.log(`[setup-roles] Skipped ${roleData.name} - already exists`);
            continue;
          }

          // Create the role
          const newRole = await guild.roles.create({
            name: roleData.name,
            color: roleData.color,
            reason: `Flame role for ${roleData.description} created by setup-roles command`
          });

          results.created.push({
            name: roleData.name,
            description: roleData.description,
            loop: roleData.loop,
            id: newRole.id
          });

          console.log(`[setup-roles] Created role: ${roleData.name} (${roleData.description})`);

        } catch (roleError) {
          results.errors.push({
            name: roleData.name,
            error: roleError.message
          });
          console.error(`[setup-roles] Error creating role ${roleData.name}:`, roleError);
        }
      }

      // Create response embed
      const embed = await createResponseEmbed(results);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('[setup-roles] Command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred while setting up roles.')
        .setTimestamp();

      try {
        if (interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        console.error('[setup-roles] Failed to send error response:', replyError);
      }
    }
  }
};

/**
 * Create response embed based on role creation results
 */
async function createResponseEmbed(results) {
  const { created, skipped, errors } = results;
  
  // Determine embed color and title based on results
  let color = 0x00ff00; // Green for success
  let title = '✅ Flame Roles Setup Complete';
  
  if (errors.length > 0) {
    color = 0xff6b6b; // Red if there were errors
    title = '⚠️ Flame Roles Setup Completed with Errors';
  } else if (created.length === 0) {
    color = 0xffa500; // Orange if nothing was created
    title = 'ℹ️ No New Roles Created';
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setTimestamp();

  // Add created roles section
  if (created.length > 0) {
    const createdList = created
      .map(role => `• **${role.name}** - ${role.description}`)
      .join('\n');
    
    embed.addFields({
      name: `🆕 Created Roles (${created.length})`,
      value: createdList,
      inline: false
    });
  }

  // Add skipped roles section
  if (skipped.length > 0) {
    const skippedList = skipped
      .map(role => `• **${role.name}** - ${role.reason}`)
      .join('\n');
    
    embed.addFields({
      name: `⏭️ Skipped Roles (${skipped.length})`,
      value: skippedList,
      inline: false
    });
  }

  // Add errors section
  if (errors.length > 0) {
    const errorList = errors
      .map(error => `• **${error.name}** - ${error.error}`)
      .join('\n');
    
    embed.addFields({
      name: `❌ Errors (${errors.length})`,
      value: errorList,
      inline: false
    });
  }

  // Add summary description
  if (created.length === 0 && skipped.length === 0 && errors.length === 0) {
    embed.setDescription('No flame roles were processed.');
  } else {
    const summary = [];
    if (created.length > 0) summary.push(`${created.length} created`);
    if (skipped.length > 0) summary.push(`${skipped.length} skipped`);
    if (errors.length > 0) summary.push(`${errors.length} failed`);
    
    embed.setDescription(`Flame roles setup completed: ${summary.join(', ')}.`);
  }

  return embed;
}