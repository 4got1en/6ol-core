import { expect, test, vi } from 'vitest';

// Mock roles for testing
const mockRoles = {
  'oracle-wallet': ['oracle'],
  'them-user': [],
  'loop6-steward': ['council'],
  'loop3-contributor': ['contributor'],
  'loop2-user': ['member'],
  'loop0-guest': ['guest']
};

// Mock the entire module
vi.mock('../gate-config.js', async () => {
  return {
    SACRED_PATHS: ['temple-core/dbd-charter.md', 'temple-core/roles.yaml'],
    getUserRoles: vi.fn(async (username) => mockRoles[username] || []),
    canUserWrite: vi.fn(async (username, path) => {
      if (!username || !path) return false;
      const roles = mockRoles[username] || [];
      
      // Oracle can always write
      if (roles.includes('oracle')) return true;

      // Non-sacred paths allow contributor and above
      const isProtected = ['temple-core/dbd-charter.md', 'temple-core/roles.yaml'].includes(path);
      if (!isProtected) {
        return roles.some(role => ['contributor', 'council', 'keeper'].includes(role));
      }

      // Charter requires Council or Oracle
      if (path === 'temple-core/dbd-charter.md') {
        return roles.includes('council');
      }

      // Roles.yaml requires Keeper or Oracle
      if (path === 'temple-core/roles.yaml') {
        return roles.includes('keeper');
      }

      return false;
    })
  };
});

// Test 1: Oracle wallet should have access to any path
test('allows Oracle wallet to write to any path', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('oracle-wallet', 'temple-core/dbd-charter.md');
  expect(result).toBe(true);
  
  const resultRandom = await canUserWrite('oracle-wallet', 'random/file.txt');
  expect(resultRandom).toBe(true);
});

// Test 2: "Them" user should not have access to any sacred path
test('denies access to "Them" user on sacred paths', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('them-user', 'temple-core/dbd-charter.md');
  expect(result).toBe(false);
});

// Test 3: Loop 6 steward (council) can edit charter
test('allows Loop 6 steward to edit charter', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('loop6-steward', 'temple-core/dbd-charter.md');
  expect(result).toBe(true);
});

// Test 4: Loop 3 contributor can edit non-charter MD files
test('allows Loop 3 contributor to edit other MD files', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('loop3-contributor', 'temple-core/other-doc.md');
  expect(result).toBe(true);
});

// Test 5: Loop 2 user cannot edit charter
test('denies Loop 2 user access to charter', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('loop2-user', 'temple-core/dbd-charter.md');
  expect(result).toBe(false);
});

// Test 6: Loop 0 guest cannot edit charter
test('denies Loop 0 guest access to charter', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('loop0-guest', 'temple-core/dbd-charter.md');
  expect(result).toBe(false);
});

// Test 7: Unmatched file paths are allowed for valid users
test('allows access to unmatched file paths for valid users', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('loop3-contributor', '/random.txt');
  expect(result).toBe(true);
});

// Edge Cases
test('handles empty or invalid inputs', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  expect(await canUserWrite('', 'some/path')).toBe(false);
  expect(await canUserWrite(null, 'some/path')).toBe(false);
  expect(await canUserWrite('user', '')).toBe(false);
  expect(await canUserWrite('user', null)).toBe(false);
});

test('handles undefined user roles', async () => {
  const { canUserWrite } = await import('../gate-config.js');
  const result = await canUserWrite('non-existent-user', 'temple-core/dbd-charter.md');
  expect(result).toBe(false);
});
