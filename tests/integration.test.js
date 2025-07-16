/**
 * integration.test.js - Integration tests for bot functionality
 */

const fs = require('fs');
const path = require('path');

describe('Bot Integration', () => {
  test('should load all command files without errors', () => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    expect(commandFiles.length).toBeGreaterThan(0);

    commandFiles.forEach(file => {
      const filePath = path.join(commandsPath, file);
      expect(() => {
        const command = require(filePath);
        expect(command).toHaveProperty('data');
        expect(command).toHaveProperty('execute');
        expect(typeof command.execute).toBe('function');
      }).not.toThrow();
    });
  });

  test('should have unique command names', () => {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    const commandNames = commandFiles.map(file => {
      const command = require(path.join(commandsPath, file));
      return command.data.name;
    });

    const uniqueNames = [...new Set(commandNames)];
    expect(uniqueNames.length).toBe(commandNames.length);
  });

  test('should load bot configuration without errors', () => {
    expect(() => {
      const config = require('../config/bot-config.json');
      expect(config).toHaveProperty('roles');
      expect(config).toHaveProperty('channels');
      expect(config).toHaveProperty('loops');
    }).not.toThrow();
  });

  test('should load flame data without errors', () => {
    expect(() => {
      const flameData = require('../data/flameData.json');
      expect(flameData).toHaveProperty('flames');
    }).not.toThrow();
  });

  test('should have all expected commands', () => {
    const expectedCommands = ['ascend', 'reflect', 'whisper'];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    const actualCommands = commandFiles.map(file => {
      const command = require(path.join(commandsPath, file));
      return command.data.name;
    });

    expectedCommands.forEach(expectedCmd => {
      expect(actualCommands).toContain(expectedCmd);
    });
  });
});