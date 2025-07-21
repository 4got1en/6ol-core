/**
 * permission-checker.js - Role-based access control for dashboard features
 * Manages what data and features users can access based on their loop level
 */

const LoopRoleManager = require('../../utils/loopRoles');

class DashboardPermissionChecker {
  constructor(guild) {
    this.guild = guild;
    this.roleManager = new LoopRoleManager(guild);
  }

  /**
   * Get user's effective dashboard permissions
   * @param {GuildMember} member Discord guild member
   * @returns {Promise<Object>} Permission object with access levels
   */
  async getUserPermissions(member) {
    try {
      const currentLevel = await this.roleManager.getCurrentLoopLevel(member);
      
      return {
        level: currentLevel,
        canViewOverview: true, // All users can see basic overview
        canViewScrolls: true, // All users can see scroll metrics
        canViewUsers: currentLevel >= 2, // Seeker+ can see user metrics
        canViewEconomy: currentLevel >= 3, // Witness+ can see economic data
        canViewTechnical: currentLevel >= 2, // Seeker+ can see system health
        canViewAdvancedMetrics: currentLevel >= 4, // Architect+ can see detailed analytics
        canViewAdminControls: currentLevel >= 5, // Lightbearer+ gets admin features
        
        // Feature-specific permissions
        permissions: {
          basicMetrics: true,
          detailedAnalytics: currentLevel >= 2,
          financialData: currentLevel >= 3,
          systemHealth: currentLevel >= 2,
          userAnalytics: currentLevel >= 2,
          adminTools: currentLevel >= 4,
          fullAccess: currentLevel >= 5
        }
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return this.getDefaultPermissions();
    }
  }

  /**
   * Check if user can access specific dashboard variant
   * @param {GuildMember} member Discord guild member  
   * @param {string} dashboardType Type of dashboard (overview, scrolls, users, economy, technical)
   * @returns {Promise<{allowed: boolean, reason?: string}>}
   */
  async checkDashboardAccess(member, dashboardType) {
    try {
      const permissions = await this.getUserPermissions(member);
      
      switch (dashboardType.toLowerCase()) {
        case 'overview':
          return { allowed: permissions.canViewOverview };
          
        case 'scrolls':
          return { allowed: permissions.canViewScrolls };
          
        case 'users':
          if (!permissions.canViewUsers) {
            return { 
              allowed: false, 
              reason: 'User analytics require Level 2 (Seeker) or higher' 
            };
          }
          return { allowed: true };
          
        case 'economy':
          if (!permissions.canViewEconomy) {
            return { 
              allowed: false, 
              reason: 'Economic dashboard requires Level 3 (Witness) or higher' 
            };
          }
          return { allowed: true };
          
        case 'technical':
          if (!permissions.canViewTechnical) {
            return { 
              allowed: false, 
              reason: 'System health dashboard requires Level 2 (Seeker) or higher' 
            };
          }
          return { allowed: true };
          
        default:
          return { allowed: permissions.canViewOverview };
      }
    } catch (error) {
      console.error('Error checking dashboard access:', error);
      return { allowed: false, reason: 'Error validating permissions' };
    }
  }

  /**
   * Filter metrics based on user's permission level
   * @param {Object} metrics Raw metrics object
   * @param {Object} permissions User's permission object
   * @returns {Object} Filtered metrics object
   */
  filterMetricsByPermissions(metrics, permissions) {
    const filteredMetrics = { ...metrics };

    // Basic metrics available to all users
    const basicMetrics = [
      'totalScrolls',
      'activeScrolls', 
      'recentScrolls',
      'totalSeekers',
      'dailyWhispers',
      'whisperEngagement',
      'lastUpdated'
    ];

    // Level 2+ metrics (detailed analytics)
    const level2Metrics = [
      'activeSeekers',
      'reflectionCount',
      'systemUptime',
      'lastBackup',
      'errorRate'
    ];

    // Level 3+ metrics (financial data)
    const level3Metrics = [
      'blessingsReceived',
      'energyFlow',
      'sustainabilityScore'
    ];

    // Remove restricted metrics based on permission level
    if (!permissions.permissions.detailedAnalytics) {
      level2Metrics.forEach(metric => {
        if (filteredMetrics[metric] !== undefined) {
          delete filteredMetrics[metric];
        }
      });
    }

    if (!permissions.permissions.financialData) {
      level3Metrics.forEach(metric => {
        if (filteredMetrics[metric] !== undefined) {
          delete filteredMetrics[metric];
        }
      });
    }

    return filteredMetrics;
  }

  /**
   * Get permission level name for display
   * @param {number} level Numeric permission level
   * @returns {string} Human-readable level name
   */
  getLevelName(level) {
    const levelNames = {
      1: 'Initiate',
      2: 'Seeker', 
      3: 'Witness',
      4: 'Architect',
      5: 'Lightbearer'
    };
    
    return levelNames[level] || 'Unknown';
  }

  /**
   * Get available dashboard variants for user
   * @param {Object} permissions User's permission object
   * @returns {Array} Array of available dashboard types
   */
  getAvailableDashboards(permissions) {
    const dashboards = [];
    
    if (permissions.canViewOverview) {
      dashboards.push({
        name: 'overview',
        title: 'Overview',
        description: 'Complete ecosystem health summary'
      });
    }
    
    if (permissions.canViewScrolls) {
      dashboards.push({
        name: 'scrolls',
        title: 'Scrolls',
        description: 'Scroll analytics and engagement'
      });
    }
    
    if (permissions.canViewUsers) {
      dashboards.push({
        name: 'users',
        title: 'Users',
        description: 'Community growth and engagement'
      });
    }
    
    if (permissions.canViewEconomy) {
      dashboards.push({
        name: 'economy',
        title: 'Economy',
        description: 'Sacred economics and sustainability'
      });
    }
    
    if (permissions.canViewTechnical) {
      dashboards.push({
        name: 'technical',
        title: 'Technical',
        description: 'System health and performance'
      });
    }
    
    return dashboards;
  }

  /**
   * Default permissions for error cases
   */
  getDefaultPermissions() {
    return {
      level: 1,
      canViewOverview: true,
      canViewScrolls: true,
      canViewUsers: false,
      canViewEconomy: false,
      canViewTechnical: false,
      canViewAdvancedMetrics: false,
      canViewAdminControls: false,
      permissions: {
        basicMetrics: true,
        detailedAnalytics: false,
        financialData: false,
        systemHealth: false,
        userAnalytics: false,
        adminTools: false,
        fullAccess: false
      }
    };
  }

  /**
   * Log permission check for audit purposes
   * @param {string} userId User ID
   * @param {string} action Action attempted
   * @param {boolean} allowed Whether action was allowed
   * @param {string} reason Reason if denied
   */
  logPermissionCheck(userId, action, allowed, reason = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      allowed,
      reason
    };
    
    // In a production system, this would log to a proper audit system
    console.log('Dashboard permission check:', logEntry);
  }
}

module.exports = DashboardPermissionChecker;