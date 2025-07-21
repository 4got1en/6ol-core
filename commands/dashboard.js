/**
 * dashboard.js - Main dashboard command for 6ol ecosystem insights
 * Provides real-time metrics and analytics with role-based access control
 */

const { SlashCommandBuilder } = require('discord.js');
const MetricsCollector = require('./utils/metrics-collector');
const DashboardEmbedBuilder = require('./utils/embed-builder');
const DashboardPermissionChecker = require('./utils/permission-checker');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('View 6ol ecosystem health and sacred metrics')
    .addStringOption(option =>
      option.setName('view')
        .setDescription('Specific dashboard view to display')
        .setRequired(false)
        .addChoices(
          { name: 'Overview', value: 'overview' },
          { name: 'Scrolls Analytics', value: 'scrolls' },
          { name: 'User Engagement', value: 'users' },
          { name: 'Sacred Economics', value: 'economy' },
          { name: 'System Health', value: 'technical' }
        )
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.member;
      const guild = interaction.guild;
      const requestedView = interaction.options.getString('view') || 'overview';

      // Initialize utilities
      const metricsCollector = new MetricsCollector(guild);
      const permissionChecker = new DashboardPermissionChecker(guild);

      // Check user permissions
      const permissions = await permissionChecker.getUserPermissions(member);
      const accessCheck = await permissionChecker.checkDashboardAccess(member, requestedView);

      // Log permission check for audit
      permissionChecker.logPermissionCheck(
        member.id, 
        `dashboard_${requestedView}`, 
        accessCheck.allowed, 
        accessCheck.reason
      );

      // Handle access denied
      if (!accessCheck.allowed) {
        const embed = DashboardEmbedBuilder.createPermissionDeniedEmbed(
          `${requestedView.charAt(0).toUpperCase() + requestedView.slice(1)} Dashboard`,
          this.getRequiredLevel(requestedView)
        );
        return await interaction.editReply({ embeds: [embed] });
      }

      // Gather metrics
      const rawMetrics = await metricsCollector.gatherMetrics();
      const filteredMetrics = permissionChecker.filterMetricsByPermissions(rawMetrics, permissions);

      // Create appropriate embed based on requested view
      let embed;
      switch (requestedView.toLowerCase()) {
        case 'scrolls':
          embed = DashboardEmbedBuilder.createScrollsEmbed(filteredMetrics, permissions.level);
          break;
        case 'users':
          embed = DashboardEmbedBuilder.createUsersEmbed(filteredMetrics, permissions.level);
          break;
        case 'economy':
          embed = DashboardEmbedBuilder.createEconomyEmbed(filteredMetrics, permissions.level);
          break;
        case 'technical':
          embed = DashboardEmbedBuilder.createTechnicalEmbed(filteredMetrics, permissions.level);
          break;
        case 'overview':
        default:
          embed = DashboardEmbedBuilder.createOverviewEmbed(filteredMetrics, permissions.level);
          break;
      }

      // Add navigation help if user has access to multiple views
      const availableDashboards = permissionChecker.getAvailableDashboards(permissions);
      if (availableDashboards.length > 1) {
        const navigationText = this.createNavigationText(availableDashboards, requestedView);
        if (navigationText) {
          embed.addFields({
            name: '🧭 Available Views',
            value: navigationText,
            inline: false
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Dashboard command error:', error);
      
      const errorEmbed = DashboardEmbedBuilder.createErrorEmbed(
        'Dashboard Error',
        'An unexpected error occurred while loading the dashboard. Please try again.'
      );

      try {
        if (interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed] });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send dashboard error response:', replyError);
      }
    }
  },

  /**
   * Get required level for dashboard view
   * @param {string} view Dashboard view name
   * @returns {number} Required level
   */
  getRequiredLevel(view) {
    const requirements = {
      'overview': 1,
      'scrolls': 1,
      'users': 2,
      'economy': 3,
      'technical': 2
    };
    return requirements[view] || 1;
  },

  /**
   * Create navigation text for available dashboard views
   * @param {Array} availableDashboards List of available dashboards
   * @param {string} currentView Currently displayed view
   * @returns {string} Navigation help text
   */
  createNavigationText(availableDashboards, currentView) {
    const otherDashboards = availableDashboards.filter(d => d.name !== currentView);
    
    if (otherDashboards.length === 0) return null;
    
    const dashboardList = otherDashboards
      .map(d => `\`/dashboard view:${d.name}\` - ${d.description}`)
      .join('\n');
    
    return `${dashboardList}`;
  }
};