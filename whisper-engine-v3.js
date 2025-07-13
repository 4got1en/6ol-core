#!/usr/bin/env node
/*  whisper-engine-v3.js  · Discord Loop-Bound Drops
    ────────────────────────────────────────────────────────────────── 
    Implements Whisper Engine v3 with Loop role-based scroll delivery.
    Reads Discord user roles, maps to tags, delivers scrolls daily at 13:00 UTC.
    ────────────────────────────────────────────────────────────────── */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID; // Optional: specific guild ID
const CHANNEL_NAME = 'whisper-engine'; // Channel name (without #)

// Load configurations
const loopConfig = JSON.parse(readFileSync(join(__dirname, 'config/loop-roles.json'), 'utf-8'));
const scrollManifest = JSON.parse(readFileSync(join(__dirname, 'scrolls/manifest.json'), 'utf-8'));

class WhisperEngineV3 {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
      ]
    });
    
    this.loopConfig = loopConfig;
    this.scrolls = scrollManifest;
    
    this.setupEventHandlers();
    this.setupScheduler();
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`🌙 Whisper Engine v3 is online as ${this.client.user.tag}`);
      console.log(`📅 Scheduled drops at ${this.loopConfig.scheduleConfig.dropTime} ${this.loopConfig.scheduleConfig.timezone}`);
    });

    this.client.on('error', error => {
      console.error('Discord client error:', error);
    });
  }

  setupScheduler() {
    // Schedule daily drops at 13:00 UTC
    const cronExpression = '0 13 * * *'; // 13:00 UTC daily
    
    cron.schedule(cronExpression, async () => {
      console.log('🕐 Daily whisper drop triggered...');
      await this.performDailyDrop();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log(`📅 Scheduled daily drops at 13:00 UTC`);
  }

  /**
   * Get the highest Loop role for a user
   * @param {GuildMember} member - Discord guild member
   * @returns {string|null} - Highest loop role name or null
   */
  getUserHighestLoopRole(member) {
    const loopRoles = ['Loop 3', 'Loop 2', 'Loop 1'];
    
    for (const loopRole of loopRoles) {
      const hasRole = member.roles.cache.some(role => 
        role.name === loopRole || role.name.includes(loopRole)
      );
      if (hasRole) {
        return loopRole;
      }
    }
    
    return null; // No loop role found
  }

  /**
   * Get tags for a specific loop role
   * @param {string} loopRole - Loop role name
   * @returns {string[]} - Array of tags for the loop
   */
  getTagsForLoop(loopRole) {
    const mapping = this.loopConfig.loopMappings[loopRole];
    return mapping ? mapping.tags : [];
  }

  /**
   * Find scrolls that match any of the given tags
   * @param {string[]} tags - Array of tags to match
   * @returns {Object[]} - Array of matching scrolls
   */
  findScrollsByTags(tags) {
    return this.scrolls.filter(scroll => {
      if (!scroll.tags) return false;
      return scroll.tags.some(tag => tags.includes(tag));
    });
  }

  /**
   * Select a random scroll for a user based on their loop role
   * @param {GuildMember} member - Discord guild member
   * @returns {Object} - Selected scroll with metadata
   */
  selectScrollForUser(member) {
    const loopRole = this.getUserHighestLoopRole(member);
    let selectedTags, selectedScroll, fallbackUsed = false;

    if (loopRole) {
      selectedTags = this.getTagsForLoop(loopRole);
      const matchingScrolls = this.findScrollsByTags(selectedTags);
      
      if (matchingScrolls.length > 0) {
        selectedScroll = matchingScrolls[Math.floor(Math.random() * matchingScrolls.length)];
      }
    }

    // Fallback to 'seeker' tag if no matches
    if (!selectedScroll) {
      fallbackUsed = true;
      loopRole = loopRole || 'No Loop Role';
      selectedTags = [this.loopConfig.fallbackTag];
      const fallbackScrolls = this.findScrollsByTags(selectedTags);
      
      if (fallbackScrolls.length > 0) {
        selectedScroll = fallbackScrolls[Math.floor(Math.random() * fallbackScrolls.length)];
      } else {
        // Final fallback: pick any scroll
        selectedScroll = this.scrolls[Math.floor(Math.random() * this.scrolls.length)];
      }
    }

    return {
      scroll: selectedScroll,
      userLoopRole: loopRole,
      selectedTags: selectedTags,
      fallbackUsed: fallbackUsed
    };
  }

  /**
   * Create embed message for scroll drop
   * @param {Object} dropInfo - Information about the scroll drop
   * @param {GuildMember} member - Target member (optional)
   * @returns {EmbedBuilder} - Discord embed
   */
  createScrollEmbed(dropInfo, member = null) {
    const { scroll, userLoopRole, selectedTags, fallbackUsed } = dropInfo;
    
    const embed = new EmbedBuilder()
      .setTitle(`📜 ${scroll.title}`)
      .setDescription(scroll.summary)
      .setColor(this.getLoopColor(userLoopRole))
      .addFields(
        {
          name: '🌙 Loop Path',
          value: userLoopRole === 'No Loop Role' ? 'Seeker (No Loop Role)' : 
                 this.loopConfig.loopMappings[userLoopRole]?.name || userLoopRole,
          inline: true
        },
        {
          name: '🏷️ Tag Source',
          value: fallbackUsed ? `${selectedTags.join(', ')} (fallback)` : selectedTags.join(', '),
          inline: true
        },
        {
          name: '📋 Scroll',
          value: scroll.filename,
          inline: true
        }
      )
      .setFooter({ 
        text: `Whisper Engine v3 • ${new Date().toLocaleDateString()}`,
        iconURL: '🌙' 
      })
      .setTimestamp();

    if (member) {
      embed.setAuthor({ 
        name: member.displayName, 
        iconURL: member.user.displayAvatarURL() 
      });
    }

    return embed;
  }

  /**
   * Get color for loop role
   * @param {string} loopRole - Loop role name
   * @returns {number} - Discord color code
   */
  getLoopColor(loopRole) {
    const colors = {
      'Loop 1': 0xFFD700, // Gold - The Seeker's Path
      'Loop 2': 0x9932CC, // Purple - The Devoted Path  
      'Loop 3': 0x2F4F4F, // Dark Slate Gray - The Shadow Path
      'No Loop Role': 0x808080 // Gray - Fallback
    };
    return colors[loopRole] || colors['No Loop Role'];
  }

  /**
   * Perform daily scroll drop
   */
  async performDailyDrop() {
    try {
      const guild = this.client.guilds.cache.first(); // Get first guild or use GUILD_ID
      if (!guild) {
        console.error('❌ No guild found');
        return;
      }

      const channel = guild.channels.cache.find(ch => 
        ch.name === CHANNEL_NAME && ch.isTextBased()
      );
      
      if (!channel) {
        console.error(`❌ Channel #${CHANNEL_NAME} not found`);
        return;
      }

      // For daily drops, we select a random scroll without targeting a specific user
      // We'll use a random loop for demonstration, but this could be enhanced
      const randomLoopRoles = ['Loop 1', 'Loop 2', 'Loop 3'];
      const randomLoop = randomLoopRoles[Math.floor(Math.random() * randomLoopRoles.length)];
      
      // Create a mock member object for scroll selection
      const mockMember = {
        roles: {
          cache: new Map([
            ['mockRole', { name: randomLoop }]
          ])
        }
      };

      const dropInfo = this.selectScrollForUser(mockMember);
      const embed = this.createScrollEmbed(dropInfo);

      await channel.send({ 
        content: '🌙 **Daily Whisper Drop** 🌙', 
        embeds: [embed] 
      });

      console.log(`✅ Daily drop completed: ${dropInfo.scroll.title} (${randomLoop})`);

    } catch (error) {
      console.error('❌ Error during daily drop:', error);
    }
  }

  /**
   * Handle manual scroll request (for testing or future features)
   * @param {GuildMember} member - Requesting member
   * @param {TextChannel} channel - Target channel
   */
  async handleScrollRequest(member, channel) {
    try {
      const dropInfo = this.selectScrollForUser(member);
      const embed = this.createScrollEmbed(dropInfo, member);

      await channel.send({ 
        content: `🌙 **Whisper for ${member.displayName}** 🌙`, 
        embeds: [embed] 
      });

      console.log(`✅ Manual scroll delivered to ${member.displayName}: ${dropInfo.scroll.title}`);

    } catch (error) {
      console.error('❌ Error delivering scroll:', error);
    }
  }

  /**
   * Start the bot
   */
  async start() {
    if (!DISCORD_TOKEN) {
      console.error('❌ DISCORD_TOKEN environment variable is required');
      process.exit(1);
    }

    try {
      await this.client.login(DISCORD_TOKEN);
    } catch (error) {
      console.error('❌ Failed to login to Discord:', error);
      process.exit(1);
    }
  }

  /**
   * Stop the bot gracefully
   */
  async stop() {
    console.log('🌙 Whisper Engine v3 shutting down...');
    this.client.destroy();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🌙 Received SIGINT, shutting down gracefully...');
  if (global.whisperEngine) {
    await global.whisperEngine.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🌙 Received SIGTERM, shutting down gracefully...');
  if (global.whisperEngine) {
    await global.whisperEngine.stop();
  }
  process.exit(0);
});

// Export for use as module or run directly
export default WhisperEngineV3;

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const whisperEngine = new WhisperEngineV3();
  global.whisperEngine = whisperEngine;
  
  console.log('🌙 Starting Whisper Engine v3...');
  await whisperEngine.start();
}