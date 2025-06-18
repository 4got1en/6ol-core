/* ==========================================================
   6ol · Ritual Core · v2.1
   Drop Veil: blurred-lock visuals for gated rituals
   (builds on Loop Ascension + Passphrase unlock)
   ========================================================== */

import { uuid, nowISO, trap, agents, RitualBase } from './rituals_core_helpers.js';
/* ^ If you do NOT have helpers split out, simply remove the import line
   and keep the full code exactly as before plus the tweaks below.         */

/* ------------  everything from your v2.0 file remains unchanged
                 EXCEPT renderItem() and renderAll() -------------------- */

/* ----------  Gate Check ---------- */
function canView(ritual) {
  if (ritual.loopLevel > userLoopLevel) return false;
  if (ritual.unlock && !unlockedPassphrases.includes(ritual.unlock)) return false;
  return true;
}
function isLocked(ritual) { return !canView(ritual); }

/* ----------  Render Logic ---------- */
function renderItem(ritual) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ritual-item' + (isLocked(ritual) ? ' locked' : '');
  wrapper.innerHTML = `
    <div class="ritual-header">
      <strong>${ritual.name}</strong>
      <span>Loop ${ritual.loopLevel} • ${new Date(ritual.createdAt).toLocaleString()}</span>
    </div>
    <pre>${ritual.body}</pre>
    <small>tags: ${ritual.tags.join(', ') || '—'} • ${ritual.synced ? '📤 synced' : '⏳ pending'}</small>
    ${isLocked(ritual) ? `<div class="veil"><span>🔒 Locked</span></div>` : ''}
  `;
  listEl.appendChild(wrapper);
}

function renderAll() {
  listEl.innerHTML = '';
  archive.forEach(renderItem);  // render all (locked ones blurred)
}

/* ---------------- rest of file identical to your v2.0 ----------------- */

/* Example: make sure unlock + ascend rerenders */
document.getElementById('ascend').addEventListener('click', () => {
  setLoop(userLoopLevel + 1);
  renderAll();
});
document.getElementById('unlockForm').addEventListener('submit', e => {
  e.preventDefault();
  const val = document.getElementById('unlockInput').value.trim();
  if (val) {
    addUnlock(val);
    renderAll();
    document.getElementById('unlockInput').value = '';
  }
});