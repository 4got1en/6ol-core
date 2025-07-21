/**
 * reset-roles.test.js - Tests for reset-roles command
 */

const resetRolesCommand = require('../commands/reset-roles.js');

describe('Reset Roles Command', () => {
  describe('Command Structure', () => {
    test('should have required data property', () => {
      expect(resetRolesCommand.data).toBeDefined();
      expect(resetRolesCommand.data.name).toBe('reset-roles');
      expect(resetRolesCommand.data.description).toContain('flame roles');
    });

    test('should have execute function', () => {
      expect(typeof resetRolesCommand.execute).toBe('function');
    });
  });

  describe('Command Validation', () => {
    test('should be loadable without errors', () => {
      expect(() => {
        const command = require('../commands/reset-roles.js');
        expect(command).toHaveProperty('data');
        expect(command).toHaveProperty('execute');
      }).not.toThrow();
    });

    test('should have proper command name format', () => {
      expect(resetRolesCommand.data.name).toMatch(/^[a-z-]+$/);
      expect(resetRolesCommand.data.name.length).toBeGreaterThan(0);
      expect(resetRolesCommand.data.name.length).toBeLessThanOrEqual(32);
    });

    test('should have proper description format', () => {
      expect(resetRolesCommand.data.description).toBeDefined();
      expect(resetRolesCommand.data.description.length).toBeGreaterThan(0);
      expect(resetRolesCommand.data.description.length).toBeLessThanOrEqual(100);
    });
  });
});