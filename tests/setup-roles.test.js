/**
 * setup-roles.test.js - Unit tests for setup-roles command
 */

const setupRolesCommand = require('../commands/setup-roles');

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
    permissions: { has: jest.fn().mockReturnValue(true) }
  },
  guild: options.guild || { 
    id: 'test-guild',
    roles: {
      cache: {
        find: jest.fn(),
      },
      create: jest.fn()
    }
  },
  options: {
    getBoolean: jest.fn().mockReturnValue(false)
  },
  deferReply: jest.fn().mockResolvedValue(),
  editReply: jest.fn().mockResolvedValue(),
  reply: jest.fn().mockResolvedValue(),
  deferred: true
});

describe('Setup Roles Command', () => {
  let interaction;

  beforeEach(() => {
    interaction = mockInteraction();
    
    // Reset mocks
    fs.promises.readFile.mockClear();
  });

  describe('Command Structure', () => {
    test('should have required data property', () => {
      expect(setupRolesCommand.data).toBeDefined();
      expect(setupRolesCommand.data.name).toBe('setup-roles');
    });

    test('should have execute function', () => {
      expect(typeof setupRolesCommand.execute).toBe('function');
    });
  });

  describe('Permission Validation', () => {
    test('should deny access to non-admin users', async () => {
      interaction.member.permissions.has.mockReturnValue(false);
      
      await setupRolesCommand.execute(interaction);

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

      interaction.guild.roles.cache.find.mockReturnValue(null);
      interaction.guild.roles.create.mockResolvedValue({
        id: 'new-role-id',
        name: 'Seeker Flame'
      });

      await setupRolesCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: expect.stringContaining('Flame Roles Setup Complete')
              })
            })
          ])
        })
      );
    });
  });

  describe('Role Setup', () => {
    test('should create new roles when they do not exist', async () => {
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
        name: 'Seeker Flame'
      });

      await setupRolesCommand.execute(interaction);

      expect(interaction.guild.roles.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Seeker Flame',
          color: '#FFD700',
          reason: expect.any(String)
        })
      );
    });

    test('should handle config loading errors', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('Config not found'));

      await setupRolesCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: expect.stringContaining('Configuration Error')
              })
            })
          ])
        })
      );
    });

    test('should handle role creation errors gracefully', async () => {
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
      interaction.guild.roles.create.mockRejectedValue(new Error('Permission denied'));

      await setupRolesCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                description: expect.stringContaining('Errors')
              })
            })
          ])
        })
      );
    });
  });
});