/**
 * flame-status.test.js - Unit tests for flame-status command
 */

const flameStatusCommand = require('../commands/flame-status');

// Mock dependencies
jest.mock('../utils/loopRoles');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

const LoopRoleManager = require('../utils/loopRoles');
const fs = require('fs');

// Mock Discord interaction
const mockInteraction = (options = {}) => ({
  user: options.user || { id: 'test-user', displayName: 'TestUser', displayAvatarURL: jest.fn().mockReturnValue('avatar-url') },
  member: options.member || { 
    id: 'test-user', 
    displayName: 'TestUser', 
    roles: { 
      cache: {
        some: jest.fn().mockReturnValue(false),
        size: 0
      }
    } 
  },
  guild: options.guild || { id: 'test-guild', members: { fetch: jest.fn() } },
  options: {
    getUser: jest.fn().mockReturnValue(null)
  },
  deferReply: jest.fn().mockResolvedValue(),
  editReply: jest.fn().mockResolvedValue(),
  reply: jest.fn().mockResolvedValue(),
  deferred: true
});

describe('Flame Status Command', () => {
  let interaction;
  let mockRoleManager;

  beforeEach(() => {
    interaction = mockInteraction();
    mockRoleManager = {
      getCurrentLoopLevel: jest.fn(),
      getRoleInfo: jest.fn()
    };
    LoopRoleManager.mockImplementation(() => mockRoleManager);
    
    // Reset mocks
    fs.promises.readFile.mockClear();
    interaction.guild.members.fetch.mockResolvedValue(interaction.member);
  });

  describe('Command Structure', () => {
    test('should have required data property', () => {
      expect(flameStatusCommand.data).toBeDefined();
      expect(flameStatusCommand.data.name).toBe('flame-status');
    });

    test('should have execute function', () => {
      expect(typeof flameStatusCommand.execute).toBe('function');
    });
  });

  describe('Status Display', () => {
    test('should display user flame status successfully', async () => {
      // Mock successful responses
      mockRoleManager.getCurrentLoopLevel.mockResolvedValue(2);
      mockRoleManager.getRoleInfo.mockReturnValue({
        level: 2,
        name: 'Seeker',
        roleId: 'test-role-id'
      });

      // Mock file reads
      fs.promises.readFile.mockImplementation((path) => {
        if (path.includes('flame-roles.json')) {
          return Promise.resolve(JSON.stringify({
            flameRoles: {
              seekerFlame: {
                name: 'Seeker Flame',
                color: '#FFD700',
                description: 'Golden flame of curiosity'
              }
            }
          }));
        }
        return Promise.resolve('{}');
      });

      await flameStatusCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: expect.stringContaining('Flame Status')
              })
            })
          ])
        })
      );
    });

    test('should handle errors gracefully', async () => {
      mockRoleManager.getCurrentLoopLevel.mockRejectedValue(new Error('Test error'));

      await flameStatusCommand.execute(interaction);

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