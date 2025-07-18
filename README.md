

# 6ol Core System

**The 6ol Core is a ritual engine, Discord bot, and knowledge vault for progressive self-initiation, reflection, and community growth.**

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
- **Automation:** CI/CD, scheduled jobs, and persistent bot hosting

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
