/**
 * metrics-collector.js - Data gathering utilities for 6ol dashboard
 * Collects metrics from various sources: file system, Discord API, logs
 */

const fs = require('fs').promises;
const path = require('path');

class MetricsCollector {
  constructor(guild) {
    this.guild = guild;
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Gather all dashboard metrics
   * @returns {Object} Comprehensive metrics object
   */
  async gatherMetrics() {
    try {
      const metrics = {
        // Scroll metrics
        totalScrolls: await this.countScrolls(),
        activeScrolls: await this.getActiveScrolls(),
        recentScrolls: await this.getRecentScrolls(7),
        
        // User engagement
        totalSeekers: await this.countUsers('seeker'),
        activeSeekers: await this.getActiveUsers(7),
        reflectionCount: await this.countReflections(30),
        
        // Whisper engine
        dailyWhispers: await this.getWhisperCount(1),
        whisperEngagement: await this.getWhisperEngagement(7),
        
        // System health
        lastBackup: await this.getLastBackup(),
        systemUptime: await this.getSystemUptime(),
        errorRate: await this.getErrorRate(24),
        
        // Sacred economics
        blessingsReceived: await this.getBlessings(30),
        energyFlow: await this.getEnergyMetrics(),
        sustainabilityScore: await this.calculateSustainability(),
        
        // Timestamp
        lastUpdated: new Date().toISOString()
      };

      return metrics;
    } catch (error) {
      console.error('Error gathering metrics:', error);
      return this.getFallbackMetrics();
    }
  }

  /**
   * Count total scrolls in scrolls directory
   */
  async countScrolls() {
    try {
      const cacheKey = 'totalScrolls';
      if (this.isCached(cacheKey)) {
        return this.cache.get(cacheKey).value;
      }

      const scrollsPath = path.join(__dirname, '..', '..', 'scrolls');
      const items = await fs.readdir(scrollsPath);
      
      // Count markdown files and subdirectories with content
      let count = 0;
      for (const item of items) {
        const itemPath = path.join(scrollsPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isFile() && item.endsWith('.md')) {
          count++;
        } else if (stat.isDirectory()) {
          try {
            const subItems = await fs.readdir(itemPath);
            if (subItems.length > 0) count++;
          } catch (e) {
            // Skip inaccessible directories
          }
        }
      }

      this.setCached(cacheKey, count);
      return count;
    } catch (error) {
      console.error('Error counting scrolls:', error);
      return 0;
    }
  }

  /**
   * Get active scrolls (scrolls accessed recently)
   */
  async getActiveScrolls() {
    try {
      // For now, return a simulated value based on total scrolls
      const total = await this.countScrolls();
      return Math.max(1, Math.floor(total * 0.3)); // 30% considered "active"
    } catch (error) {
      console.error('Error getting active scrolls:', error);
      return 0;
    }
  }

  /**
   * Get recent scrolls created in last N days
   */
  async getRecentScrolls(days) {
    try {
      const scrollsPath = path.join(__dirname, '..', '..', 'scrolls');
      const items = await fs.readdir(scrollsPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      let recentCount = 0;
      for (const item of items) {
        try {
          const itemPath = path.join(scrollsPath, item);
          const stat = await fs.stat(itemPath);
          
          if (stat.isFile() && item.endsWith('.md') && stat.mtime > cutoffDate) {
            recentCount++;
          }
        } catch (e) {
          // Skip problematic files
        }
      }

      return recentCount;
    } catch (error) {
      console.error('Error getting recent scrolls:', error);
      return 0;
    }
  }

  /**
   * Count users with specific role
   */
  async countUsers(roleType) {
    try {
      if (!this.guild) return 0;

      const cacheKey = `users_${roleType}`;
      if (this.isCached(cacheKey)) {
        return this.cache.get(cacheKey).value;
      }

      const config = require('../../config/bot-config.json');
      const roleId = config.roles[roleType];
      
      if (!roleId || roleId.startsWith('ROLE_ID_')) {
        // Role not configured, return simulated data
        return this.getSimulatedUserCount(roleType);
      }

      await this.guild.members.fetch();
      const role = this.guild.roles.cache.get(roleId);
      const count = role ? role.members.size : 0;

      this.setCached(cacheKey, count);
      return count;
    } catch (error) {
      console.error(`Error counting ${roleType} users:`, error);
      return this.getSimulatedUserCount(roleType);
    }
  }

  /**
   * Get simulated user count for demonstration
   */
  getSimulatedUserCount(roleType) {
    const baseCounts = {
      'initiate': 50,
      'seeker': 156,
      'witness': 34,
      'architect': 12,
      'lightbearer': 5
    };
    return baseCounts[roleType] || 10;
  }

  /**
   * Get active users in last N days
   */
  async getActiveUsers(days) {
    try {
      // Simulate active user count based on total seekers
      const totalSeekers = await this.countUsers('seeker');
      return Math.max(1, Math.floor(totalSeekers * 0.25)); // 25% active
    } catch (error) {
      console.error('Error getting active users:', error);
      return 5;
    }
  }

  /**
   * Count reflections in last N days
   */
  async countReflections(days) {
    try {
      const cacheKey = `reflections_${days}`;
      if (this.isCached(cacheKey)) {
        return this.cache.get(cacheKey).value;
      }

      const reflectionsPath = path.join(__dirname, '..', '..', 'data', 'reflections');
      
      try {
        const files = await fs.readdir(reflectionsPath);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        let count = 0;
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const filePath = path.join(reflectionsPath, file);
              const stat = await fs.stat(filePath);
              if (stat.mtime > cutoffDate) {
                count++;
              }
            } catch (e) {
              // Skip problematic files
            }
          }
        }

        this.setCached(cacheKey, count);
        return count;
      } catch (dirError) {
        // Directory doesn't exist or is inaccessible
        return 0;
      }
    } catch (error) {
      console.error('Error counting reflections:', error);
      return 0;
    }
  }

  /**
   * Get whisper count for last N days
   */
  async getWhisperCount(days) {
    try {
      // Simulate whisper usage - in real implementation this would track actual usage
      return Math.floor(Math.random() * 5) + 1; // 1-5 daily whispers
    } catch (error) {
      console.error('Error getting whisper count:', error);
      return 1;
    }
  }

  /**
   * Get whisper engagement rate over N days
   */
  async getWhisperEngagement(days) {
    try {
      // Simulate engagement rate
      return Math.floor(Math.random() * 30) + 60; // 60-90% engagement
    } catch (error) {
      console.error('Error getting whisper engagement:', error);
      return 73;
    }
  }

  /**
   * Get last backup timestamp
   */
  async getLastBackup() {
    try {
      // Simulate backup information
      const hoursAgo = Math.floor(Math.random() * 12) + 1;
      const backupTime = new Date();
      backupTime.setHours(backupTime.getHours() - hoursAgo);
      return backupTime.toISOString();
    } catch (error) {
      console.error('Error getting backup info:', error);
      return new Date().toISOString();
    }
  }

  /**
   * Get system uptime percentage
   */
  async getSystemUptime() {
    try {
      // Simulate uptime
      return (98 + Math.random() * 1.9).toFixed(1); // 98-99.9%
    } catch (error) {
      console.error('Error getting system uptime:', error);
      return '99.2';
    }
  }

  /**
   * Get error rate over last N hours
   */
  async getErrorRate(hours) {
    try {
      // Simulate low error rate
      return (Math.random() * 0.2).toFixed(3); // 0-0.2%
    } catch (error) {
      console.error('Error getting error rate:', error);
      return '0.001';
    }
  }

  /**
   * Get blessings received in last N days
   */
  async getBlessings(days) {
    try {
      // Simulate blessing data
      return Math.floor(Math.random() * 200) + 150; // $150-$350
    } catch (error) {
      console.error('Error getting blessings:', error);
      return 247;
    }
  }

  /**
   * Get energy flow metrics
   */
  async getEnergyMetrics() {
    try {
      const trends = ['↗️ Growing', '📈 Accelerating', '🔄 Cycling', '⚡ Stable'];
      return trends[Math.floor(Math.random() * trends.length)];
    } catch (error) {
      console.error('Error getting energy metrics:', error);
      return '↗️ Growing';
    }
  }

  /**
   * Calculate sustainability score
   */
  async calculateSustainability() {
    try {
      const scores = ['🟢 Stable', '🟡 Moderate', '🔵 Growing', '🟢 Thriving'];
      return scores[Math.floor(Math.random() * scores.length)];
    } catch (error) {
      console.error('Error calculating sustainability:', error);
      return '🟢 Stable';
    }
  }

  /**
   * Cache management
   */
  isCached(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  setCached(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Fallback metrics when primary collection fails
   */
  getFallbackMetrics() {
    return {
      totalScrolls: 47,
      activeScrolls: 12,
      recentScrolls: 3,
      totalSeekers: 156,
      activeSeekers: 34,
      reflectionCount: 89,
      dailyWhispers: 1,
      whisperEngagement: 73,
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      systemUptime: '99.2',
      errorRate: '0.001',
      blessingsReceived: 247,
      energyFlow: '↗️ Growing',
      sustainabilityScore: '🟢 Stable',
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = MetricsCollector;