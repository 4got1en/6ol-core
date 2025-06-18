/* ==========================================================
   6ol · Ritual Core · v2.2
   Drop Search: live filter & tag chips
   (built on v2.1 Veil + Ascension)
   ========================================================== */

/* ---------------  KEEP all previous imports / helpers / agents etc  --------------- */
/* ... everything up through your current render logic remains intact ...            */

/* ---------- SEARCH STATE ---------- */
let searchTerm = '';
let activeTag  = '';

const searchInput = document.getElementById('searchInput');
const matchCount  = document.getElementById('matchCount');
const tagWrap     = document.getElementById('tagChips');

/* ----------  Helpers  ---------- */
function filterMatch(ritual){
  // gate check first (blur/lock)
  const gateOk   = canView(ritual) || isLocked(ritual);
  if(!gateOk) return false;

  const textOk   = searchTerm ?
        (ritual.name+ritual.body).toLowerCase().includes(searchTerm) ||
        ritual.tags.some(t=>t.includes(searchTerm)) : true;
  const tagOk    = activeTag ? ritual.tags.includes(activeTag) : true;
  return textOk && tagOk;
}

/* ---- override renderAll to apply search ---- */
function renderAll(){
  listEl.innerHTML='';
  const matches = archive.filter(filterMatch);
  matches.forEach(renderItem);
  matchCount.textContent = matches.length ? `(${matches.length})` : '';
  // rebuild tag chips from visible rituals
  const tags = new Set();
  matches.forEach(r=>r.tags.forEach(t=>tags.add(t)));
  tagWrap.innerHTML='';
  [...tags].sort().forEach(t=>{
    const chip=document.createElement('div');
    chip.textContent=t; chip.className='tag-chip'+(t===activeTag?' active':'');
    chip.onclick=()=>{activeTag = (activeTag===t?'':t); renderAll();};
    tagWrap.appendChild(chip);
  });
}

/* ---------- Search listeners ---------- */
searchInput.addEventListener('input', e=>{
  searchTerm = e.target.value.trim().toLowerCase();
  renderAll();
});

/* ---------- Maintain previous listeners ---------- */
document.getElementById('ascend').addEventListener('click',()=>{
  setLoop(userLoopLevel+1); renderAll();
});
document.getElementById('unlockForm').addEventListener('submit',e=>{
  e.preventDefault();
  const v=document.getElementById('unlockInput').value.trim();
  if(v){addUnlock(v); renderAll(); document.getElementById('unlockInput').value='';}
});

/* ---------- INITIAL RENDER ---------- */
renderAll();