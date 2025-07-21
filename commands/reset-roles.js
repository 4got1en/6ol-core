/**
 * reset-roles.js - Discord slash command for flame role cleanup
 * Allows administrators to delete flame roles for temple maintenance
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset-roles')
    .setDescription('Delete all flame roles for temple maintenance - Admin/Flamebearer only'),
  
  async execute(interaction) {
    try {
      await interaction.deferReply();

      const member = interaction.member;
      const guild = interaction.guild;

      // Check permissions - must be administrator or have Flamebearer role
      const hasAdminPermission = member.permissions.has(PermissionFlagsBits.Administrator);
      const hasFlamebearerRole = member.roles.cache.some(role => 
        role.name.toLowerCase().includes('flamebearer')
      );

      if (!hasAdminPermission && !hasFlamebearerRole) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('❌ Access Denied')
          .setDescription('Only administrators or users with the Flamebearer role can use this command.')
          .setTimestamp();

        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      // Define the flame role names to search for (updated for new flame system)
      const flameRoleNames = [
        'Seeker Flame',
        'Devoted Flame', 
        'Descender Flame',
        'Reclaimer Flame',
        'Witness Flame'
      ];

      const rolesDeleted = [];
      const rolesNotFound = [];
      const roleErrors = [];

      // Search for and delete flame roles
      for (const roleName of flameRoleNames) {
        try {
          // Find role by name (case-insensitive)
          const role = guild.roles.cache.find(r => 
            r.name.toLowerCase() === roleName.toLowerCase()
          );

          if (role) {
            // Check if bot can delete this role
            const botMember = guild.members.me;
            if (botMember.roles.highest.position <= role.position) {
              roleErrors.push(`${roleName} - Bot role hierarchy insufficient`);
              continue;
            }

            await role.delete(`Flame role reset by ${member.displayName}`);
            rolesDeleted.push(roleName);
            console.log(`🔥 Deleted flame role: ${roleName} by ${member.displayName} (${member.id})`);
          } else {
            rolesNotFound.push(roleName);
          }
        } catch (error) {
          console.error(`Error deleting role ${roleName}:`, error);
          roleErrors.push(`${roleName} - ${error.message}`);
        }
      }

      // Create response embed
      const embed = new EmbedBuilder()
        .setColor(rolesDeleted.length > 0 ? 0xf5c84c : 0x95a5a6)
        .setTitle('🔥 Flame Role Reset Complete')
        .setTimestamp()
        .setFooter({ text: `Requested by ${member.displayName}` });

      let description = '';

      if (rolesDeleted.length > 0) {
        description += `**🗑️ Deleted Roles (${rolesDeleted.length}):**\n`;
        description += rolesDeleted.map(role => `• ${role}`).join('\n');
        description += '\n\n';
      }

      if (rolesNotFound.length > 0) {
        description += `**🔍 Roles Not Found (${rolesNotFound.length}):**\n`;
        description += rolesNotFound.map(role => `• ${role}`).join('\n');
        description += '\n\n';
      }

      if (roleErrors.length > 0) {
        description += `**⚠️ Errors (${roleErrors.length}):**\n`;
        description += roleErrors.map(error => `• ${error}`).join('\n');
        description += '\n\n';
      }

      if (rolesDeleted.length === 0 && rolesNotFound.length === flameRoleNames.length) {
        description = '🔍 No flame roles found in this guild. The temple is already clean.';
      }

      embed.setDescription(description);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Reset-roles command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('❌ Command Error')
        .setDescription('An unexpected error occurred during the flame role reset.')
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