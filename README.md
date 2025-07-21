

# 6ol Core System & DeitiesByDesign Codex

**The 6ol Core is a ritual engine, Discord bot, and knowledge vault for progressive self-initiation, reflection, and community growth. It now houses the sacred DeitiesByDesign Codex—foundational teachings for divine creative mastery.**

---

## 🚦 Start Here: The 6ol Funnel

1. **[Quick Start & Setup](#-quick-start)** — Get the system running in minutes.
2. **[Bot Usage & Commands](./DISCORD_BOT_README.md)** — Learn all bot features and how to use them.
3. **[Scrolls & Rituals Guide](./docs/scrolls.md)** — Understand and contribute to the scroll system.
4. **[Usage Examples](./docs/usage-examples.md)** — See real command examples and screenshots.
5. **[Monitoring & Automation](./docs/monitoring.md)** — Keep your system healthy and automated.
6. **[Contributing](./CONTRIBUTING.md)** — Join the project and contribute improvements.
7. **[Technical Summary](./IMPLEMENTATION_SUMMARY.md)** — Dive into the architecture and changelog.

---

## 🌞 Overview

- **Live Hub:** [6ol Core Hub](https://4got1en.github.io/6ol-core/) (SPA, GitHub Pages)
- **Discord Bot:** Ritual management, ascension, reflection, and whisper engine
- **Vault:** All user input and rituals are journaled to the [6ol-data-vault](https://github.com/4got1en/6ol-data-vault)
- **Scrolls:** Interactive HTML/Markdown scrolls for each loop/ritual
- **DeitiesByDesign Codex:** Sacred documents and foundational teachings for divine creative mastery
- **Automation:** CI/CD, scheduled jobs, and persistent bot hosting

### 📜 Sacred Documents & Teaching Systems

**6ol Loop System:** Progressive self-initiation through daylight, nightvision, and shadow work rituals
- Loop 1: Daylight Initiation (Passphrase: `sol`)
- Loop 2: Night-Vision Insight (Passphrase: `luna`)  
- Loop 3: Shadow Work Depth (Advanced practices)

**DeitiesByDesign Codex:** Foundational teachings for divine creative understanding
- **Foundation:** Onboarding scroll introducing core principles and practices
- **Loop 1:** Seeker Flame - Entry teachings for awakening divine creative essence
- **Progressive Teaching:** Structured advancement through sacred knowledge and practice

---

## 🛠️ Quick Start

1. **Clone & Install**
	```bash
	git clone https://github.com/4got1en/6ol-core.git
	cd 6ol-core
	npm install
	```
2. **Configure Environment**
	- Copy `.env.example` to `.env` and fill in your Discord/GitHub tokens and IDs.
	- Edit `config/bot-config.json` with your server's role/channel IDs.
3. **Run the Bot**
	```bash
	node bot.js
	# or use PM2 for persistent hosting
	pm2 start bot.js --name 6ol-bot
	```
4. **Invite the Bot** to your Discord server with required permissions.

---

## 📜 Sacred Scrolls & Teachings

The system contains two complementary teaching frameworks:

### 6ol Ritual System
Access progressive loop teachings through the scrolls directory:
- `scrolls/daylight.md` - Loop 1 foundation
- `scrolls/nightvision.md` - Loop 2 insights  
- `scrolls/shadowdepth.md` - Loop 3 mastery

### DeitiesByDesign Codex
Sacred foundational documents for divine creative understanding:
- `scrolls/dbd-onboarding-scroll.md` - Essential orientation and principles
- `scrolls/loop1-seeker-flame.md` - First teaching: awakening divine creative fire

**Getting Started with DeitiesByDesign:**
1. Begin with the onboarding scroll for foundational understanding
2. Establish a sacred journal for insights and practice documentation
3. Progress to Loop 1: Seeker Flame for structured development
4. Engage in the Three Kindling Practices: Sacred Creative Session, Wisdom Absorption, and Community Reflection

---

## 📚 Docs & Links

- [Bot Usage & Commands](./DISCORD_BOT_README.md)
- [Scrolls & Rituals Guide](./docs/scrolls.md)
- [Usage Examples](./docs/usage-examples.md)
- [Monitoring & Automation](./docs/monitoring.md)
- [Contributing](./CONTRIBUTING.md)
- [Technical Summary](./IMPLEMENTATION_SUMMARY.md)
- [6ol-data-vault](https://github.com/4got1en/6ol-data-vault) — Vault repo
- [Live Hub](https://4got1en.github.io/6ol-core/) — GitHub Pages SPA

---

## 🩺 Troubleshooting

- **Bot not responding?** Check `.env` and `bot-config.json` for correct tokens/IDs
- **Role errors?** Ensure bot has `Manage Roles` and is above target roles
- **Vault commit issues?** Check GitHub token and repo permissions
- **Workflow failures?** See Actions tab for logs and errors

---

© 2025 4got1en · 6ol Core
