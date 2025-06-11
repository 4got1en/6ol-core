// ritual-core.js

const RitualCore = (() => {
  let level = 1;
  let passphrase = null;

  const init = (userLevel, userPassphrase = null) => {
    level = userLevel;
    passphrase = userPassphrase;
    console.log(`🔮 Ritual Core initialized. Level: ${level}`);
  };

  const beginRitual = () => {
    console.log("🌒 Ritual initiated...");
    // Example: trigger animation or transition
    document.body.classList.add("ritual-active");

    // Unlock content based on level or passphrase
    unlockByLevel();
    unlockByPassphrase();

    // TODO: Trigger ritual sound, visual, journal sync, etc.
  };

  const unlockByLevel = () => {
    const locked = document.querySelectorAll(`[data-lock-level]`);
    locked.forEach(el => {
      const requiredLevel = parseInt(el.getAttribute("data-lock-level"), 10);
      if (level >= requiredLevel) {
        el.classList.remove("locked");
        el.classList.add("unlocked");
        el.style.display = "block";
      }
    });
  };

  const unlockByPassphrase = () => {
    if (!passphrase) return;
    const locked = document.querySelectorAll(`[data-lock-passphrase]`);
    locked.forEach(el => {
      const required = el.getAttribute("data-lock-passphrase");
      if (passphrase.toLowerCase() === required.toLowerCase()) {
        el.classList.remove("locked");
        el.classList.add("unlocked");
        el.style.display = "block";
      }
    });
  };

  return {
    init,
    beginRitual,
  };
})();