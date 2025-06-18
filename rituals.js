/* ==========================================================
   6ol · Ritual Core · v2.2
   Full file – Veil, Loop Ascension, Passphrase Unlock, Live Search
   ========================================================== */

/* ----------  CONFIG & STORED STATE  ---------- */
const OPENAI_API_KEY   = localStorage.getItem('OPENAI_KEY') || '';
const GITHUB_TOKEN     = localStorage.getItem('GH_TOKEN')   || '';
const GITHUB_REPO_FULL = '4got1en/6ol-data-vault';

let userLoopLevel = parseInt(localStorage.getItem('loopLevel') || '1');
let unlockedPassphrases = JSON.parse(localStorage.getItem('unlocked') || '[]');
let searchTerm = '';
let activeTag  = '';

/* ----------  UTILS  ---------- */
const uuid   = () => crypto.randomUUID();
const nowISO = () => new Date().toISOString();
function addUnlock(word){
  if(!unlockedPassphrases.includes(word)){
    unlockedPassphrases.push(word);
    localStorage.setItem('unlocked', JSON.stringify(unlockedPassphrases));
  }
}
function setLoop(lvl){
  userLoopLevel = lvl;
  localStorage.setItem('loopLevel', String(lvl));
  updateLoopDisplay(); renderAll();
}

/* ----------  ERROR TRAP  ---------- */
window.lastError = null;
function trap(err){
  window.lastError = err; console.error(err);
  const out = document.getElementById('terminal-output');
  if(out){
    const span = document.createElement('span');
    span.style.color='red'; span.textContent=`⚠️ ${err.message||err}`;
    out.appendChild(span); out.scrollTop = out.scrollHeight;
  }
}
window.addEventListener('error', e=>trap(e.error||e));
window.addEventListener('unhandledrejection', e=>trap(e.reason||e));

/* ----------  AI AGENTS  ---------- */
const agents = {
  async nameMaster(){
    if(!OPENAI_API_KEY) return `Untitled-${uuid().slice(0,8)}`;
    try{
      const rsp = await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}`},
        body:JSON.stringify({
          model:'gpt-4o-mini',
          messages:[{role:'user',content:'Generate a 2-4-word poetic ritual title. Return ONLY the title.'}],
          temperature:0.9,max_tokens:12
        })
      }).then(r=>r.json());
      return rsp?.choices?.[0]?.message?.content?.trim()||`Untitled-${uuid().slice(0,8)}`;
    }catch(err){trap(err);return`Untitled-${uuid().slice(0,8)}`;}
  },
  async whisperEngine(text){
    if(!OPENAI_API_KEY) return [];
    try{
      const rsp = await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}`},
        body:JSON.stringify({
          model:'gpt-4o-mini',
          messages:[{role:'user',content:`Return 3 concise, lowercase tags for:\n\n"""${text}"""`}],
          temperature:0.4,max_tokens:20
        })
      }).then(r=>r.json());
      return rsp?.choices?.[0]?.message?.content?.split(',').map(t=>t.trim())||[];
    }catch(err){trap(err);return[];}
  },
  async archivistPush(ritual){
    if(!GITHUB_TOKEN) return false;
    const path=`rituals/${ritual.fileName}`;
    const content=btoa(`---\nid: ${ritual.id}\nname: "${ritual.name}"\ncreatedAt: ${ritual.createdAt}\nloopLevel: ${ritual.loopLevel}\ntags: [${ritual.tags.join(', ')}]\nunlock: ${ritual.unlock||null}\n---\n\n${ritual.body}\n`);
    const url=`https://api.github.com/repos/${GITHUB_REPO_FULL}/contents/${path}`;
    const payload={message:`🕯️ Ritual: ${ritual.name}`,content};
    try{
      const current = await fetch(url,{headers:{Authorization:`Bearer ${GITHUB_TOKEN}`}}).then(r=>r.json());
      if(current?.sha) payload.sha=current.sha;
      const res = await fetch(url,{
        method:'PUT',
        headers:{'Content-Type':'application/json','Accept':'application/vnd.github+json','Authorization':`Bearer ${GITHUB_TOKEN}`},
        body:JSON.stringify(payload)
      });
      return res.ok;
    }catch(err){trap(err);return false;}
  }
};

/* ----------  RITUAL CLASS  ---------- */
class Ritual{
  constructor({body,loopLevel,tags,unlock}){
    this.id=uuid(); this.createdAt=nowISO(); this.lastEdited=this.createdAt;
    this.loopLevel=Number(loopLevel)||1; this.unlock=unlock||null;
    this.body=body; this.tags=tags.filter(Boolean); this.synced=false;
    this.name=''; this.fileName='';
  }
  async finalize(){
    this.name=await agents.nameMaster();
    if(this.tags.length===0) this.tags=await agents.whisperEngine(this.body);
    this.fileName=this.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')+`-${this.id.slice(0,8)}.md`;
  }
  async pushToGitHub(){
    this.synced=await agents.archivistPush(this);
    this.lastEdited=nowISO(); saveArchive();
  }
}

/* ----------  LOCAL STORAGE ---------- */
const ARCHIVE_KEY='6ol-rituals';
const rawArchive = JSON.parse(localStorage.getItem(ARCHIVE_KEY)||'[]');
const archive    = rawArchive.map(o=>Object.setPrototypeOf(o,Ritual.prototype));
window.__archive = archive;
function saveArchive(){localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archive));}

/* ----------  DOM  ---------- */
const form     = document.getElementById('ritualForm');
const bodyEl   = document.getElementById('body');
const tagsEl   = document.getElementById('tags');
const loopEl   = document.getElementById('loopLevel');
const unlockEl = document.getElementById('unlock');
const preview  = document.getElementById('preview');
const listEl   = document.getElementById('ritualList');
const loopStatus = document.getElementById('loopStatus');
const ascendBtn  = document.getElementById('ascend');
const unlockForm = document.getElementById('unlockForm');
const unlockInput= document.getElementById('unlockInput');
const searchInput= document.getElementById('searchInput');
const matchCount = document.getElementById('matchCount');
const tagWrap    = document.getElementById('tagChips');

/* ----------  LOOP DISPLAY ---------- */
function updateLoopDisplay(){
  const names=['Initiate','Seeker','Witness','Architect','Lightbearer'];
  loopStatus.textContent=`Current Loop: ${userLoopLevel} – ${names[userLoopLevel-1]||'—'}`;
}

/* ----------  GATE CHECKS ---------- */
function canView(r){return r.loopLevel<=userLoopLevel && (!r.unlock||unlockedPassphrases.includes(r.unlock));}
function isLocked(r){return !canView(r);}

/* ----------  SEARCH FILTER ---------- */
function filterMatch(r){
  const gateOk = canView(r) || isLocked(r);
  if(!gateOk) return false;
  const textOk = searchTerm ?
    (r.name+r.body).toLowerCase().includes(searchTerm) || r.tags.some(t=>t.includes(searchTerm)) : true;
  const tagOk  = activeTag ? r.tags.includes(activeTag) : true;
  return textOk && tagOk;
}

/* ----------  RENDER ---------- */
function renderItem(r){
  const div=document.createElement('div');
  div.className='ritual-item'+(isLocked(r)?' locked':'');
  div.innerHTML=`
    <div class="ritual-header">
      <strong>${r.name}</strong>
      <span>Loop ${r.loopLevel} • ${new Date(r.createdAt).toLocaleString()}</span>
    </div>
    <pre>${r.body}</pre>
    <small>tags: ${r.tags.join(', ')||'—'} • ${r.synced?'📤 synced':'⏳ pending'}</small>
    ${isLocked(r)?'<div class="veil"><span>🔒 Locked</span></div>':''}
  `;
  listEl.appendChild(div);
}
function renderAll(){
  listEl.innerHTML='';
  const matches = archive.filter(filterMatch);
  matches.forEach(renderItem);
  matchCount.textContent=matches.length?`(${matches.length})`:'';

  // tag chips
  const tags=new Set(); matches.forEach(r=>r.tags.forEach(t=>tags.add(t)));
  tagWrap.innerHTML='';
  [...tags].sort().forEach(t=>{
    const chip=document.createElement('div');
    chip.textContent=t; chip.className='tag-chip'+(t===activeTag?' active':'');
    chip.onclick=()=>{activeTag=(activeTag===t?'':t); renderAll();};
    tagWrap.appendChild(chip);
  });
}

/* ----------  EVENT LISTENERS ---------- */
bodyEl.addEventListener('input',()=>preview.textContent=bodyEl.value||'// Start typing above…');
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const rit=new Ritual({
    body:bodyEl.value.trim(),
    loopLevel:loopEl.value,
    tags:tagsEl.value.split(',').map(s=>s.trim()),
    unlock:unlockEl.value.trim()
  });
  await rit.finalize(); archive.unshift(rit); saveArchive();
  bodyEl.value=tagsEl.value=unlockEl.value=''; preview.textContent='// Start typing above…';
  renderAll(); rit.pushToGitHub();
});
ascendBtn.addEventListener('click',()=>setLoop(userLoopLevel+1));
unlockForm.addEventListener('submit',e=>{
  e.preventDefault(); const v=unlockInput.value.trim();
  if(v){addUnlock(v); unlockInput.value=''; renderAll();}
});
searchInput.addEventListener('input',e=>{
  searchTerm=e.target.value.trim().toLowerCase(); renderAll();
});

/* ----------  INIT ---------- */
updateLoopDisplay(); renderAll();

/* ----------  DEBUG HELPER ---------- */
window.forgeTestRitual = async (txt='Console ritual')=>{
  const r=new Ritual({body:txt,loopLevel:3,tags:['shadow'],unlock:'MIRROR'});
  await r.finalize(); archive.unshift(r); saveArchive(); renderAll(); r.pushToGitHub(); return r;
};