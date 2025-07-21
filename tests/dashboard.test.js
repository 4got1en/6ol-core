/**
 * dashboard.test.js - Unit tests for dashboard command
 */

const dashboardCommand = require('../commands/dashboard');
const MetricsCollector = require('../commands/utils/metrics-collector');
const DashboardPermissionChecker = require('../commands/utils/permission-checker');

// Mock dependencies
jest.mock('../commands/utils/metrics-collector');
jest.mock('../commands/utils/permission-checker');
jest.mock('../utils/loopRoles');

// Mock Discord interaction
const mockInteraction = (options = {}) => ({
  member: options.member || { id: 'test-user', displayName: 'TestUser' },
  guild: options.guild || { id: 'test-guild' },
  options: {
    getString: jest.fn().mockReturnValue(options.view || null)
  },
  deferReply: jest.fn().mockResolvedValue(),
  editReply: jest.fn().mockResolvedValue(),
  reply: jest.fn().mockResolvedValue(),
  deferred: true
});

// Mock metrics data
const mockMetrics = {
  totalScrolls: 47,
  activeScrolls: 12,
  recentScrolls: 3,
  totalSeekers: 156,
  activeSeekers: 34,
  reflectionCount: 89,
  dailyWhispers: 1,
  whisperEngagement: 73,
  systemUptime: '99.2',
  errorRate: '0.001',
  blessingsReceived: 247,
  energyFlow: '↗️ Growing',
  sustainabilityScore: '🟢 Stable',
  lastUpdated: new Date().toISOString()
};

describe('Dashboard Command', () => {
  let interaction;
  let mockMetricsCollector;
  let mockPermissionChecker;
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    interaction = mockInteraction();
    
    // Mock MetricsCollector
    mockMetricsCollector = {
      gatherMetrics: jest.fn().mockResolvedValue(mockMetrics)
    };
    MetricsCollector.mockImplementation(() => mockMetricsCollector);
    
    // Mock DashboardPermissionChecker
    mockPermissionChecker = {
      getUserPermissions: jest.fn(),
      checkDashboardAccess: jest.fn(),
      filterMetricsByPermissions: jest.fn(),
      getAvailableDashboards: jest.fn(),
      logPermissionCheck: jest.fn()
    };
    DashboardPermissionChecker.mockImplementation(() => mockPermissionChecker);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Overview Dashboard', () => {
    test('should display overview dashboard for level 1 user', async () => {
      const permissions = {
        level: 1,
        canViewOverview: true,
        canViewScrolls: true,
        canViewUsers: false,
        canViewEconomy: false,
        canViewTechnical: false,
        permissions: { basicMetrics: true, detailedAnalytics: false, financialData: false }
      };

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ allowed: true });
      mockPermissionChecker.filterMetricsByPermissions.mockReturnValue(mockMetrics);
      mockPermissionChecker.getAvailableDashboards.mockReturnValue([
        { name: 'overview', title: 'Overview', description: 'Complete ecosystem health summary' }
      ]);

      await dashboardCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalledWith({ ephemeral: true });
      expect(mockPermissionChecker.getUserPermissions).toHaveBeenCalledWith(interaction.member);
      expect(mockPermissionChecker.checkDashboardAccess).toHaveBeenCalledWith(interaction.member, 'overview');
      expect(mockMetricsCollector.gatherMetrics).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '🔥 6ol Ecosystem Dashboard'
              })
            })
          ])
        })
      );
    });

    test('should include navigation help for users with multiple dashboard access', async () => {
      const permissions = {
        level: 2,
        canViewOverview: true,
        canViewScrolls: true,
        canViewUsers: true,
        canViewEconomy: false,
        canViewTechnical: true
      };

      const availableDashboards = [
        { name: 'overview', title: 'Overview', description: 'Complete ecosystem health summary' },
        { name: 'scrolls', title: 'Scrolls', description: 'Scroll analytics and engagement' },
        { name: 'users', title: 'Users', description: 'Community growth and engagement' }
      ];

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ allowed: true });
      mockPermissionChecker.filterMetricsByPermissions.mockReturnValue(mockMetrics);
      mockPermissionChecker.getAvailableDashboards.mockReturnValue(availableDashboards);

      await dashboardCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                fields: expect.arrayContaining([
                  expect.objectContaining({
                    name: '🧭 Available Views'
                  })
                ])
              })
            })
          ])
        })
      );
    });
  });

  describe('Specific Dashboard Views', () => {
    test('should display scrolls dashboard when requested', async () => {
      interaction.options.getString.mockReturnValue('scrolls');
      
      const permissions = {
        level: 1,
        canViewScrolls: true,
        permissions: { basicMetrics: true }
      };

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ allowed: true });
      mockPermissionChecker.filterMetricsByPermissions.mockReturnValue(mockMetrics);
      mockPermissionChecker.getAvailableDashboards.mockReturnValue([]);

      await dashboardCommand.execute(interaction);

      expect(mockPermissionChecker.checkDashboardAccess).toHaveBeenCalledWith(interaction.member, 'scrolls');
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '📜 Scroll Analytics Dashboard'
              })
            })
          ])
        })
      );
    });

    test('should display users dashboard for level 2+ users', async () => {
      interaction.options.getString.mockReturnValue('users');
      
      const permissions = {
        level: 2,
        canViewUsers: true,
        permissions: { basicMetrics: true, detailedAnalytics: true }
      };

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ allowed: true });
      mockPermissionChecker.filterMetricsByPermissions.mockReturnValue(mockMetrics);
      mockPermissionChecker.getAvailableDashboards.mockReturnValue([]);

      await dashboardCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '👥 User Engagement Dashboard'
              })
            })
          ])
        })
      );
    });

    test('should display economy dashboard for level 3+ users', async () => {
      interaction.options.getString.mockReturnValue('economy');
      
      const permissions = {
        level: 3,
        canViewEconomy: true,
        permissions: { basicMetrics: true, detailedAnalytics: true, financialData: true }
      };

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ allowed: true });
      mockPermissionChecker.filterMetricsByPermissions.mockReturnValue(mockMetrics);
      mockPermissionChecker.getAvailableDashboards.mockReturnValue([]);

      await dashboardCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '💸 Sacred Economics Dashboard'
              })
            })
          ])
        })
      );
    });
  });

  describe('Permission Handling', () => {
    test('should deny access to restricted dashboard views', async () => {
      interaction.options.getString.mockReturnValue('economy');
      
      const permissions = { level: 1, canViewEconomy: false };

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ 
        allowed: false, 
        reason: 'Economic dashboard requires Level 3 (Witness) or higher' 
      });

      await dashboardCommand.execute(interaction);

      expect(mockPermissionChecker.logPermissionCheck).toHaveBeenCalledWith(
        interaction.member.id,
        'dashboard_economy',
        false,
        'Economic dashboard requires Level 3 (Witness) or higher'
      );

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '🔒 Access Restricted'
              })
            })
          ])
        })
      );
    });

    test('should filter metrics based on user permissions', async () => {
      const permissions = {
        level: 1,
        canViewOverview: true,
        permissions: { basicMetrics: true, detailedAnalytics: false, financialData: false }
      };

      const filteredMetrics = { ...mockMetrics };
      delete filteredMetrics.blessingsReceived;
      delete filteredMetrics.energyFlow;
      delete filteredMetrics.sustainabilityScore;

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ allowed: true });
      mockPermissionChecker.filterMetricsByPermissions.mockReturnValue(filteredMetrics);
      mockPermissionChecker.getAvailableDashboards.mockReturnValue([]);

      await dashboardCommand.execute(interaction);

      expect(mockPermissionChecker.filterMetricsByPermissions).toHaveBeenCalledWith(mockMetrics, permissions);
    });
  });

  describe('Error Handling', () => {
    test('should handle metrics collection errors gracefully', async () => {
      const permissions = { level: 1, canViewOverview: true, permissions: { basicMetrics: true } };

      mockPermissionChecker.getUserPermissions.mockResolvedValue(permissions);
      mockPermissionChecker.checkDashboardAccess.mockResolvedValue({ allowed: true });
      mockMetricsCollector.gatherMetrics.mockRejectedValue(new Error('Metrics collection failed'));
      mockPermissionChecker.filterMetricsByPermissions.mockReturnValue({});
      mockPermissionChecker.getAvailableDashboards.mockReturnValue([]);

      await dashboardCommand.execute(interaction);

      // Should still succeed with fallback or error handling
      expect(interaction.editReply).toHaveBeenCalled();
    });

    test('should handle permission check errors gracefully', async () => {
      mockPermissionChecker.getUserPermissions.mockRejectedValue(new Error('Permission check failed'));

      await dashboardCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '❌ Dashboard Error'
              })
            })
          ])
        })
      );
    });

    test('should handle unexpected errors during command execution', async () => {
      // Simulate an unexpected error
      interaction.deferReply.mockRejectedValue(new Error('Unexpected error'));

      await dashboardCommand.execute(interaction);

      expect(consoleSpy).toHaveBeenCalledWith('Dashboard command error:', expect.any(Error));
    });
  });

  describe('Command Structure', () => {
    test('should have correct command data', () => {
      expect(dashboardCommand.data).toBeDefined();
      expect(dashboardCommand.data.name).toBe('dashboard');
      expect(dashboardCommand.data.description).toBe('View 6ol ecosystem health and sacred metrics');
    });

    test('should have execute function', () => {
      expect(typeof dashboardCommand.execute).toBe('function');
    });

    test('should have view option with correct choices', () => {
      const options = dashboardCommand.data.options;
      expect(options).toHaveLength(1);
      
      const viewOption = options[0];
      expect(viewOption.name).toBe('view');
      expect(viewOption.choices).toHaveLength(5);
      
      const choiceValues = viewOption.choices.map(choice => choice.value);
      expect(choiceValues).toContain('overview');
      expect(choiceValues).toContain('scrolls');
      expect(choiceValues).toContain('users');
      expect(choiceValues).toContain('economy');
      expect(choiceValues).toContain('technical');
    });
  });

  describe('Helper Methods', () => {
    test('getRequiredLevel should return correct levels', () => {
      expect(dashboardCommand.getRequiredLevel('overview')).toBe(1);
      expect(dashboardCommand.getRequiredLevel('scrolls')).toBe(1);
      expect(dashboardCommand.getRequiredLevel('users')).toBe(2);
      expect(dashboardCommand.getRequiredLevel('economy')).toBe(3);
      expect(dashboardCommand.getRequiredLevel('technical')).toBe(2);
      expect(dashboardCommand.getRequiredLevel('unknown')).toBe(1);
    });

    test('createNavigationText should format available dashboards correctly', () => {
      const availableDashboards = [
        { name: 'overview', description: 'Complete ecosystem health summary' },
        { name: 'scrolls', description: 'Scroll analytics and engagement' },
        { name: 'users', description: 'Community growth and engagement' }
      ];

      const navText = dashboardCommand.createNavigationText(availableDashboards, 'overview');
      
      expect(navText).toContain('/dashboard view:scrolls');
      expect(navText).toContain('/dashboard view:users');
      expect(navText).not.toContain('/dashboard view:overview'); // Current view excluded
    });

    test('createNavigationText should return null for no other dashboards', () => {
      const availableDashboards = [
        { name: 'overview', description: 'Complete ecosystem health summary' }
      ];

      const navText = dashboardCommand.createNavigationText(availableDashboards, 'overview');
      expect(navText).toBeNull();
    });
  });
});