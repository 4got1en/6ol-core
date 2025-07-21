/**
 * ascend.test.js - Unit tests for ascend command
 */

const ascendCommand = require('../commands/ascend');

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
  member: options.member || { id: 'test-user', displayName: 'TestUser' },
  guild: options.guild || { id: 'test-guild' },
  deferReply: jest.fn().mockResolvedValue(),
  editReply: jest.fn().mockResolvedValue(),
  reply: jest.fn().mockResolvedValue(),
  deferred: true
});

describe('Ascend Command', () => {
  let interaction;
  let mockRoleManager;
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    interaction = mockInteraction();
    
    // Mock LoopRoleManager
    mockRoleManager = {
      canAscendToNextLevel: jest.fn(),
      assignLoopRole: jest.fn(),
      getRoleInfo: jest.fn()
    };
    
    LoopRoleManager.mockImplementation(() => mockRoleManager);
    
    // Mock flame data
    fs.promises.readFile.mockResolvedValue(JSON.stringify({
      flames: {
        '2': {
          title: 'Test Flame',
          element: 'test',
          essence: 'test-essence',
          invocation: 'Test invocation'
        }
      }
    }));
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Successful Ascension', () => {
    test('should handle successful ascension', async () => {
      mockRoleManager.canAscendToNextLevel.mockResolvedValue({
        canAscend: true,
        currentLevel: 1,
        nextLevel: 2
      });
      
      mockRoleManager.assignLoopRole.mockResolvedValue({
        success: true,
        message: 'Success'
      });
      
      mockRoleManager.getRoleInfo.mockReturnValue({
        level: 2,
        name: 'Seeker',
        roleId: 'test-role-id'
      });

      await ascendCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalled();
      expect(mockRoleManager.canAscendToNextLevel).toHaveBeenCalledWith(interaction.member);
      expect(mockRoleManager.assignLoopRole).toHaveBeenCalledWith(interaction.member, 2);
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '🌟 Ascension Complete'
              })
            })
          ])
        })
      );
    });
  });

  describe('Failed Ascension', () => {
    test('should handle ascension requirement not met', async () => {
      mockRoleManager.canAscendToNextLevel.mockResolvedValue({
        canAscend: false,
        currentLevel: 5,
        nextLevel: 5,
        reason: 'Already at maximum level'
      });

      await ascendCommand.execute(interaction);

      expect(interaction.deferReply).toHaveBeenCalled();
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '❌ Cannot Ascend'
              })
            })
          ])
        })
      );
    });

    test('should handle role assignment failure', async () => {
      mockRoleManager.canAscendToNextLevel.mockResolvedValue({
        canAscend: true,
        currentLevel: 1,
        nextLevel: 2
      });
      
      mockRoleManager.assignLoopRole.mockResolvedValue({
        success: false,
        message: 'Permission denied'
      });

      await ascendCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '❌ Ascension Failed'
              })
            })
          ])
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      mockRoleManager.canAscendToNextLevel.mockRejectedValue(new Error('Test error'));
      interaction.deferred = true; // Mark as deferred

      await ascendCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '❌ Command Error'
              })
            })
          ])
        })
      );
    });

    test('should handle flame data loading failure gracefully', async () => {
      fs.promises.readFile.mockRejectedValue(new Error('File not found'));
      
      mockRoleManager.canAscendToNextLevel.mockResolvedValue({
        canAscend: true,
        currentLevel: 1,
        nextLevel: 2
      });
      
      mockRoleManager.assignLoopRole.mockResolvedValue({
        success: true,
        message: 'Success'
      });
      
      mockRoleManager.getRoleInfo.mockReturnValue({
        level: 2,
        name: 'Seeker',
        roleId: 'test-role-id'
      });

      await ascendCommand.execute(interaction);

      // Should still succeed but without flame data
      expect(interaction.editReply).toHaveBeenCalledWith(
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              data: expect.objectContaining({
                title: '🌟 Ascension Complete'
              })
            })
          ])
        })
      );
    });
  });

  describe('Command Structure', () => {
    test('should have correct command data', () => {
      expect(ascendCommand.data).toBeDefined();
      expect(ascendCommand.data.name).toBe('ascend');
      expect(ascendCommand.data.description).toBe('Ascend to the next loop level after completing requirements');
    });

    test('should have execute function', () => {
      expect(typeof ascendCommand.execute).toBe('function');
    });
  });
});