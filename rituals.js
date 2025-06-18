/* ==========================================================
   6ol · Ritual Core · v1.4
   Shadow Gate Logic · Loop Level + Passphrase Unlock
   ========================================================== */

const OPENAI_API_KEY   = localStorage.getItem('OPENAI_KEY') || '';
const GITHUB_TOKEN     = localStorage.getItem('GH_TOKEN')   || '';
const GITHUB_REPO_FULL = '4got1en/6ol-data-vault';

// 🔐 Gatekeepers
let userLoopLevel = parseInt(localStorage.getItem('loopLevel') || '1');
let unlockedPassphrases = JSON.parse(localStorage.getItem('unlocked') || '[]');
function addUnlock(word) {
  if (!unlockedPassphrases.includes(word)) {
    unlockedPassphrases.push(word);
    localStorage.setItem('unlocked', JSON.stringify(unlockedPassphrases));
  }
}

const uuid = () => crypto.randomUUID();
const nowISO = () => new Date().toISOString();

/* ----------  Error trap  ---------- */
window.lastError = null;
function trap(err) {
  window.lastError = err;
  console.error(err);
  const out = document.getElementById('terminal-output');
  if (out) {
    const span = document.createElement('span');
    span.style.color = 'red';
    span.textContent = `⚠️ ${err.message || err}`;
    out.appendChild(span);
    out.scrollTop = out.scrollHeight;
  }
}
window.addEventListener('error', e => trap(e.error || e));
window.addEventListener('unhandledrejection', e => trap(e.reason || e));

/* ----------  AI AGENTS  ---------- */
const agents = {
  async nameMaster() {
    if (!OPENAI_API_KEY) return `Untitled-${uuid().slice(0, 8)}`;
    try {
      const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Generate a 2-4 word poetic ritual title. Return ONLY the title.' }],
          temperature: 0.9,
          max_tokens: 12
        })
      }).then(r => r.json());
      return rsp?.choices?.[0]?.message?.content?.trim() || `Untitled-${uuid().slice(0, 8)}`;
    } catch (err) { trap(err); return `Untitled-${uuid().slice(0, 8)}`; }
  },

  async whisperEngine(text) {
    if (!OPENAI_API_KEY) return [];
    try {
      const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `You are WhisperEngine. From the text below, return 3 concise, lowercase tags (comma separated):\n\n"""${text}"""`
          }],
          temperature: 0.4,
          max_tokens: 20
        })
      }).then(r => r.json());
      return rsp?.choices?.[0]?.message?.content?.split(',').map(t => t.trim()) || [];
    } catch (err) { trap(err); return []; }
  },

  async archivistPush(ritual) {
    if (!GITHUB_TOKEN) return false;
    const path = `rituals/${ritual.fileName}`;
    const content = btoa(`---\n` +
      `id: ${ritual.id}\n` +
      `name: "${ritual.name}"\n` +
      `createdAt: ${ritual.createdAt}\n` +
      `loopLevel: ${ritual.loopLevel}\n` +
      `tags: [${ritual.tags.join(', ')}]\n` +
      `unlock: ${ritual.unlock || null}\n` +
      `---\n\n${ritual.body}\n`);
    const url = `https://api.github.com/repos/${GITHUB_REPO_FULL}/contents/${path}`;
    const payload = { message: `🕯️ Ritual: ${ritual.name}`, content };

    try {
      const current = await fetch(url, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
      }).then(r => r.json());

      if (current?.sha) payload.sha = current.sha;

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${GITHUB_TOKEN}`
        },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) { trap(err); return false; }
  }
};

/* ----------  Ritual CLASS  ---------- */
class Ritual {
  constructor({ body, loopLevel, tags, unlock }) {
    this.id         = uuid();
    this.createdAt  = nowISO();
    this.lastEdited = this.createdAt;
    this.loopLevel  = Number(loopLevel) || 1;
    this.unlock     = unlock || null;
    this.body       = body;
    this.tags       = tags.filter(Boolean);
    this.synced     = false;
    this.name       = '';
    this.fileName   = '';
  }

  async finalize() {
    this.name = await agents.nameMaster();
    if (this.tags.length === 0) {
      this.tags = await agents.whisperEngine(this.body);
    }
    this.fileName = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + this.id.slice(0, 8) + '.md';
  }

  async pushToGitHub() {
    this.synced = await agents.archivistPush(this);
    this.lastEdited = nowISO();
    saveArchive();
  }
}

/* ----------  Local Storage ---------- */
const ARCHIVE_KEY = '6ol-rituals';
const rawArchive = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');
const archive = rawArchive.map(obj => Object.setPrototypeOf(obj, Ritual.prototype));
window.__archive = archive;
function saveArchive() {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}

/* ----------  DOM ---------- */
const form     = document.getElementById('ritualForm');
const bodyEl   = document.getElementById('body');
const tagsEl   = document.getElementById('tags');
const loopEl   = document.getElementById('loopLevel');
const unlockEl = document.getElementById('unlock');
const preview  = document.getElementById('preview');
const listEl   = document.getElementById('ritualList');

bodyEl.addEventListener('input', () => {
  preview.textContent = bodyEl.value || '// Start typing above…';
});

form.addEventListener('submit', async evt => {
  evt.preventDefault();
  const ritual = new Ritual({
    body: bodyEl.value.trim(),
    loopLevel: loopEl.value,
    tags: tagsEl.value.split(',').map(s => s.trim()),
    unlock: unlockEl.value.trim()
  });
  await ritual.finalize();
  archive.unshift(ritual);
  renderAll();
  saveArchive();
  form.reset();
  preview.textContent = '// Start typing above…';
  ritual.pushToGitHub();
});

/* ----------  Shadow Gate Filtering ---------- */
function canView(ritual) {
  if (ritual.loopLevel > userLoopLevel) return false;
  if (ritual.unlock && !unlockedPassphrases.includes(ritual.unlock)) return false;
  return true;
}

function renderAll() {
  listEl.innerHTML = '';
  archive.filter(canView).forEach(renderItem);
}

/* ----------  Render Ritual ---------- */
function renderItem(ritual) {
  const el = document.createElement('div');
  el.className = 'ritual-item';
  el.innerHTML = `
    <div class="ritual-header">
      <strong>${ritual.name}</strong>
      <span>Loop ${ritual.loopLevel} • ${new Date(ritual.createdAt).toLocaleString()}</span>
    </div>
    <pre>${ritual.body}</pre>
    <small>tags: ${ritual.tags.join(', ') || '—'} • ${ritual.synced ? '📤 synced' : '⏳ pending'}</small>
  `;
  listEl.appendChild(el);
}

/* ----------  Unlock Passphrase Box ---------- */
const passDiv = document.createElement('div');
passDiv.innerHTML = `
  <form id="unlockForm" style="margin-top:2rem">
    <input id="unlockInput" placeholder="🔑 Enter unlock word…" style="padding:0.5rem;border:1px solid #444;border-radius:4px;background:#111;color:#fff"/>
    <button style="padding:0.5rem;margin-left:0.5rem;">Unlock</button>
  </form>
`;
listEl.parentElement.appendChild(passDiv);

document.getElementById('unlockForm').addEventListener('submit', e => {
  e.preventDefault();
  const val = document.getElementById('unlockInput').value.trim();
  if (val) {
    addUnlock(val);
    renderAll();
    document.getElementById('unlockInput').value = '';
  }
});

/* ----------  Initial Render ---------- */
renderAll();

/* ----------  Debug Helper ---------- */
window.forgeTestRitual = async (text = 'Console ritual') => {
  const r = new Ritual({ body: text, loopLevel: 3, tags: ['shadow'], unlock: 'MIRROR' });
  await r.finalize();
  archive.unshift(r); renderAll(); saveArchive(); r.pushToGitHub();
  return r;
};