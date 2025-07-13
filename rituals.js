/* ==========================================================
   6ol · Ritual Core · v2.2  (Veil + Ascension + Search)
   ========================================================== */

/* ---------- CONFIG & SAVED STATE ---------- */
const OPENAI_API_KEY = localStorage.getItem('OPENAI_KEY') || '';
const GITHUB_TOKEN   = localStorage.getItem('GH_TOKEN')   || '';
const REPO_FULL      = '4got1en/6ol-data-vault';

let userLoop = parseInt(localStorage.getItem('loopLevel') || '1');
let unlocked = JSON.parse(localStorage.getItem('unlocked') || '[]');

let searchTerm = '';
let activeTag  = '';

/* Reflection gates and time locks (Whisper Engine v3 expansion) */
const UNLOCK_TIMES_KEY = '6ol_unlock_times';
const REFLECTIONS_KEY = '6ol_reflections';
const TIME_LOCK_HOURS = 24;

const REFLECTION_GATES = {
  1: "What sparked your curiosity to begin this journey?",
  2: "How has your understanding of yourself shifted since beginning?", 
  3: "What shadow within you is ready to be acknowledged?",
  4: "What patterns are you ready to architect into your life?",
  5: "How will you carry this light forward into the world?"
};

const PASS_MAP = {
  sol   : 1,   // Daylight initiation
  luna  : 2,   // Night-vision insight
  umbra : 3    // Shadow work depth
};

/* ---------- UTILS ---------- */
const uuid   = () => crypto.randomUUID();
const nowISO = () => new Date().toISOString();
function saveUnlock(word){
  if(!unlocked.includes(word)){
    unlocked.push(word);
    localStorage.setItem('unlocked', JSON.stringify(unlocked));
  }
}
function setLoop(l){ userLoop = l; localStorage.setItem('loopLevel', String(l)); updateLoopDisplay(); renderAll(); }

/* Time lock helpers */
const getUnlockTimes = () => JSON.parse(localStorage.getItem(UNLOCK_TIMES_KEY) || '{}');
const setUnlockTime = (level, timestamp) => {
  const times = getUnlockTimes();
  times[level] = timestamp;
  localStorage.setItem(UNLOCK_TIMES_KEY, JSON.stringify(times));
};
const canUnlockByTime = (level) => {
  const times = getUnlockTimes();
  const lastUnlock = times[level];
  if (!lastUnlock) return true;
  const hoursSince = (Date.now() - lastUnlock) / (1000 * 60 * 60);
  return hoursSince >= TIME_LOCK_HOURS;
};

/* Reflection helpers */
const getReflections = () => JSON.parse(localStorage.getItem(REFLECTIONS_KEY) || '{}');
const setReflection = (level, reflection) => {
  const reflections = getReflections();
  reflections[level] = reflection;
  localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(reflections));
};
const hasReflected = (level) => {
  const reflections = getReflections();
  return reflections[level] && reflections[level].length > 10;
};

/* ---------- ERROR TRAP ---------- */
window.lastError=null;
function trap(e){ window.lastError=e; console.error(e); }
window.addEventListener('error',   ev=>trap(ev.error||ev));
window.addEventListener('unhandledrejection', ev=>trap(ev.reason||ev));

/* ---------- AI AGENTS ---------- */
async function titleAI(){
  if(!OPENAI_API_KEY) return `Untitled-${uuid().slice(0,8)}`;
  try{
    const r=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}`},
      body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:'Generate a 2-4 word poetic ritual title. Return ONLY the title.'}],temperature:0.9,max_tokens:12})
    }).then(r=>r.json());
    return r?.choices?.[0]?.message?.content?.trim()||`Untitled-${uuid().slice(0,8)}`;
  }catch(e){trap(e);return`Untitled-${uuid().slice(0,8)}`;}
}
async function tagAI(text){
  if(!OPENAI_API_KEY) return [];
  try{
    const r=await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}`},
      body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:`Return 3 concise, lowercase tags:\n\n"""${text}"""`}],temperature:0.4,max_tokens:20})
    }).then(r=>r.json());
    return r?.choices?.[0]?.message?.content?.split(',').map(t=>t.trim())||[];
  }catch(e){trap(e);return[];}
}
async function pushGit(ritual){
  if(!GITHUB_TOKEN) return false;
  const path=`rituals/${ritual.fileName}`;
  const content=btoa(`---\nid:${ritual.id}\nname:"${ritual.name}"\ncreatedAt:${ritual.createdAt}\nloopLevel:${ritual.loopLevel}\ntags:[${ritual.tags.join(', ')}]\nunlock:${ritual.unlock||null}\n---\n\n${ritual.body}\n`);
  const url=`https://api.github.com/repos/${REPO_FULL}/contents/${path}`;
  const headers={'Content-Type':'application/json','Accept':'application/vnd.github+json','Authorization':`Bearer ${GITHUB_TOKEN}`};
  try{
    const cur=await fetch(url,{headers}).then(r=>r.json());
    const payload={message:`🕯️ Ritual: ${ritual.name}`,content};
    if(cur?.sha) payload.sha=cur.sha;
    const res=await fetch(url,{method:'PUT',headers,body:JSON.stringify(payload)});
    return res.ok;
  }catch(e){trap(e);return false;}
}

/* ---------- RITUAL CLASS ---------- */
class Ritual{
  constructor({body,loopLevel,tags,unlock}){
    this.id=uuid(); this.createdAt=nowISO(); this.lastEdited=this.createdAt;
    this.loopLevel=Number(loopLevel)||1; this.unlock=unlock||null;
    this.body=body; this.tags=tags.filter(Boolean); this.synced=false; this.name=''; this.fileName='';
  }
  async finalize(){
    this.name=await titleAI();
    if(!this.tags.length) this.tags=await tagAI(this.body);
    this.fileName=this.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')+`-${this.id.slice(0,8)}.md`;
  }
  async push(){ this.synced=await pushGit(this); this.lastEdited=nowISO(); saveArchive(); }
}

/* ---------- STORAGE ---------- */
const STORE='6ol-rituals';
const archive=(JSON.parse(localStorage.getItem(STORE)||'[]')).map(o=>Object.setPrototypeOf(o,Ritual.prototype));
function saveArchive(){localStorage.setItem(STORE,JSON.stringify(archive));}
window.__archive=archive;

/* ---------- DOM ---------- */
const $ = id=>document.getElementById(id);
const form=$('ritualForm'), bodyEl=$('body'), tagsEl=$('tags'), loopEl=$('loopLevel'), unlockEl=$('unlock'), preview=$('preview');
const listEl=$('ritualList'), loopStatus=$('loopStatus'), ascendBtn=$('ascend'), unlockForm=$('unlockForm'), unlockInput=$('unlockInput');
const searchInput=$('searchInput'), matchCount=$('matchCount'), tagWrap=$('tagChips');

/* ---------- LOOP UI ---------- */
function updateLoopDisplay(){
  const names=['Initiate','Seeker','Witness','Architect','Lightbearer'];
  loopStatus.textContent=`Current Loop: ${userLoop} – ${names[userLoop-1]||''}`;
}

/* ---------- GATE + FILTER ---------- */
const canSee  = r=>r.loopLevel<=userLoop && (!r.unlock||unlocked.includes(r.unlock));
const isLock  = r=>!canSee(r);
const matchFn = r=>{
  const gateOk = canSee(r)||isLock(r);
  if(!gateOk) return false;
  const txtOk = searchTerm? (r.name+r.body).toLowerCase().includes(searchTerm)||r.tags.some(t=>t.includes(searchTerm)):true;
  const tagOk = activeTag? r.tags.includes(activeTag):true;
  return txtOk&&tagOk;
};

/* ---------- RENDER ---------- */
function renderItem(r){
  const d=document.createElement('div');
  d.className='ritual-item'+(isLock(r)?' locked':'');
  d.innerHTML=`
    <div class="ritual-header"><strong>${r.name}</strong><span>Loop ${r.loopLevel} • ${new Date(r.createdAt).toLocaleString()}</span></div>
    <pre>${r.body}</pre>
    <small>tags: ${r.tags.join(', ')||'—'} • ${r.synced?'📤 synced':'⏳ pending'}</small>
    ${isLock(r)?'<div class="veil"><span>🔒 Locked</span></div>':''}`;
  listEl.appendChild(d);
}
function renderAll(){
  listEl.innerHTML='';
  const matches=archive.filter(matchFn);
  matches.forEach(renderItem);
  matchCount.textContent=matches.length?`(${matches.length})`:'';

  /* chips */
  tagWrap.innerHTML='';
  const tags=[...new Set(matches.flatMap(r=>r.tags))].sort();
  tags.forEach(t=>{
    const chip=document.createElement('div');
    chip.className='tag-chip'+(t===activeTag?' active':''); chip.textContent=t;
    chip.onclick=()=>{activeTag=activeTag===t?'':t; renderAll();};
    tagWrap.appendChild(chip);
  });
}

/* ---------- EVENTS ---------- */
bodyEl.addEventListener('input',()=>preview.textContent=bodyEl.value||'// Start typing above…');
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const rit=new Ritual({
    body:bodyEl.value.trim(),
    loopLevel:loopEl.value,
    tags:tagsEl.value.split(',').map(s=>s.trim()),
    unlock:unlockEl.value.trim()
  });
  await rit.finalize(); archive.unshift(rit); saveArchive(); renderAll(); rit.push();
  form.reset(); preview.textContent='// Start typing above…';
});
ascendBtn.onclick = ()=>setLoop(userLoop+1);
unlockForm.onsubmit=e=>{
  e.preventDefault(); 
  const v=unlockInput.value.trim();
  
  // Check if it's a passphrase
  if(PASS_MAP.hasOwnProperty(v.toLowerCase())){
    const newLevel = PASS_MAP[v.toLowerCase()];
    if (newLevel > userLoop) {
      // Check time lock
      if (!canUnlockByTime(newLevel)) {
        const times = getUnlockTimes();
        const lastUnlock = times[newLevel];
        const hoursLeft = TIME_LOCK_HOURS - (Date.now() - lastUnlock) / (1000 * 60 * 60);
        alert(`⏰ Time lock active. Please wait ${Math.ceil(hoursLeft)} more hours before unlocking this level.`);
        unlockInput.value='';
        return;
      }
      
      // Check reflection requirement
      if (!hasReflected(newLevel)) {
        showReflectionGate(newLevel, v);
        unlockInput.value='';
        return;
      }
      
      // All gates passed, unlock
      setLoop(newLevel);
      setUnlockTime(newLevel, Date.now());
      alert('🔓 Unlocked level ' + newLevel + '!');
    } else {
      alert('You already have this level or higher.');
    }
  } else {
    // Regular unlock word
    if(v){saveUnlock(v); renderAll();}
  }
  unlockInput.value='';
};
searchInput.oninput=e=>{searchTerm=e.target.value.trim().toLowerCase(); renderAll();};

/* ---------- INIT ---------- */
function initializeApp() {
  updateLoopDisplay(); 
  renderAll();
}

// Ensure DOM is ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

/* Reflection gate modal */
function showReflectionGate(level, passphrase) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: var(--panel); border: 1px solid var(--border);
    padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%;
    color: var(--fg);
  `;
  
  content.innerHTML = `
    <h2 style="color: var(--accent); margin-top: 0;">🪞 Reflection Gate</h2>
    <p>Before unlocking Level ${level}, please reflect on this question:</p>
    <p style="font-style: italic; color: var(--accent);">"${REFLECTION_GATES[level]}"</p>
    <textarea id="reflection-input" rows="6" style="width: 100%; margin: 1rem 0; padding: 0.5rem; background: #111; color: var(--fg); border: 1px solid var(--border); border-radius: 4px;" 
              placeholder="Share your honest reflection here..."></textarea>
    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
      <button id="reflection-cancel" style="background: #666; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="reflection-submit" style="background: var(--accent); color: #000; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">Submit & Unlock</button>
    </div>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Handle submission
  content.querySelector('#reflection-submit').onclick = () => {
    const reflection = content.querySelector('#reflection-input').value.trim();
    if (reflection.length < 10) {
      alert('Please provide a more thoughtful reflection (at least 10 characters).');
      return;
    }
    
    setReflection(level, reflection);
    setLoop(level);
    setUnlockTime(level, Date.now());
    document.body.removeChild(modal);
    alert('🔓 Reflection recorded. Level ' + level + ' unlocked!');
  };
  
  // Handle cancel
  content.querySelector('#reflection-cancel').onclick = () => {
    document.body.removeChild(modal);
  };
  
  // Close on background click
  modal.onclick = (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  };
}

/* ---------- DEBUG ---------- */
window.forgeTestRitual=async(txt='Console ritual')=>{
  const r=new Ritual({body:txt,loopLevel:3,tags:['shadow'],unlock:'MIRROR'});
  await r.finalize(); archive.unshift(r); saveArchive(); renderAll(); r.push(); return r;
};