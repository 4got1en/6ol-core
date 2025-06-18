/* ==========================================================
   6ol · Ritual Core · v2.2
   Drop Search: live filter & tag chips
   ========================================================== */

/* --- everything up to render logic is identical to v2.1 (Veil).            */
/* --- only additions: search state, tag chips, renderAll() filter, listeners*/

let searchTerm = '';
let tagFilter  = null;   // active tag click

/* ----------  Render Logic ---------- */
function textMatch(r, term) {
  if (!term) return true;
  term = term.toLowerCase();
  return r.name.toLowerCase().includes(term)
      || r.body.toLowerCase().includes(term)
      || r.tags.some(t=>t.toLowerCase().includes(term));
}
function tagMatch(r) {
  return tagFilter ? r.tags.includes(tagFilter) : true;
}
function renderItem(ritual) {
  const locked = isLocked(ritual);
  const el = document.createElement('div');
  el.className = 'ritual-item' + (locked ? ' locked' : '');
  el.innerHTML = `
    <div class="ritual-header">
      <strong>${ritual.name}</strong>
      <span>Loop ${ritual.loopLevel} • ${new Date(ritual.createdAt).toLocaleString()}</span>
    </div>
    <pre>${ritual.body}</pre>
    <small>tags: ${ritual.tags.join(', ') || '—'} • ${ritual.synced ? '📤 synced' : '⏳ pending'}</small>
    ${locked ? `<div class="veil"><span>🔒 Locked</span></div>` : ''}
  `;
  listEl.appendChild(el);
}

function renderAll() {
  listEl.innerHTML = '';

  const visible = archive.filter(r => canView(r) || isLocked(r))   // include locked blurred
                         .filter(r => textMatch(r, searchTerm))
                         .filter(r => tagMatch(r));

  visible.forEach(renderItem);
  document.getElementById('matchCount').textContent =
      searchTerm || tagFilter ? `${visible.length} match${visible.length!==1?'es':''}` : '';
  rebuildTagChips();
}

/* ----------  Tag Chips ---------- */
function rebuildTagChips() {
  const chipBox = document.getElementById('tagChips');
  chipBox.innerHTML = '';
  const allTags = new Set();
  archive.forEach(r=>r.tags.forEach(t=>allTags.add(t)));
  [...allTags].sort().forEach(tag=>{
    const chip = document.createElement('span');
    chip.className = 'chip' + (tagFilter===tag?' active':'');
    chip.textContent = tag;
    chip.onclick = ()=>{ tagFilter = tagFilter===tag ? null : tag; renderAll(); };
    chipBox.appendChild(chip);
  });
}

/* ----------  Search & Clear Listeners ---------- */
document.getElementById('searchBox').addEventListener('input', e=>{
  searchTerm = e.target.value.trim();
  renderAll();
});
document.getElementById('clearBtn').addEventListener('click', ()=>{
  searchTerm=''; tagFilter=null;
  document.getElementById('searchBox').value='';
  renderAll();
});

/* ----------  Keep previous listeners but call renderAll() on changes ---------- */
document.getElementById('ascend').addEventListener('click', () => { setLoop(userLoopLevel+1); renderAll(); });
document.getElementById('unlockForm').addEventListener('submit', e=>{
  e.preventDefault();
  const val=document.getElementById('unlockInput').value.trim();
  if(val){ addUnlock(val); renderAll(); document.getElementById('unlockInput').value=''; }
});

/* ----------  Initial Render ---------- */
renderAll();