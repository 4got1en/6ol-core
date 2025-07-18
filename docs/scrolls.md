# [⬅️ Back to Start](../README.md) | [🏠 Back to Hub](../index.html)

<div align="center" style="margin:1.5rem 0;">
	<img src="../IMG_3069.png" alt="6ol Logo" width="60" style="border-radius:50%;box-shadow:0 2px 8px #0006;">
</div>
# Scrolls & Rituals in 6ol Core

## What Are Scrolls?
Scrolls are interactive guides, rituals, or knowledge fragments that users progress through as part of the 6ol journey. Each scroll is associated with a loop level and can be written in Markdown or HTML.

- **Location:** `scrolls/` and `rituals/` directories
- **Format:** Markdown (`.md`) or HTML (`.html`)
- **Naming:** Use descriptive, lowercase, hyphen-separated filenames (e.g., `daylight-initiation.md`)

## Structure of a Scroll
A scroll typically includes:
- **Title**
- **Loop Level**
- **Body Content** (ritual, reflection, or teaching)
- **Tags** (optional)
- **Unlock conditions** (optional)

Example (Markdown):
```
---
title: Daylight Initiation
loopLevel: 1
tags: [initiation, light, beginning]
---

Welcome to the first light of your journey...
```

## How Scrolls Are Used
- **Discord Bot:** `/whisper` command delivers scrolls based on user loop level.
- **Web Hub:** Scrolls are browsable via the GitHub Pages SPA.
- **Vault:** User reflections and ritual completions are journaled to the vault.

## Adding a New Scroll
1. Create a new `.md` or `.html` file in the appropriate directory.
2. Follow the structure above.
3. Add your scroll to the relevant loop in the bot config or whisper content map if needed.
4. Open a Pull Request with your new scroll and a brief description.

## Rituals
Rituals are special scrolls that mark key transitions or ceremonies. They follow the same format but may include additional metadata or unlock logic.

---

For questions or to propose a new ritual, open an issue or PR!
