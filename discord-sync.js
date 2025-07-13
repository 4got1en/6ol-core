/*  discord-sync.js  · v0.1
    Discord Sync system for auto-posting loop-bound scrolls to #whisper-engine
    Handles daily posting at 13:00 UTC using loop-bound logic.
    ────────────────────────────────────────────────────────────────── */

(() => {
  const DISCORD_CONFIG_KEY = '6ol_discord_config';
  const DISCORD_SCHEDULE_KEY = '6ol_discord_schedule';
  const LAST_POST_KEY = '6ol_last_discord_post';
  
  /* Discord configuration defaults */
  const DEFAULT_CONFIG = {
    webhookUrl: '', // To be configured by user
    channelName: '#whisper-engine',
    postTime: '13:00', // UTC time
    enabled: false
  };

  /* Get/Set Discord configuration */
  const getDiscordConfig = () => {
    const stored = localStorage.getItem(DISCORD_CONFIG_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  };
  
  const setDiscordConfig = (config) => {
    localStorage.setItem(DISCORD_CONFIG_KEY, JSON.stringify(config));
  };

  /* Get last post date */
  const getLastPostDate = () => localStorage.getItem(LAST_POST_KEY);
  const setLastPostDate = (date) => localStorage.setItem(LAST_POST_KEY, date);

  /* Check if it's time to post (13:00 UTC daily) */
  function shouldPostToday() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const lastPost = getLastPostDate();
    
    // Check if it's around 13:00 UTC (within 5 minutes) and we haven't posted today
    const isPostTime = utcHour === 13 && utcMinute < 5;
    const hasntPostedToday = lastPost !== today;
    
    return isPostTime && hasntPostedToday;
  }

  /* Get current user's loop level for filtering */
  function getCurrentLoopLevel() {
    return Number(localStorage.getItem('6ol_loop_level') || 0);
  }

  /* Get available scrolls based on loop level */
  function getAvailableScrolls() {
    const userLevel = getCurrentLoopLevel();
    const unlocked = JSON.parse(localStorage.getItem('unlocked') || '[]');
    
    // Define scrolls with their requirements
    const scrolls = [
      {
        title: 'Daylight Initiation',
        path: 'scrolls/daylight.md',
        level: 1,
        passphrase: 'sol',
        unlock: null
      },
      {
        title: 'Night-Vision Insight', 
        path: 'scrolls/nightvision.md',
        level: 2,
        passphrase: 'luna',
        unlock: null
      },
      {
        title: 'Shadow Work Depth',
        path: 'scrolls/shadowdepth.md', 
        level: 3,
        passphrase: 'umbra',
        unlock: null
      }
    ];
    
    return scrolls.filter(scroll => {
      const levelOk = scroll.level <= userLevel;
      const unlockOk = !scroll.unlock || unlocked.includes(scroll.unlock);
      return levelOk && unlockOk;
    });
  }

  /* Select today's scroll based on date and available scrolls */
  function selectTodaysScroll() {
    const available = getAvailableScrolls();
    if (available.length === 0) return null;
    
    // Use date as seed for deterministic but varied selection
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % available.length;
    
    return available[index];
  }

  /* Format scroll content for Discord */
  async function formatScrollForDiscord(scroll) {
    try {
      const response = await fetch(scroll.path);
      const content = await response.text();
      
      // Extract title and first paragraph for preview
      const lines = content.split('\n').filter(line => line.trim());
      let title = scroll.title;
      let preview = '';
      
      // Find first substantial content line
      for (const line of lines) {
        if (line.startsWith('#') && !title) {
          title = line.replace(/^#+\s*/, '');
        } else if (line.length > 20 && !line.startsWith('---') && !line.includes(':')) {
          preview = line.substring(0, 200);
          if (preview.length < line.length) preview += '...';
          break;
        }
      }
      
      return {
        embed: {
          title: `🌟 Today's Whisper: ${title}`,
          description: preview,
          color: 0xf5c84c, // Accent color
          fields: [
            {
              name: 'Loop Level Required',
              value: `Level ${scroll.level}`,
              inline: true
            },
            {
              name: 'Passphrase',
              value: `\`${scroll.passphrase}\``,
              inline: true
            }
          ],
          footer: {
            text: '6ol Core Hub • Daily Whisper Delivery'
          },
          timestamp: new Date().toISOString(),
          url: `https://4got1en.github.io/6ol-core/${scroll.path}`
        }
      };
    } catch (error) {
      console.error('Error formatting scroll for Discord:', error);
      return null;
    }
  }

  /* Post to Discord webhook */
  async function postToDiscord(content) {
    const config = getDiscordConfig();
    
    if (!config.webhookUrl) {
      console.log('Discord webhook not configured');
      return false;
    }
    
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      });
      
      if (response.ok) {
        console.log('Successfully posted to Discord');
        return true;
      } else {
        console.error('Discord post failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error posting to Discord:', error);
      return false;
    }
  }

  /* Main function to check and post daily scroll */
  async function checkAndPostDailyScroll() {
    const config = getDiscordConfig();
    
    if (!config.enabled) {
      return;
    }
    
    if (!shouldPostToday()) {
      return;
    }
    
    const todaysScroll = selectTodaysScroll();
    if (!todaysScroll) {
      console.log('No scrolls available for posting today');
      return;
    }
    
    const discordContent = await formatScrollForDiscord(todaysScroll);
    if (!discordContent) {
      console.error('Failed to format scroll for Discord');
      return;
    }
    
    const success = await postToDiscord(discordContent);
    if (success) {
      const today = new Date().toISOString().split('T')[0];
      setLastPostDate(today);
      console.log(`Posted daily scroll: ${todaysScroll.title}`);
    }
  }

  /* Create Discord configuration UI */
  function createDiscordConfigUI() {
    const config = getDiscordConfig();
    
    const configSection = document.createElement('section');
    configSection.id = 'discord-config';
    configSection.innerHTML = `
      <h2>🔗 Discord Sync Configuration</h2>
      <div class="card">
        <label>
          <input type="checkbox" id="discord-enabled" ${config.enabled ? 'checked' : ''}>
          Enable Discord sync (posts daily at 13:00 UTC)
        </label>
        <label>Discord Webhook URL
          <input type="url" id="discord-webhook" value="${config.webhookUrl}" 
                 placeholder="https://discord.com/api/webhooks/...">
        </label>
        <label>Channel Name
          <input type="text" id="discord-channel" value="${config.channelName}" readonly>
        </label>
        <label>Post Time (UTC)
          <input type="time" id="discord-time" value="${config.postTime}" readonly>
        </label>
        <button id="save-discord-config">💾 Save Configuration</button>
        <button id="test-discord-post" style="margin-left: 10px;">🧪 Test Post</button>
      </div>
      <div class="card">
        <h3>Status</h3>
        <p id="discord-status">
          Last post: ${getLastPostDate() || 'Never'}<br>
          Next post: ${shouldPostToday() ? 'Ready to post!' : 'Waiting for 13:00 UTC'}
        </p>
      </div>
    `;
    
    return configSection;
  }

  /* Initialize Discord sync system */
  function initDiscordSync() {
    // Add configuration UI to the page
    const main = document.querySelector('main');
    if (main && !document.getElementById('discord-config')) {
      const configUI = createDiscordConfigUI();
      main.appendChild(configUI);
      
      // Add event handlers
      document.getElementById('save-discord-config').onclick = saveDiscordConfig;
      document.getElementById('test-discord-post').onclick = testDiscordPost;
    }
    
    // Start checking for daily posts every minute
    setInterval(checkAndPostDailyScroll, 60000);
    
    // Check immediately on load
    setTimeout(checkAndPostDailyScroll, 1000);
  }

  /* Save Discord configuration */
  function saveDiscordConfig() {
    const config = {
      enabled: document.getElementById('discord-enabled').checked,
      webhookUrl: document.getElementById('discord-webhook').value.trim(),
      channelName: document.getElementById('discord-channel').value,
      postTime: document.getElementById('discord-time').value
    };
    
    setDiscordConfig(config);
    alert('Discord configuration saved!');
    
    // Update status
    document.getElementById('discord-status').innerHTML = `
      Configuration saved!<br>
      Status: ${config.enabled ? 'Enabled' : 'Disabled'}<br>
      Last post: ${getLastPostDate() || 'Never'}
    `;
  }

  /* Test Discord posting */
  async function testDiscordPost() {
    const config = getDiscordConfig();
    
    if (!config.webhookUrl) {
      alert('Please configure webhook URL first');
      return;
    }
    
    const testContent = {
      embed: {
        title: '🧪 Discord Sync Test',
        description: 'This is a test message from the 6ol Core Hub Discord sync system.',
        color: 0xf5c84c,
        footer: {
          text: '6ol Core Hub • Test Message'
        },
        timestamp: new Date().toISOString()
      }
    };
    
    const success = await postToDiscord(testContent);
    if (success) {
      alert('Test message posted successfully!');
    } else {
      alert('Test message failed to post. Check console for details.');
    }
  }

  /* Export functions for use by other modules */
  window.DiscordSync = {
    checkAndPostDailyScroll,
    initDiscordSync,
    getDiscordConfig,
    setDiscordConfig,
    shouldPostToday,
    selectTodaysScroll
  };

  /* Auto-initialize when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiscordSync);
  } else {
    initDiscordSync();
  }
})();