/*  whisperEngine.js  · v1.0
    Loop-aware scroll delivery engine for 6ol Core Hub.
    Handles per-loop memory, shadow scrolls, and delivery state tracking.
    ────────────────────────────────────────────────────────────────── */

(() => {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════
  
  const CONFIG = {
    STORAGE_KEY: '6ol_whisper_user_id',
    CACHE_PATH: './data/scrollCache.json',
    SCROLLS_PATH: './scrolls/',
    SHADOW_PATH: './scrolls/shadow/',
    LOOP_STORAGE_KEY: '6ol_loop_level',
    DEBUG: true
  };

  const SCROLL_INVENTORY = {
    regular: {
      1: ['daylight'],
      2: ['nightvision'],
      3: ['shadowdepth']
    },
    shadow: {
      3: ['forbidden-truth', 'shadow-mastery']
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  const log = (...args) => CONFIG.DEBUG && console.log('[WhisperEngine]', ...args);
  const warn = (...args) => console.warn('[WhisperEngine]', ...args);
  const error = (...args) => console.error('[WhisperEngine]', ...args);

  const uuid = () => crypto.randomUUID();
  const nowISO = () => new Date().toISOString();

  // Generate or retrieve user ID
  function getUserId() {
    let userId = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!userId) {
      userId = uuid();
      localStorage.setItem(CONFIG.STORAGE_KEY, userId);
      log('Generated new user ID:', userId);
    }
    return userId;
  }

  // Get current loop level from existing loop-engine
  function getCurrentLoop() {
    return Number(localStorage.getItem(CONFIG.LOOP_STORAGE_KEY) || 0);
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  class ScrollCache {
    constructor() {
      this.cache = null;
      this.isLoaded = false;
    }

    async load() {
      try {
        // In a real implementation, this would fetch from a server
        // For now, we'll simulate with localStorage as a fallback
        const localCache = localStorage.getItem('whisper_scroll_cache');
        if (localCache) {
          this.cache = JSON.parse(localCache);
        } else {
          // Initialize default cache structure
          this.cache = this.getDefaultCache();
          await this.save();
        }
        this.isLoaded = true;
        log('Cache loaded successfully');
      } catch (err) {
        error('Failed to load cache:', err);
        this.cache = this.getDefaultCache();
        this.isLoaded = true;
      }
    }

    async save() {
      try {
        // In production, this would save to server/file system
        // For now, using localStorage as simulation
        localStorage.setItem('whisper_scroll_cache', JSON.stringify(this.cache));
        log('Cache saved successfully');
      } catch (err) {
        error('Failed to save cache:', err);
      }
    }

    getDefaultCache() {
      return {
        _meta: {
          version: "1.0.0",
          description: "Whisper Engine scroll delivery cache",
          lastReset: nowISO(),
          globalStats: {
            totalUsers: 0,
            scrollsDelivered: 0,
            shadowScrollsDelivered: 0
          }
        },
        users: {},
        scrollInventory: SCROLL_INVENTORY
      };
    }

    ensureUser(userId) {
      if (!this.cache.users[userId]) {
        this.cache.users[userId] = {
          userId,
          currentLoop: getCurrentLoop(),
          createdAt: nowISO(),
          lastActivity: nowISO(),
          loopProgress: {
            1: {
              availableScrolls: [...SCROLL_INVENTORY.regular[1]],
              deliveredScrolls: [],
              completed: false,
              resetAt: null
            },
            2: {
              availableScrolls: [...SCROLL_INVENTORY.regular[2]],
              deliveredScrolls: [],
              completed: false,
              resetAt: null
            },
            3: {
              availableScrolls: [...SCROLL_INVENTORY.regular[3]],
              deliveredScrolls: [],
              completed: false,
              resetAt: null,
              shadowScrolls: {
                availableScrolls: [...SCROLL_INVENTORY.shadow[3]],
                deliveredScrolls: [],
                completed: false
              }
            }
          },
          preferences: {
            enableShadowScrolls: true,
            deliveryInterval: "daily"
          }
        };
        this.cache._meta.globalStats.totalUsers++;
        log('Created new user profile:', userId);
      }
      
      // Update last activity and current loop
      this.cache.users[userId].lastActivity = nowISO();
      this.cache.users[userId].currentLoop = getCurrentLoop();
    }

    resetLoopProgress(userId, loop) {
      const user = this.cache.users[userId];
      if (!user || !user.loopProgress[loop]) return;

      const loopData = user.loopProgress[loop];
      loopData.availableScrolls = [...SCROLL_INVENTORY.regular[loop]];
      loopData.deliveredScrolls = [];
      loopData.completed = false;
      loopData.resetAt = nowISO();

      if (loop === 3 && loopData.shadowScrolls) {
        loopData.shadowScrolls.availableScrolls = [...SCROLL_INVENTORY.shadow[3]];
        loopData.shadowScrolls.deliveredScrolls = [];
        loopData.shadowScrolls.completed = false;
      }

      log(`Reset loop ${loop} progress for user ${userId}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SCROLL DELIVERY ENGINE
  // ═══════════════════════════════════════════════════════════════

  class WhisperEngine {
    constructor() {
      this.cache = new ScrollCache();
      this.initialized = false;
    }

    async initialize() {
      try {
        await this.cache.load();
        this.initialized = true;
        log('WhisperEngine initialized successfully');
      } catch (err) {
        error('Failed to initialize WhisperEngine:', err);
        throw err;
      }
    }

    async getNextScroll(userId = null, requestType = 'regular') {
      if (!this.initialized) {
        await this.initialize();
      }

      const finalUserId = userId || getUserId();
      const currentLoop = getCurrentLoop();

      // Users must have loop level 1+ to receive scrolls
      if (currentLoop < 1) {
        return {
          success: false,
          message: "Access requires Loop Level 1 or higher. Use passphrase 'sol' to unlock.",
          code: 'INSUFFICIENT_LOOP_LEVEL'
        };
      }

      this.cache.ensureUser(finalUserId);
      const user = this.cache.cache.users[finalUserId];
      
      // Handle shadow scroll requests
      if (requestType === 'shadow') {
        if (currentLoop < 3) {
          return {
            success: false,
            message: "Shadow scrolls require Loop Level 3. Use passphrase 'umbra' to unlock.",
            code: 'INSUFFICIENT_SHADOW_ACCESS'
          };
        }
        return await this.getShadowScroll(finalUserId, currentLoop);
      }

      // Handle regular scroll requests
      return await this.getRegularScroll(finalUserId, currentLoop);
    }

    async getRegularScroll(userId, loop) {
      const user = this.cache.cache.users[userId];
      const loopData = user.loopProgress[loop];

      if (!loopData) {
        return {
          success: false,
          message: `No scroll data for loop ${loop}`,
          code: 'INVALID_LOOP'
        };
      }

      // Check if all scrolls in this loop have been delivered
      if (loopData.availableScrolls.length === 0) {
        if (!loopData.completed) {
          loopData.completed = true;
          this.cache.resetLoopProgress(userId, loop);
          await this.cache.save();
          
          return {
            success: true,
            message: `Loop ${loop} completed! All scrolls delivered. Starting fresh cycle.`,
            scroll: null,
            action: 'LOOP_RESET',
            loopCompleted: loop
          };
        }
      }

      // Get a random available scroll
      if (loopData.availableScrolls.length > 0) {
        const randomIndex = Math.floor(Math.random() * loopData.availableScrolls.length);
        const scrollName = loopData.availableScrolls.splice(randomIndex, 1)[0];
        loopData.deliveredScrolls.push({
          name: scrollName,
          deliveredAt: nowISO()
        });

        this.cache.cache._meta.globalStats.scrollsDelivered++;
        await this.cache.save();

        return {
          success: true,
          scroll: {
            name: scrollName,
            type: 'regular',
            loop: loop,
            path: `${CONFIG.SCROLLS_PATH}${scrollName}.md`,
            deliveredAt: nowISO()
          },
          remaining: loopData.availableScrolls.length,
          delivered: loopData.deliveredScrolls.length
        };
      }

      return {
        success: false,
        message: "No scrolls available in this loop",
        code: 'NO_SCROLLS_AVAILABLE'
      };
    }

    async getShadowScroll(userId, loop) {
      const user = this.cache.cache.users[userId];
      const shadowData = user.loopProgress[3]?.shadowScrolls;

      if (!shadowData) {
        return {
          success: false,
          message: "Shadow scroll data not available",
          code: 'SHADOW_DATA_MISSING'
        };
      }

      // Check if user has shadow scrolls enabled
      if (!user.preferences.enableShadowScrolls) {
        return {
          success: false,
          message: "Shadow scrolls are disabled in your preferences",
          code: 'SHADOW_DISABLED'
        };
      }

      // Check if all shadow scrolls have been delivered
      if (shadowData.availableScrolls.length === 0) {
        if (!shadowData.completed) {
          shadowData.completed = true;
          // Reset shadow scrolls when all delivered
          shadowData.availableScrolls = [...SCROLL_INVENTORY.shadow[3]];
          shadowData.deliveredScrolls = [];
          shadowData.completed = false;
          await this.cache.save();
          
          return {
            success: true,
            message: "All shadow scrolls completed! Starting fresh shadow cycle.",
            scroll: null,
            action: 'SHADOW_RESET'
          };
        }
      }

      // Get a random available shadow scroll
      if (shadowData.availableScrolls.length > 0) {
        const randomIndex = Math.floor(Math.random() * shadowData.availableScrolls.length);
        const scrollName = shadowData.availableScrolls.splice(randomIndex, 1)[0];
        shadowData.deliveredScrolls.push({
          name: scrollName,
          deliveredAt: nowISO()
        });

        this.cache.cache._meta.globalStats.shadowScrollsDelivered++;
        await this.cache.save();

        return {
          success: true,
          scroll: {
            name: scrollName,
            type: 'shadow',
            loop: 3,
            path: `${CONFIG.SHADOW_PATH}${scrollName}.md`,
            deliveredAt: nowISO()
          },
          remaining: shadowData.availableScrolls.length,
          delivered: shadowData.deliveredScrolls.length
        };
      }

      return {
        success: false,
        message: "No shadow scrolls available",
        code: 'NO_SHADOW_SCROLLS'
      };
    }

    async getUserStats(userId = null) {
      if (!this.initialized) {
        await this.initialize();
      }

      const finalUserId = userId || getUserId();
      this.cache.ensureUser(finalUserId);
      
      const user = this.cache.cache.users[finalUserId];
      const stats = {
        userId: finalUserId,
        currentLoop: user.currentLoop,
        totalDelivered: 0,
        shadowDelivered: 0,
        loopProgress: {}
      };

      Object.keys(user.loopProgress).forEach(loop => {
        const loopData = user.loopProgress[loop];
        stats.loopProgress[loop] = {
          delivered: loopData.deliveredScrolls.length,
          remaining: loopData.availableScrolls.length,
          completed: loopData.completed
        };
        stats.totalDelivered += loopData.deliveredScrolls.length;

        if (loop === '3' && loopData.shadowScrolls) {
          stats.shadowDelivered = loopData.shadowScrolls.deliveredScrolls.length;
          stats.loopProgress[loop].shadowScrolls = {
            delivered: loopData.shadowScrolls.deliveredScrolls.length,
            remaining: loopData.shadowScrolls.availableScrolls.length,
            completed: loopData.shadowScrolls.completed
          };
        }
      });

      return stats;
    }

    async getGlobalStats() {
      if (!this.initialized) {
        await this.initialize();
      }
      
      return {
        ...this.cache.cache._meta.globalStats,
        totalActiveUsers: Object.keys(this.cache.cache.users).length,
        cacheVersion: this.cache.cache._meta.version
      };
    }

    // Admin function to reset a user's progress
    async resetUser(userId) {
      if (!this.initialized) {
        await this.initialize();
      }

      if (this.cache.cache.users[userId]) {
        delete this.cache.cache.users[userId];
        await this.cache.save();
        log(`Reset user ${userId}`);
        return true;
      }
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GLOBAL API
  // ═══════════════════════════════════════════════════════════════

  window.WhisperEngine = WhisperEngine;

  // Initialize global instance
  window.whisperEngine = new WhisperEngine();

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.whisperEngine.initialize().catch(err => {
        error('Auto-initialization failed:', err);
      });
    });
  } else {
    window.whisperEngine.initialize().catch(err => {
      error('Auto-initialization failed:', err);
    });
  }

  log('WhisperEngine loaded successfully');

})();