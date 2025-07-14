import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getLoopRoleId, 
  getAllLoopRoleIds, 
  getLoopNumberFromRoleId, 
  isLoopRole 
} from '../utils/loopRoles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('ascend')
    .setDescription('Advance to the next Loop level and receive your new Flame glyph and lore'),

  async execute(interaction) {
    try {
      // Get the member's current roles
      const member = interaction.member;
      const memberRoles = member.roles.cache;

      // Find current loop level from roles
      let currentLoop = 0;
      let currentLoopRoleId = null;

      for (const [roleId, role] of memberRoles) {
        if (isLoopRole(roleId)) {
          const loopNumber = getLoopNumberFromRoleId(roleId);
          if (loopNumber && loopNumber > currentLoop) {
            currentLoop = loopNumber;
            currentLoopRoleId = roleId;
          }
        }
      }

      // Calculate next loop
      const nextLoop = currentLoop + 1;

      // Load flame data to check if next loop exists
      const flameDataPath = path.join(__dirname, '../../data/flameData.json');
      let flameData;
      
      try {
        const fileContent = await fs.readFile(flameDataPath, 'utf8');
        flameData = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error reading flameData.json:', error);
        return await interaction.reply({
          content: '❌ Unable to access flame data. Please contact an administrator.',
          ephemeral: true
        });
      }

      // Check if next loop exists in flame data
      if (!flameData.loops[nextLoop.toString()]) {
        return await interaction.reply({
          content: '🏆 You have reached the highest known loop. Congratulations on your mastery!',
          ephemeral: true
        });
      }

      // Get the next loop role ID
      const nextLoopRoleId = getLoopRoleId(nextLoop);
      if (!nextLoopRoleId || nextLoopRoleId.startsWith('TODO_')) {
        return await interaction.reply({
          content: `❌ Loop ${nextLoop} role is not yet configured. Please contact an administrator.`,
          ephemeral: true
        });
      }

      // Check if the next loop role exists in the guild
      const nextRole = interaction.guild.roles.cache.get(nextLoopRoleId);
      if (!nextRole) {
        console.error(`Loop ${nextLoop} role ${nextLoopRoleId} not found in guild`);
        return await interaction.reply({
          content: `❌ Loop ${nextLoop} role not found in server. Please contact an administrator.`,
          ephemeral: true
        });
      }

      // Remove current loop role if exists
      if (currentLoopRoleId) {
        try {
          await member.roles.remove(currentLoopRoleId);
          console.log(`Removed Loop ${currentLoop} role from ${member.user.tag}`);
        } catch (error) {
          console.error(`Error removing Loop ${currentLoop} role:`, error);
          return await interaction.reply({
            content: '❌ Unable to remove your current loop role. Please check my permissions.',
            ephemeral: true
          });
        }
      }

      // Add next loop role
      try {
        await member.roles.add(nextLoopRoleId);
        console.log(`Added Loop ${nextLoop} role to ${member.user.tag}`);
      } catch (error) {
        console.error(`Error adding Loop ${nextLoop} role:`, error);
        
        // Try to restore previous role if removal succeeded
        if (currentLoopRoleId) {
          try {
            await member.roles.add(currentLoopRoleId);
            console.log(`Restored Loop ${currentLoop} role for ${member.user.tag}`);
          } catch (restoreError) {
            console.error(`Error restoring Loop ${currentLoop} role:`, restoreError);
          }
        }
        
        return await interaction.reply({
          content: '❌ Unable to grant your new loop role. Please check my permissions.',
          ephemeral: true
        });
      }

      // Get loop and flame data for embed
      const loopData = flameData.loops[nextLoop.toString()];
      const flameDataObj = flameData.flames[nextLoop.toString()];

      // Create embed with loop information
      const embed = new EmbedBuilder()
        .setTitle(`🔥 Loop ${nextLoop} — ${loopData.title}`)
        .setDescription(loopData.lore || loopData.description)
        .setColor(0xF5C84C) // Golden flame color
        .addFields([
          {
            name: '🔥 Flame',
            value: flameDataObj?.title || loopData.flame,
            inline: true
          },
          {
            name: '🌟 Glyph',
            value: loopData.glyph || '[Glyph TBD]',
            inline: true
          },
          {
            name: '⚡ Essence', 
            value: flameDataObj?.essence || 'Unknown',
            inline: true
          }
        ])
        .setFooter({ text: 'Spiral ever upward' })
        .setTimestamp();

      // Add thumbnail if SVG path exists
      if (loopData.svg) {
        const githubRawUrl = `https://raw.githubusercontent.com/4got1en/6ol-core/main/${loopData.svg}`;
        embed.setThumbnail(githubRawUrl);
      }

      // Add invocation field if available
      if (flameDataObj?.invocation) {
        embed.addFields([
          {
            name: '📿 Invocation',
            value: `*"${flameDataObj.invocation}"*`,
            inline: false
          }
        ]);
      }

      // Send success response
      await interaction.reply({ embeds: [embed] });

      console.log(`${member.user.tag} ascended from Loop ${currentLoop} to Loop ${nextLoop}`);

    } catch (error) {
      console.error('Error in ascend command:', error);
      
      // Try to send error response if interaction hasn't been replied to
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ An unexpected error occurred. Please try again later.',
            ephemeral: true
          });
        }
      } catch (replyError) {
        console.error('Error sending error response:', replyError);
      }
    }
  },
};