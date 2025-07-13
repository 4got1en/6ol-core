/*  whisper-visual.js  · v0.1
    Visual Drops system - Foundation for image-rendered scrolls (Whisper Upgrade 5)
    Handles markdown-to-image rendering placeholder and visual scroll delivery.
    ────────────────────────────────────────────────────────────────── */

(() => {
  const VISUAL_STORAGE_KEY = '6ol_visual_drops';
  
  /* Visual drop configuration */
  const VISUAL_CONFIG = {
    canvas: {
      width: 800,
      height: 1200,
      backgroundColor: '#0b0b0b',
      textColor: '#eee',
      accentColor: '#f5c84c'
    },
    fonts: {
      title: 'bold 32px system-ui',
      body: '18px system-ui',
      meta: '14px system-ui'
    },
    layout: {
      padding: 60,
      lineHeight: 1.6,
      titleMarginBottom: 40,
      sectionSpacing: 30
    }
  };

  /* Get stored visual drops */
  const getVisualDrops = () => JSON.parse(localStorage.getItem(VISUAL_STORAGE_KEY) || '[]');
  const saveVisualDrops = (drops) => localStorage.setItem(VISUAL_STORAGE_KEY, JSON.stringify(drops));

  /* Generate visual scroll image from markdown content */
  async function generateScrollImage(scroll) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = VISUAL_CONFIG.canvas.width;
    canvas.height = VISUAL_CONFIG.canvas.height;
    
    // Fill background
    ctx.fillStyle = VISUAL_CONFIG.canvas.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add decorative border
    ctx.strokeStyle = VISUAL_CONFIG.canvas.accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    let yPos = VISUAL_CONFIG.layout.padding;
    
    // Draw title
    ctx.fillStyle = VISUAL_CONFIG.canvas.accentColor;
    ctx.font = VISUAL_CONFIG.fonts.title;
    ctx.textAlign = 'center';
    
    const title = scroll.title || 'Untitled Scroll';
    ctx.fillText(title, canvas.width / 2, yPos);
    yPos += VISUAL_CONFIG.layout.titleMarginBottom;
    
    // Draw level info
    ctx.fillStyle = VISUAL_CONFIG.canvas.textColor;
    ctx.font = VISUAL_CONFIG.fonts.meta;
    const levelText = `Loop Level ${scroll.loop_level || 1} • ${scroll.passphrase || 'sol'}`;
    ctx.fillText(levelText, canvas.width / 2, yPos);
    yPos += VISUAL_CONFIG.layout.sectionSpacing;
    
    // Draw body content (simplified - split by lines)
    ctx.font = VISUAL_CONFIG.fonts.body;
    ctx.textAlign = 'left';
    
    const maxWidth = canvas.width - (VISUAL_CONFIG.layout.padding * 2);
    const lines = wrapText(ctx, scroll.content || '', maxWidth);
    
    for (const line of lines.slice(0, 25)) { // Limit to 25 lines to fit canvas
      ctx.fillText(line, VISUAL_CONFIG.layout.padding, yPos);
      yPos += VISUAL_CONFIG.fonts.body.split('px')[0] * VISUAL_CONFIG.layout.lineHeight;
    }
    
    // Add timestamp
    ctx.font = VISUAL_CONFIG.fonts.meta;
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Generated ${new Date().toLocaleDateString()}`, 
      canvas.width / 2, 
      canvas.height - 30
    );
    
    return canvas.toDataURL('image/png');
  }

  /* Helper function to wrap text */
  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines;
  }

  /* Create visual drop from scroll data */
  async function createVisualDrop(scrollPath, scrollData) {
    try {
      // Generate image
      const imageData = await generateScrollImage(scrollData);
      
      const visualDrop = {
        id: crypto.randomUUID(),
        scrollPath,
        title: scrollData.title,
        level: scrollData.loop_level || 1,
        imageData,
        createdAt: new Date().toISOString(),
        delivered: false
      };
      
      // Store visual drop
      const drops = getVisualDrops();
      drops.unshift(visualDrop);
      saveVisualDrops(drops);
      
      return visualDrop;
    } catch (error) {
      console.error('Error creating visual drop:', error);
      return null;
    }
  }

  /* Display visual drop in UI */
  function displayVisualDrop(visualDrop) {
    const container = document.getElementById('visual-drops-container');
    if (!container) return;
    
    const dropElement = document.createElement('div');
    dropElement.className = 'visual-drop';
    dropElement.style.cssText = `
      background: var(--panel);
      border: 1px solid var(--edge);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
    `;
    
    dropElement.innerHTML = `
      <h3 style="color: var(--accent); margin-top: 0;">${visualDrop.title}</h3>
      <img src="${visualDrop.imageData}" alt="Visual scroll" style="max-width: 100%; height: auto; border-radius: 4px;">
      <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #aaa;">
        Created ${new Date(visualDrop.createdAt).toLocaleString()}
      </p>
    `;
    
    container.appendChild(dropElement);
  }

  /* Initialize visual drops system */
  function initVisualDrops() {
    // Add visual drops container if it doesn't exist
    let container = document.getElementById('visual-drops-container');
    if (!container) {
      const main = document.querySelector('main');
      const section = document.createElement('section');
      section.id = 'visual-drops';
      section.innerHTML = `
        <h1>📜 Visual Drops</h1>
        <div style="margin-bottom: 1rem;">
          <button id="test-visual-drop" style="background: var(--accent); color: #000; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">
            🧪 Generate Test Visual Drop
          </button>
        </div>
        <div id="visual-drops-container"></div>
      `;
      main.appendChild(section);
      container = document.getElementById('visual-drops-container');
      
      // Add test button functionality
      document.getElementById('test-visual-drop').onclick = async () => {
        const testDrop = await processScrollForVisualDrop('scrolls/daylight.md');
        if (testDrop) {
          displayVisualDrop(testDrop);
          alert('Visual drop created successfully! Check the Visual Drops section below.');
        } else {
          alert('Failed to create visual drop. Check console for errors.');
        }
      };
    }
    
    // Load and display existing visual drops
    const drops = getVisualDrops();
    drops.forEach(drop => displayVisualDrop(drop));
  }

  /* Process scroll for visual drop creation */
  async function processScrollForVisualDrop(scrollPath) {
    try {
      const response = await fetch(scrollPath);
      const content = await response.text();
      
      // Parse basic markdown (simplified parser)
      const lines = content.split('\n');
      let title = 'Untitled Scroll';
      let loop_level = 1;
      let passphrase = 'sol';
      let bodyContent = '';
      
      // Extract frontmatter and content
      let inFrontmatter = false;
      let contentStarted = false;
      
      for (const line of lines) {
        if (line.trim() === '---') {
          inFrontmatter = !inFrontmatter;
          continue;
        }
        
        if (inFrontmatter) {
          if (line.startsWith('title:')) {
            title = line.split(':')[1].trim().replace(/"/g, '');
          } else if (line.startsWith('loop_level:')) {
            loop_level = parseInt(line.split(':')[1].trim());
          } else if (line.startsWith('passphrase:')) {
            passphrase = line.split(':')[1].trim().replace(/"/g, '');
          }
        } else if (!contentStarted && line.trim()) {
          contentStarted = true;
          bodyContent += line + '\n';
        } else if (contentStarted) {
          bodyContent += line + '\n';
        }
      }
      
      const scrollData = { title, loop_level, passphrase, content: bodyContent.trim() };
      return await createVisualDrop(scrollPath, scrollData);
      
    } catch (error) {
      console.error('Error processing scroll for visual drop:', error);
      return null;
    }
  }

  /* Export functions for use by other modules */
  window.WhisperVisual = {
    generateScrollImage,
    createVisualDrop,
    displayVisualDrop,
    processScrollForVisualDrop,
    initVisualDrops,
    getVisualDrops
  };

  /* Auto-initialize when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualDrops);
  } else {
    initVisualDrops();
  }
})();