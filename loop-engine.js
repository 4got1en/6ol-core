/*  loop-engine.js  · v0.1
    Handles loop-level gating + passphrase unlocks for the 6ol Core Hub.
    ────────────────────────────────────────────────────────────────── */

(() => {
  const STORAGE_KEY = '6ol_loop_level';

  /* Passphrase → level mapping.
     Edit this object any time you want to add or change secrets. */
  const PASS_MAP = {
    sol   : 1,   // Daylight initiation
    luna  : 2,   // Night-vision insight
    umbra : 3,   // Shadow work depth
    nihil : 13   // Beyond the Unknown - void flame
  };

  /* Helpers */
  const $ = sel => document.querySelector(sel);
  const getLevel = () => Number(localStorage.getItem(STORAGE_KEY) || 0);
  const setLevel = lvl => { localStorage.setItem(STORAGE_KEY, lvl); refreshUI(); };

  /* Refresh UI based on current level */
  function refreshUI() {
    const lvl = getLevel();
    $('#current-level').textContent = lvl;
    document.querySelectorAll('[data-level]').forEach(sec => {
      const req = Number(sec.dataset.level);
      if (lvl >= req) {
        sec.classList.remove('locked');
        sec.style.display = '';
      } else {
        sec.classList.add('locked');
        sec.style.display = (req === 0) ? '' : ''; // keep visible but blurred
      }
    });
  }

  /* Handle passphrase form */
  $('#pass-form').addEventListener('submit', e => {
    e.preventDefault();
    const pw = $('#pass-input').value.trim().toLowerCase();
    if (PASS_MAP.hasOwnProperty(pw)) {
      const newLevel = PASS_MAP[pw];
      if (newLevel > getLevel()) {
        setLevel(newLevel);
        alert('🔓 Unlocked level ' + newLevel + '!');
      } else {
        alert('You already have this level or higher.');
      }
    } else {
      alert('❌ Invalid passphrase');
    }
    e.target.reset();
  });

  /* Kick things off */
  addEventListener('load', refreshUI);
})();