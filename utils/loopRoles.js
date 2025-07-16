/**
 * loopRoles.js - Role management utilities for 6ol Discord Bot
 * Handles role assignment, hierarchy validation, and permissions
 */

const config = require('../config/bot-config.json');

class LoopRoleManager {
  constructor(guild) {
    this.guild = guild;
    this.config = config;
  }

  /**
   * Get user's current loop level based on roles
   * @param {GuildMember} member Discord guild member
   * @returns {number} Current loop level (1-5)
   */
  async getCurrentLoopLevel(member) {
    try {
      const loops = this.config.loops;
      let currentLevel = 0;

      for (const [level, loopConfig] of Object.entries(loops)) {
        const roleId = this.config.roles[loopConfig.roleKey];
        if (member.roles.cache.has(roleId)) {
          currentLevel = Math.max(currentLevel, parseInt(level));
        }
      }

      return currentLevel || 1; // Default to level 1 if no roles found
    } catch (error) {
      console.error('Error getting current loop level:', error);
      return 1; // Safe fallback
    }
  }

  /**
   * Validate if bot can manage the target role
   * @param {string} roleId Target role ID
   * @returns {Promise<{valid: boolean, reason?: string}>}
   */
  async validateRolePermissions(roleId) {
    try {
      const targetRole = this.guild.roles.cache.get(roleId);
      if (!targetRole) {
        return { valid: false, reason: 'Target role not found' };
      }

      const botMember = this.guild.members.me;
      if (!botMember.permissions.has('MANAGE_ROLES')) {
        return { valid: false, reason: 'Bot missing Manage Roles permission' };
      }

      if (botMember.roles.highest.position <= targetRole.position) {
        return { valid: false, reason: 'Bot role hierarchy insufficient' };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating role permissions:', error);
      return { valid: false, reason: 'Permission validation failed' };
    }
  }

  /**
   * Assign role to user with proper validation
   * @param {GuildMember} member Target member
   * @param {number} targetLevel Target loop level
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async assignLoopRole(member, targetLevel) {
    try {
      const loopConfig = this.config.loops[targetLevel.toString()];
      if (!loopConfig) {
        return { success: false, message: 'Invalid loop level' };
      }

      const roleId = this.config.roles[loopConfig.roleKey];
      const roleValidation = await this.validateRolePermissions(roleId);
      
      if (!roleValidation.valid) {
        return { success: false, message: roleValidation.reason };
      }

      // Remove previous loop roles to prevent conflicts
      await this.removePreviousLoopRoles(member);

      // Add new role
      await member.roles.add(roleId);
      
      return { 
        success: true, 
        message: `Successfully ascended to ${loopConfig.name} (Level ${targetLevel})` 
      };
    } catch (error) {
      console.error('Error assigning loop role:', error);
      return { success: false, message: 'Failed to assign role' };
    }
  }

  /**
   * Remove all previous loop roles from member
   * @param {GuildMember} member Target member
   */
  async removePreviousLoopRoles(member) {
    try {
      const rolesToRemove = [];
      
      for (const [level, loopConfig] of Object.entries(this.config.loops)) {
        const roleId = this.config.roles[loopConfig.roleKey];
        if (member.roles.cache.has(roleId)) {
          rolesToRemove.push(roleId);
        }
      }

      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove);
      }
    } catch (error) {
      console.error('Error removing previous loop roles:', error);
      // Non-fatal error, continue with assignment
    }
  }

  /**
   * Check if user can ascend to next level
   * @param {GuildMember} member Target member
   * @returns {Promise<{canAscend: boolean, currentLevel: number, nextLevel: number, reason?: string}>}
   */
  async canAscendToNextLevel(member) {
    try {
      const currentLevel = await this.getCurrentLoopLevel(member);
      const nextLevel = currentLevel + 1;
      const maxLevel = Math.max(...Object.keys(this.config.loops).map(Number));

      if (nextLevel > maxLevel) {
        return { 
          canAscend: false, 
          currentLevel, 
          nextLevel: currentLevel,
          reason: 'Already at maximum level' 
        };
      }

      // Additional requirements could be checked here
      // (e.g., reflections completed, time requirements, etc.)

      return { canAscend: true, currentLevel, nextLevel };
    } catch (error) {
      console.error('Error checking ascension eligibility:', error);
      return { 
        canAscend: false, 
        currentLevel: 1, 
        nextLevel: 1,
        reason: 'Error checking eligibility' 
      };
    }
  }

  /**
   * Get role information for display
   * @param {number} level Loop level
   * @returns {Object} Role information
   */
  getRoleInfo(level) {
    const loopConfig = this.config.loops[level.toString()];
    if (!loopConfig) return null;

    return {
      level,
      name: loopConfig.name,
      roleId: this.config.roles[loopConfig.roleKey]
    };
  }
}

module.exports = LoopRoleManager;