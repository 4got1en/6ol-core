/* ==========================================================
   6ol · In-Page Terminal  v1.0
   ----------------------------------------------------------
   Basic commands:
     help                 – list commands
     setkey KEY VALUE     – store in localStorage
     getkey KEY           – retrieve value
     eval  <js>           – run JS (dangerous but handy)
     clear                – wipe terminal view
   ========================================================== */

const termOut  = document.getElementById('terminal-output');
const termIn   = document.getElementById('terminal-input');
const history  = [];
let   histPtr  = -1;

/* --- helpers --- */
const print = (msg, cls='') => {
  const span = document.createElement('span');
  if (cls) span.style.color = cls;
  span.textContent = msg;
  termOut.appendChild(span);
  termOut.scrollTop = termOut.scrollHeight;
};

const commands = {
  help() {
    print('Commands:\n  help\n  setkey KEY VALUE\n  getkey KEY\n  eval <js>\n  clear');
  },
  setkey(key, ...val) {
    if (!key || !val.length) return print('Usage: setkey KEY VALUE', 'orange');
    localStorage.setItem(key, val.join(' '));
    print(`saved ${key}`);
  },
  getkey(key) {
    if (!key) return print('Usage: getkey KEY', 'orange');
    const v = localStorage.getItem(key);
    print(v !== null ? `${key} = ${v}` : `${key} not set`, v ? '#0f0' : 'red');
  },
  eval(...code) {
    try { print(String(eval(code.join(' '))).substring(0,400)); }
    catch(err) { print(err.message, 'red'); }
  },
  clear() {
    termOut.innerHTML = '';
  }
};

/* --- input handler --- */
termIn.addEventListener('keydown', e=>{
  if (e.key === 'Enter') {
    e.preventDefault();
    const line = termIn.value.trim();
    if (!line) return;
    print(`> ${line}`, '#f5c84c');
    history.unshift(line); histPtr = -1;
    termIn.value = '';

    const [cmd, ...args] = line.split(/\s+/);
    if (commands[cmd]) commands[cmd](...args);
    else print(`Unknown command: ${cmd}`, 'orange');
  }
  /* history nav */
  else if (e.key === 'ArrowUp') {
    if (history.length && histPtr < history.length-1) termIn.value = history[++histPtr];
  }
  else if (e.key === 'ArrowDown') {
    if (histPtr > 0) termIn.value = history[--histPtr];
    else { histPtr = -1; termIn.value=''; }
  }
});