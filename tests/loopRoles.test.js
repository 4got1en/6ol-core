/**
 * loopRoles.test.js - Unit tests for role management
 */

const LoopRoleManager = require('../utils/loopRoles');

// Mock Discord.js objects
const mockRole = (id, position) => ({
  id,
  position,
  name: `Mock Role ${id}`
});

const mockMember = (roles = []) => ({
  id: 'test-user-id',
  roles: {
    cache: new Map(roles.map(roleId => [roleId, mockRole(roleId, 1)]))
  }
});

const mockGuild = (roles = [], botPosition = 10) => ({
  id: 'test-guild-id',
  roles: {
    cache: new Map(roles.map(role => [role.id, role]))
  },
  members: {
    me: {
      permissions: {
        has: jest.fn(() => true)
      },
      roles: {
        highest: { position: botPosition }
      }
    }
  }
});

describe('LoopRoleManager', () => {
  let roleManager;
  let guild;
  let consoleSpy;

  beforeEach(() => {
    // Reset mocks and suppress console.error in tests
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create test guild with roles
    const testRoles = [
      mockRole('ROLE_ID_INITIATE', 1),
      mockRole('ROLE_ID_SEEKER', 2), 
      mockRole('ROLE_ID_WITNESS', 3),
      mockRole('ROLE_ID_ARCHITECT', 4),
      mockRole('ROLE_ID_LIGHTBEARER', 5)
    ];
    
    guild = mockGuild(testRoles);
    roleManager = new LoopRoleManager(guild);
  });

  afterEach(() => {
    // Restore console.error
    consoleSpy.mockRestore();
  });

  describe('getCurrentLoopLevel', () => {
    test('should return correct level for user with single role', async () => {
      const member = mockMember(['ROLE_ID_SEEKER']);
      const level = await roleManager.getCurrentLoopLevel(member);
      expect(level).toBe(2);
    });

    test('should return highest level for user with multiple roles', async () => {
      const member = mockMember(['ROLE_ID_INITIATE', 'ROLE_ID_WITNESS']);
      const level = await roleManager.getCurrentLoopLevel(member);
      expect(level).toBe(3);
    });

    test('should return 1 for user with no loop roles', async () => {
      const member = mockMember([]);
      const level = await roleManager.getCurrentLoopLevel(member);
      expect(level).toBe(1);
    });

    test('should handle errors gracefully', async () => {
      const member = null; // Invalid member
      const level = await roleManager.getCurrentLoopLevel(member);
      expect(level).toBe(1);
    });
  });

  describe('validateRolePermissions', () => {
    test('should validate successful role assignment', async () => {
      const result = await roleManager.validateRolePermissions('ROLE_ID_SEEKER');
      expect(result.valid).toBe(true);
    });

    test('should fail for non-existent role', async () => {
      const result = await roleManager.validateRolePermissions('INVALID_ROLE');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Target role not found');
    });

    test('should fail when bot lacks manage roles permission', async () => {
      guild.members.me.permissions.has.mockReturnValue(false);
      const result = await roleManager.validateRolePermissions('ROLE_ID_SEEKER');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Bot missing Manage Roles permission');
    });

    test('should fail when bot role is too low in hierarchy', async () => {
      guild.members.me.roles.highest.position = 1; // Lower than target role
      const result = await roleManager.validateRolePermissions('ROLE_ID_SEEKER');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Bot role hierarchy insufficient');
    });
  });

  describe('canAscendToNextLevel', () => {
    test('should allow ascension from level 1 to 2', async () => {
      const member = mockMember(['ROLE_ID_INITIATE']);
      const result = await roleManager.canAscendToNextLevel(member);
      expect(result.canAscend).toBe(true);
      expect(result.currentLevel).toBe(1);
      expect(result.nextLevel).toBe(2);
    });

    test('should prevent ascension when at maximum level', async () => {
      const member = mockMember(['ROLE_ID_LIGHTBEARER']);
      const result = await roleManager.canAscendToNextLevel(member);
      expect(result.canAscend).toBe(false);
      expect(result.reason).toBe('Already at maximum level');
    });

    test('should handle errors gracefully and continue with fallback', async () => {
      // Create a member that will cause getCurrentLoopLevel to use fallback
      const invalidMember = {
        roles: {
          cache: {
            has: () => { throw new Error('Role check failed'); }
          }
        }
      };
      
      const result = await roleManager.canAscendToNextLevel(invalidMember);
      // Since getCurrentLoopLevel falls back to 1, canAscend should be true (1 -> 2)
      expect(result.canAscend).toBe(true);
      expect(result.currentLevel).toBe(1);
      expect(result.nextLevel).toBe(2);
    });
  });

  describe('getRoleInfo', () => {
    test('should return correct role info for valid level', () => {
      const roleInfo = roleManager.getRoleInfo(2);
      expect(roleInfo).toEqual({
        level: 2,
        name: 'Seeker',
        roleId: 'ROLE_ID_SEEKER'
      });
    });

    test('should return null for invalid level', () => {
      const roleInfo = roleManager.getRoleInfo(99);
      expect(roleInfo).toBeNull();
    });
  });
});