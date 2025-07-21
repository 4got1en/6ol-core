/**
 * assign-role.test.js - Unit tests for assign-role command
 */

const assignRoleCommand = require('../commands/assign-role');

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

const fs = require('fs');

// Mock Discord interaction
const mockInteraction = (options = {}) => ({
  user: options.user || { id: 'admin-user' },
  member: options.member || { 
    id: 'admin-user', 
    displayName: 'AdminUser',
    permissions: { has: jest.fn().mockReturnValue(true) },
    roles: { 
      cache: {
        some: jest.fn().mockReturnValue(false)
      }
    }
  },
  guild: options.guild || { 
    id: 'test-guild',
    members: { 
      fetch: jest.fn(),
      me: {
        permissions: { has: jest.fn().mockReturnValue(true) },
        roles: { highest: { position: 10 } }
      }
    },
    roles: {
      cache: {
        find: jest.fn(),
      },
      create: jest.fn()
    }
  },
  options: {
    getUser: jest.fn(),
    getString: jest.fn(),
    getBoolean: jest.fn().mockReturnValue(false)
  },
  deferReply: jest.fn().mockResolvedValue(),
  editReply: jest.fn().mockResolvedValue(),
  reply: jest.fn().mockResolvedValue(),
  deferred: true
});

describe('Assign Role Command', () => {
  let interaction;

  beforeEach(() => {
    interaction = mockInteraction();
    
    // Reset mocks
    fs.promises.readFile.mockClear();
    
    // Default successful responses
    interaction.options.getUser.mockReturnValue({ id: 'target-user' });
    interaction.options.getString.mockReturnValue('seekerFlame');
    interaction.guild.members.fetch.mockResolvedValue({
      id: 'target-user',
      displayName: 'TargetUser',
      roles: {
        cache: {
          has: jest.fn().mockReturnValue(false),
          filter: jest.fn().mockReturnValue({ size: 0 })
        },
        add: jest.fn().mockResolvedValue(),
        remove: jest.fn().mockResolvedValue()
      }
    });
  });

  describe('Command Structure', () => {
    test('should have required data property', () => {
      expect(assignRoleCommand.data).toBeDefined();
      expect(assignRoleCommand.data.name).toBe('assign-role');
    });

    test('should have execute function', () => {
      expect(typeof assignRoleCommand.execute).toBe('function');
    });
  });

  describe('Permission Validation', () => {
    test('should deny access to non-admin users', async () => {
      interaction.member.permissions.has.mockReturnValue(false);
      
      await assignRoleCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: expect.stringContaining('Access Denied')
              })
            })
          ])
        })
      );
    });

    test('should allow access to admin users', async () => {
      // Mock flame config
      fs.promises.readFile.mockResolvedValue(JSON.stringify({
        flameRoles: {
          seekerFlame: {
            name: 'Seeker Flame',
            color: '#FFD700',
            loop: 1,
            permissions: ['VIEW_CHANNEL']
          }
        }
      }));

      // Mock role creation
      interaction.guild.roles.cache.find.mockReturnValue(null);
      interaction.guild.roles.create.mockResolvedValue({
        id: 'new-role-id',
        name: 'Seeker Flame',
        position: 5
      });

      await assignRoleCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: expect.stringContaining('Flame Role Assigned')
              })
            })
          ])
        })
      );
    });
  });

  describe('Role Assignment', () => {
    test('should handle role creation when role does not exist', async () => {
      // Mock flame config
      fs.promises.readFile.mockResolvedValue(JSON.stringify({
        flameRoles: {
          seekerFlame: {
            name: 'Seeker Flame',
            color: '#FFD700',
            loop: 1,
            permissions: ['VIEW_CHANNEL']
          }
        }
      }));

      interaction.guild.roles.cache.find.mockReturnValue(null);
      interaction.guild.roles.create.mockResolvedValue({
        id: 'new-role-id',
        name: 'Seeker Flame',
        position: 5
      });

      await assignRoleCommand.execute(interaction);

      expect(interaction.guild.roles.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Seeker Flame',
          color: '#FFD700',
          reason: expect.any(String)
        })
      );
    });

    test('should handle errors gracefully', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('Config not found'));

      await assignRoleCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: expect.stringContaining('Error')
              })
            })
          ])
        })
      );
    });
  });
});