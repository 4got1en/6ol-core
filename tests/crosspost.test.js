// Test for crosspost functionality
jest.mock('discord.js', () => ({
  Events: { MessageCreate: 'messageCreate' },
  ChannelType: { GuildAnnouncement: 10, GuildText: 0 },
  PermissionsBitField: { Flags: { ManageMessages: '8192' } }
}));

describe('Crosspost Module', () => {
  let mockClient;
  let crosspostModule;
  let eventHandler;

  beforeEach(() => {
    mockClient = {
      user: { id: 'bot-123' },
      on: jest.fn((event, handler) => {
        if (event === 'messageCreate') {
          eventHandler = handler;
        }
      })
    };
    crosspostModule = require('../crosspost.js');
    crosspostModule(mockClient);
  });

  test('should register MessageCreate event listener', () => {
    expect(mockClient.on).toHaveBeenCalledWith('messageCreate', expect.any(Function));
  });

  test('should crosspost message in announcement channel from bot', async () => {
    const mockMessage = {
      channel: { type: 10 }, // GuildAnnouncement
      author: { id: 'bot-123' },
      member: {
        permissionsIn: jest.fn().mockReturnValue({
          has: jest.fn().mockReturnValue(false)
        })
      },
      id: 'msg-123',
      crosspost: jest.fn().mockResolvedValue()
    };

    await eventHandler(mockMessage);
    expect(mockMessage.crosspost).toHaveBeenCalled();
  });

  test('should crosspost message from user with manage messages permission', async () => {
    const mockMessage = {
      channel: { type: 10 }, // GuildAnnouncement
      author: { id: 'user-456' },
      member: {
        permissionsIn: jest.fn().mockReturnValue({
          has: jest.fn().mockReturnValue(true)
        })
      },
      id: 'msg-456',
      crosspost: jest.fn().mockResolvedValue()
    };

    await eventHandler(mockMessage);
    expect(mockMessage.crosspost).toHaveBeenCalled();
  });

  test('should not crosspost message from regular user without permissions', async () => {
    const mockMessage = {
      channel: { type: 10 }, // GuildAnnouncement
      author: { id: 'user-789' },
      member: {
        permissionsIn: jest.fn().mockReturnValue({
          has: jest.fn().mockReturnValue(false)
        })
      },
      id: 'msg-789',
      crosspost: jest.fn().mockResolvedValue()
    };

    await eventHandler(mockMessage);
    expect(mockMessage.crosspost).not.toHaveBeenCalled();
  });

  test('should not crosspost message in non-announcement channel', async () => {
    const mockMessage = {
      channel: { type: 0 }, // GuildText
      author: { id: 'bot-123' },
      member: {
        permissionsIn: jest.fn().mockReturnValue({
          has: jest.fn().mockReturnValue(false)
        })
      },
      id: 'msg-123',
      crosspost: jest.fn().mockResolvedValue()
    };

    await eventHandler(mockMessage);
    expect(mockMessage.crosspost).not.toHaveBeenCalled();
  });

  test('should handle crosspost errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockMessage = {
      channel: { type: 10 }, // GuildAnnouncement
      author: { id: 'bot-123' },
      member: {
        permissionsIn: jest.fn().mockReturnValue({
          has: jest.fn().mockReturnValue(false)
        })
      },
      id: 'msg-123',
      crosspost: jest.fn().mockRejectedValue(new Error('Crosspost failed'))
    };

    await eventHandler(mockMessage);
    expect(consoleSpy).toHaveBeenCalledWith('[auto-crosspost] Failed to crosspost:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});