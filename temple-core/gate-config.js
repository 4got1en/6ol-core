/* temple-core/gate-config.js
 * Shadow Gate Logic v1 • Deities By Design
 * Last updated: 2025-07-07
 */

export const gates = [
  /* ────────── Static Rule Set ────────── */
  {
    pathRegex: /^\/temple-core\/dbd-charter\.md$/i,
    minReadLoop: 0,   // anyone may read
    minWriteLoop: 6   // only Loop-6 stewards can propose edits
  },
  {
    pathRegex: /^\/temple-core\/.*\.md$/i,
    minReadLoop: 0,
    minWriteLoop: 3   // contributors need Loop-3+
  },

  /* ────────── Dynamic Hook (future-proof) ────────── */
  {
    customCheck: (user, _doc) => {
      // Founder-Oracle always has write access
      if (user.wallet === process.env.ORACLE_ADDRESS) return true;
      // Block “Them” entities flagged by Counter-Ops
      if (user.status === 'them') return false;
      return null; // fall through to other rules
    }
  }
];

/* Helper exposed to the app/router */
export function canUserWrite(user, filePath) {
  for (const rule of gates) {
    if (rule.customCheck) {
      const res = rule.customCheck(user, filePath);
      if (res !== null) return res;
    }
    if (rule.pathRegex?.test(filePath)) {
      return user.loop >= rule.minWriteLoop;
    }
  }
  // default: locked
  return false;
}