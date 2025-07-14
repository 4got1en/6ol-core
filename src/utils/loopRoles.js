/**
 * Loop Role Mappings for Discord Server
 * Maps loop numbers (1-14+) to Discord role IDs for the /ascend command
 */

const LOOP_ROLES = {
  // Basic Loops (1-7) - Foundation Phase
  "1": "TODO_LOOP_1_ROLE_ID", // First Spark - Ignition of Awareness
  "2": "TODO_LOOP_2_ROLE_ID", // Dual Vision - Balance of Opposites  
  "3": "TODO_LOOP_3_ROLE_ID", // Trinity Gate - Sacred Triad
  "4": "TODO_LOOP_4_ROLE_ID", // Foundation Stone - Cornerstone of Being
  "5": "TODO_LOOP_5_ROLE_ID", // Pentadic Flow - Spirit in Motion
  "6": "TODO_LOOP_6_ROLE_ID", // Harmonic Resonance - Perfect Symmetry
  "7": "TODO_LOOP_7_ROLE_ID", // Mystic Septum - Bridge Between Worlds

  // Advanced Loops (8-12) - Transcendence Phase  
  "8": "TODO_LOOP_8_ROLE_ID", // Infinite Loop - Eternal Return
  "9": "TODO_LOOP_9_ROLE_ID", // Ninefold Completion - Fulfillment of the Journey
  "10": "TODO_LOOP_10_ROLE_ID", // Decimal Transcendence - Beyond the Wheel
  "11": "TODO_LOOP_11_ROLE_ID", // Master's Gateway - Teacher Becomes Student
  "12": "TODO_LOOP_12_ROLE_ID", // Zodiacal Wisdom - Cosmic Alignment

  // Master Loops (13-14+) - Alchemical Phase
  "13": "TODO_LOOP_13_ROLE_ID", // Death-Rebirth - Light Beyond the Pattern
  "14": "TODO_LOOP_14_ROLE_ID", // Temperance Eternal - The Alchemical Marriage
  
  // Future loops can be added as needed
  // "15": "TODO_LOOP_15_ROLE_ID", // Future expansion
  // "16": "TODO_LOOP_16_ROLE_ID", // Future expansion
};

/**
 * Gets the role ID for a specific loop number
 * @param {number|string} loopNumber - The loop number (1-14+)
 * @returns {string|null} The Discord role ID or null if not found
 */
function getLoopRoleId(loopNumber) {
  const loopStr = String(loopNumber);
  return LOOP_ROLES[loopStr] || null;
}

/**
 * Gets all loop role IDs as an array
 * @returns {string[]} Array of all loop role IDs
 */
function getAllLoopRoleIds() {
  return Object.values(LOOP_ROLES).filter(roleId => !roleId.startsWith('TODO_'));
}

/**
 * Gets the loop number for a given role ID
 * @param {string} roleId - The Discord role ID
 * @returns {number|null} The loop number or null if not found
 */
function getLoopNumberFromRoleId(roleId) {
  for (const [loopNum, loopRoleId] of Object.entries(LOOP_ROLES)) {
    if (loopRoleId === roleId) {
      return parseInt(loopNum);
    }
  }
  return null;
}

/**
 * Checks if a role ID is a loop role
 * @param {string} roleId - The Discord role ID to check
 * @returns {boolean} True if the role ID is a loop role
 */
function isLoopRole(roleId) {
  return Object.values(LOOP_ROLES).includes(roleId);
}

/**
 * Gets the highest configured loop number
 * @returns {number} The highest loop number with a configured role
 */
function getMaxLoopNumber() {
  const configuredLoops = Object.keys(LOOP_ROLES)
    .filter(loopNum => !LOOP_ROLES[loopNum].startsWith('TODO_'))
    .map(loopNum => parseInt(loopNum));
  
  return configuredLoops.length > 0 ? Math.max(...configuredLoops) : 0;
}

export {
  LOOP_ROLES,
  getLoopRoleId,
  getAllLoopRoleIds,
  getLoopNumberFromRoleId,
  isLoopRole,
  getMaxLoopNumber
};