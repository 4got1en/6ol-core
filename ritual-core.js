/* ==========================================================
   6ol · Ritual Core · v1.0
   ----------------------------------------------------------
   STEP 1  ▸  Data model + in-browser persistence
            + AI-agent hooks (OpenAI & GitHub REST placeholders)
   ========================================================== */

const OPENAI_API_KEY   = localStorage.getItem('OPENAI_KEY')   || '';  // ← store safely
const GITHUB_TOKEN     = localStorage.getItem('GH_TOKEN')     || '';
const GITHUB_REPO_FULL = '4got1en/6ol-data-vault';             // owner/repo

/* ----------  Utility  ---------- */
const uuid = () => crypto.randomUUID();
const nowISO = () => new Date().toISOString();

/* ----------  AI AGENTS  ---------- */
const agents = {
  /* 📛 NameMaster → generates unique ritual titles */
  async nameMaster() {
    if (!OPENAI_API_KEY) return `Untitled-${uuid().slice(0,8)}`;
    const prompt = `Generate a 2-to-4-word poetic ritual title. Return ONLY the title.`;
    const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}` },
      body:JSON.stringify({
        model:'gpt-4o-mini',
        messages:[{role:'user',content:prompt}],
        temperature:0.9, max_tokens:12
      })
    }).then(r=>r.json()).catch(()=>null);
    return rsp?.choices?.[0]?.message?.content?.trim() || `Untitled-${uuid().slice(0,8)}`;
  },

  /* 🏷️ WhisperEngine → generates tags & insights */
  async whisperEngine(text) {
    if (!OPENAI_API_KEY) return [];
    const prompt = `You are WhisperEngine. From the text below, return 3 concise, lowercase tags (comma separated) that capture its themes:\n\n"""${text}"""`;
    const rsp = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}` },
      body:JSON.stringify({
        model:'gpt-4o-mini',
        messages:[{role:'user',content:prompt}],
        temperature:0.4, max_tokens:20
      })
    }).then(r=>r.json()).catch(()=>null);
    return rsp?.choices?.[0]?.message?.content?.split(',').map(t=>t.trim()) || [];
  },

  /* 📤 Archivist → pushes ritual .md to GitHub */
  async archivistPush(ritual) {
    if (!GITHUB_TOKEN) return false;
    const path = `rituals/${ritual.fileName}`;
    const content = btoa(`---\n`+
      `id: ${ritual.id}\n`+
      `name: "${ritual.name}"\n`+
      `createdAt: ${ritual.createdAt}\n`+
      `loopLevel: ${ritual.loopLevel}\n`+
      `tags: [${ritual.tags.join(', ')}]\n`+
      `unlock: ${ritual.unlock || null}\n`+
      `---\n\n${ritual.body}\n`);
    const url = `https://api.github.com/repos/${GITHUB_REPO_FULL}/contents/${path}`;
    const payload = { message:`🕯️ Ritual: ${ritual.name}`, content };

    /* First check if file exists to include sha for update */
    const current = await fetch(url,{ headers:{'Authorization':`Bearer ${GITHUB_TOKEN}`}}).then(r=>r.json());
    if (current?.sha) payload.sha = current.sha;

    const res = await fetch(url,{
      method:'PUT',
      headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${GITHUB_TOKEN}` },
      body:JSON.stringify(payload)
    }).then(r=>r.ok);
    return res;
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
    this.synced     = false;           // flips true after Archivist succeeds
    this.name       = '';
    this.fileName   = '';              // populated after name generated
  }

  async finalize() {
    this.name = await agents.nameMaster();
    if (this.tags.length === 0) {
      this.tags = await agents.whisperEngine(this.body);
    }
    this.fileName = this.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')+'-'+this.id.slice(0,8)+'.md';
  }

  async pushToGitHub() {
    this.synced = await agents.archivistPush(this);
    this.lastEdited = nowISO();
    saveArchive();  // refresh localStorage
  }
}

/* ----------  Local Persistence  ---------- */
const ARCHIVE_KEY = '6ol-rituals';
const archive = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]');
function saveArchive() { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive)); }

/* ----------  DOM ↔ Ritual logic  ---------- */
const form      = document.getElementById('ritualForm');
const bodyEl    = document.getElementById('body');
const tagsEl    = document.getElementById('tags');
const loopEl    = document.getElementById('loopLevel');
const unlockEl  = document.getElementById('unlock');
const preview   = document.getElementById('preview');
const listEl    = document.getElementById('ritualList');

bodyEl.addEventListener('input', ()=> preview.textContent = bodyEl.value || '// Start typing above…');

/* Render archive on load */
archive.forEach(renderItem);

form.addEventListener('submit', async evt=>{
  evt.preventDefault();
  const ritual = new Ritual({
    body: bodyEl.value.trim(),
    loopLevel: loopEl.value,
    tags: tagsEl.value.split(',').map(s=>s.trim()),
    unlock: unlockEl.value.trim()
  });
  await ritual.finalize();
  archive.unshift(ritual);
  renderItem(ritual, true);   // prepend
  saveArchive();
  form.reset();
  preview.textContent = '// Start typing above…';

  // push in background (non-blocking UI)
  ritual.pushToGitHub();
});

/* ------- render helper ------- */
function renderItem(ritual, prepend=false) {
  const el = document.createElement('div');
  el.className = 'ritual-item';
  el.innerHTML = `
    <div class="ritual-header">
      <strong>${ritual.name || '(unnamed)'}</strong>
      <span>Loop ${ritual.loopLevel} • ${new Date(ritual.createdAt).toLocaleString()}</span>
    </div>
    <pre>${ritual.body}</pre>
    <small>tags: ${ritual.tags.join(', ') || '—'} • ${ritual.synced ? '📤 synced' : '⏳ pending'}</small>
  `;
  if (prepend && listEl.firstChild) listEl.prepend(el);
  else listEl.appendChild(el);
}