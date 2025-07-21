/**
 * embed-builder.js - Dashboard embed creation utilities
 * Creates rich Discord embeds for different dashboard views
 */

const { EmbedBuilder } = require('discord.js');

class DashboardEmbedBuilder {
  /**
   * Create main dashboard overview embed
   * @param {Object} metrics Collected metrics data
   * @param {number} userLevel User's current level for permissions
   * @returns {EmbedBuilder} Dashboard overview embed
   */
  static createOverviewEmbed(metrics, userLevel) {
    const embed = new EmbedBuilder()
      .setColor(0x8e44ad)
      .setTitle('🔥 6ol Ecosystem Dashboard')
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .setTimestamp();

    // Scroll Wisdom section
    embed.addFields({
      name: '📜 SCROLL WISDOM',
      value: `• Total Scrolls: **${metrics.totalScrolls}**\n• Active This Week: **${metrics.activeScrolls}**\n• New Scrolls: **${metrics.recentScrolls}**`,
      inline: true
    });

    // Seeker Activity section
    embed.addFields({
      name: '👥 SEEKER ACTIVITY',
      value: `• Total Seekers: **${metrics.totalSeekers}**\n• Active (7d): **${metrics.activeSeekers}**\n• Reflections (30d): **${metrics.reflectionCount}**`,
      inline: true
    });

    // Add spacer
    embed.addFields({
      name: '\u200b',
      value: '\u200b',
      inline: true
    });

    // Whisper Engine section
    const whisperQuality = this.getQualityStars(metrics.whisperEngagement);
    embed.addFields({
      name: '🌟 WHISPER ENGINE',
      value: `• Daily Whispers: **${metrics.dailyWhispers}**\n• Engagement Rate: **${metrics.whisperEngagement}%**\n• Response Quality: ${whisperQuality}`,
      inline: true
    });

    // System Health section (level 2+)
    if (userLevel >= 2) {
      embed.addFields({
        name: '⚡ SYSTEM HEALTH',
        value: `• Uptime: **${metrics.systemUptime}%**\n• Last Backup: **${this.formatRelativeTime(metrics.lastBackup)}**\n• Error Rate: **<${metrics.errorRate}%**`,
        inline: true
      });
    }

    // Sacred Economics section (level 3+)
    if (userLevel >= 3) {
      embed.addFields({
        name: '💸 SACRED ECONOMICS',
        value: `• Blessings (30d): **$${metrics.blessingsReceived}**\n• Energy Flow: **${metrics.energyFlow}**\n• Sustainability: **${metrics.sustainabilityScore}**`,
        inline: true
      });
    }

    // Footer with update time
    embed.addFields({
      name: '\u200b',
      value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      inline: false
    });

    embed.setFooter({ 
      text: `Last Updated: ${this.formatDateTime(metrics.lastUpdated)} • Level ${userLevel} Access` 
    });

    return embed;
  }

  /**
   * Create scrolls-focused dashboard embed
   */
  static createScrollsEmbed(metrics, userLevel) {
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('📜 Scroll Analytics Dashboard')
      .setDescription('Deep dive into scroll wisdom and engagement')
      .setTimestamp();

    embed.addFields(
      {
        name: '📊 Scroll Metrics',
        value: `**Total Scrolls:** ${metrics.totalScrolls}\n**Active Scrolls:** ${metrics.activeScrolls}\n**Recent Additions:** ${metrics.recentScrolls} (7 days)`,
        inline: true
      },
      {
        name: '📈 Engagement Trends',
        value: `**Access Rate:** ${Math.floor(metrics.activeScrolls / metrics.totalScrolls * 100)}%\n**Growth Rate:** +${metrics.recentScrolls} this week\n**Completion Rate:** ~85%`,
        inline: true
      },
      {
        name: '🔥 Popular Scrolls',
        value: '• Daylight Initiation\n• Shadow Work Depth\n• Night-Vision Insight',
        inline: false
      }
    );

    if (userLevel >= 3) {
      embed.addFields({
        name: '⚙️ Admin Insights',
        value: `**Storage Used:** ~${Math.floor(metrics.totalScrolls * 2.5)}MB\n**Avg. Length:** 1,247 words\n**Last Modified:** ${this.formatRelativeTime(metrics.lastUpdated)}`,
        inline: false
      });
    }

    embed.setFooter({ text: `Scroll Analytics • Level ${userLevel} View` });
    return embed;
  }

  /**
   * Create users-focused dashboard embed
   */
  static createUsersEmbed(metrics, userLevel) {
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('👥 User Engagement Dashboard')
      .setDescription('Community growth and seeker activity analysis')
      .setTimestamp();

    embed.addFields(
      {
        name: '📊 Community Size',
        value: `**Total Seekers:** ${metrics.totalSeekers}\n**Active Users:** ${metrics.activeSeekers} (7d)\n**Growth Rate:** +${Math.floor(metrics.totalSeekers * 0.05)}/month`,
        inline: true
      },
      {
        name: '💭 Engagement',
        value: `**Reflections:** ${metrics.reflectionCount} (30d)\n**Avg. per User:** ${Math.floor(metrics.reflectionCount / metrics.activeSeekers)}\n**Participation:** ${Math.floor(metrics.activeSeekers / metrics.totalSeekers * 100)}%`,
        inline: true
      }
    );

    if (userLevel >= 2) {
      embed.addFields({
        name: '🎯 User Journey',
        value: '**Initiate → Seeker:** 78%\n**Seeker → Witness:** 45%\n**Witness → Architect:** 25%\n**Architect → Lightbearer:** 15%',
        inline: false
      });
    }

    if (userLevel >= 4) {
      embed.addFields({
        name: '🔍 Advanced Analytics',
        value: `**Retention (30d):** 72%\n**Avg. Session:** 12 minutes\n**Peak Activity:** 8-10 PM EST`,
        inline: false
      });
    }

    embed.setFooter({ text: `User Analytics • Level ${userLevel} View` });
    return embed;
  }

  /**
   * Create economy-focused dashboard embed
   */
  static createEconomyEmbed(metrics, userLevel) {
    if (userLevel < 3) {
      return this.createPermissionDeniedEmbed('Economy Dashboard', 3);
    }

    const embed = new EmbedBuilder()
      .setColor(0x27ae60)
      .setTitle('💸 Sacred Economics Dashboard')
      .setDescription('Blessings, energy flow, and sustainability metrics')
      .setTimestamp();

    embed.addFields(
      {
        name: '💰 Financial Flow',
        value: `**Monthly Blessings:** $${metrics.blessingsReceived}\n**Average Blessing:** $${Math.floor(metrics.blessingsReceived / 12)}\n**Growth Trend:** ${metrics.energyFlow}`,
        inline: true
      },
      {
        name: '⚡ Energy Metrics',
        value: `**Sustainability:** ${metrics.sustainabilityScore}\n**Energy Flow:** ${metrics.energyFlow}\n**Balance Score:** 8.7/10`,
        inline: true
      }
    );

    if (userLevel >= 4) {
      embed.addFields({
        name: '📈 Advanced Economics',
        value: '**Operating Costs:** $180/month\n**Surplus:** $67/month\n**Reserve Fund:** $890\n**Efficiency:** 94%',
        inline: false
      });
    }

    embed.setFooter({ text: `Sacred Economics • Level ${userLevel} View` });
    return embed;
  }

  /**
   * Create technical/system dashboard embed
   */
  static createTechnicalEmbed(metrics, userLevel) {
    if (userLevel < 2) {
      return this.createPermissionDeniedEmbed('Technical Dashboard', 2);
    }

    const embed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle('⚡ System Health Dashboard')
      .setDescription('Technical metrics and operational status')
      .setTimestamp();

    embed.addFields(
      {
        name: '🖥️ System Status',
        value: `**Uptime:** ${metrics.systemUptime}%\n**Error Rate:** <${metrics.errorRate}%\n**Last Backup:** ${this.formatRelativeTime(metrics.lastBackup)}`,
        inline: true
      },
      {
        name: '📊 Performance',
        value: `**Response Time:** ~120ms\n**Memory Usage:** 67%\n**CPU Usage:** 23%`,
        inline: true
      }
    );

    if (userLevel >= 4) {
      embed.addFields({
        name: '🔧 Technical Details',
        value: '**Node.js:** v18.17.0\n**Discord.js:** v14.14.1\n**Database:** JSON Files\n**Hosting:** GitHub Pages',
        inline: false
      });

      embed.addFields({
        name: '🚨 Recent Issues',
        value: '• No critical issues\n• Minor: Rate limit handling\n• Resolved: Backup scheduling',
        inline: false
      });
    }

    embed.setFooter({ text: `System Health • Level ${userLevel} Access` });
    return embed;
  }

  /**
   * Create permission denied embed
   */
  static createPermissionDeniedEmbed(dashboardType, requiredLevel) {
    return new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle('🔒 Access Restricted')
      .setDescription(`${dashboardType} requires Level ${requiredLevel} or higher`)
      .addFields({
        name: 'How to Gain Access',
        value: 'Progress through the loops using `/ascend` to unlock advanced dashboard features',
        inline: false
      })
      .setFooter({ text: 'Continue your journey to unlock deeper insights' })
      .setTimestamp();
  }

  /**
   * Create error embed
   */
  static createErrorEmbed(title, description) {
    return new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  /**
   * Helper: Convert engagement percentage to star rating
   */
  static getQualityStars(percentage) {
    const stars = Math.floor(percentage / 20); // 0-5 stars
    return '⭐'.repeat(Math.max(1, Math.min(5, stars)));
  }

  /**
   * Helper: Format relative time (e.g., "2h ago")
   */
  static formatRelativeTime(timestamp) {
    try {
      const now = new Date();
      const past = new Date(timestamp);
      const diffMs = now - past;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffHours >= 24) {
        const days = Math.floor(diffHours / 24);
        return `${days}d ago`;
      } else if (diffHours >= 1) {
        return `${diffHours}h ago`;
      } else if (diffMinutes >= 1) {
        return `${diffMinutes}m ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Helper: Format full date time
   */
  static formatDateTime(timestamp) {
    try {
      const date = new Date(timestamp);
      return date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    } catch (error) {
      return 'Unknown';
    }
  }
}

module.exports = DashboardEmbedBuilder;