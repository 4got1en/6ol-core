# 6ol Control Center

> A phone-friendly dashboard in Markdown. Keep this file up to date with:
> 1. Active Projects  
> 2. Content Library (Scrolls & Rituals)  
> 3. Journal Entries  

---

## 📂 1. Projects

> Tracks every initiative in the 6ol ecosystem.

<!--
  For each project, use this format. Copy, paste, and update as things change.
-->

- **6ol Core Hub**  
  - Status: In Progress  
  - Priority: High  
  - GitHub Link: https://github.com/4got1en/6ol-core/index.html  
  - Loop Level: 2+ (Whisper Engine v3 expansion complete)  
  - Next Action: Enhance visual drops display & test Discord integration  
  - Tags: web, automation, ritual-logic, visual-drops, discord  

- **Navarre Email Kit**  
  - Status: Backlog  
  - Priority: Medium  
  - GitHub Link: (none yet—draft on phone)  
  - Loop Level: 0  
  - Next Action: Draft first email  
  - Tags: legal, email  

- **OnTheComeUp Podcast Captions**  
  - Status: Complete  
  - Priority: Low  
  - GitHub Link: https://github.com/4got1en/onthecomeup-captions  
  - Loop Level: 0  
  - Next Action: Begin next episode  
  - Tags: media, captions  

*(Add a new bullet for any new project. Keep this section alphabetical or order by priority—up to you.)*

---

## 📖 2. Content Library (Scrolls & Rituals)

> Houses each gated item, its passphrase, status, and link.  
> Whenever you add a new Scroll or Ritual, copy a block below and edit.

### Scrolls

- **Daylight Initiation**  
  - Type: Scroll  
  - Loop Level: 1  
  - Passphrase: `sol`  
  - Status: Published  
  - GitHub URL: https://github.com/4got1en/6ol-core/scrolls/daylight.md  
  - Summary: Introduce 6ol’s mission & first ritual.  

- **Night-Vision Insight**  
  - Type: Scroll  
  - Loop Level: 2  
  - Passphrase: `luna`  
  - Status: Draft  
  - GitHub URL: https://github.com/4got1en/6ol-core/scrolls/nightvision.md  
  - Summary: Self-reflection guide (in progress).  

- **Shadow Work Depth**  
  - Type: Scroll  
  - Loop Level: 3  
  - Passphrase: `umbra`  
  - Status: Draft  
  - GitHub URL: https://github.com/4got1en/6ol-core/scrolls/shadowdepth.md  
  - Summary: Advanced hidden insights (needs expansion).  

### Rituals

- **Morning Seed Offering**  
  - Type: Ritual  
  - Loop Level: 1  
  - Passphrase: `sol`  
  - Status: Published  
  - GitHub URL: https://github.com/4got1en/6ol-core/rituals/morningseed.md  
  - Summary: 10-minute journaling & intention-setting exercise.  

- **Midday Flow Check**  
  - Type: Ritual  
  - Loop Level: 1  
  - Passphrase: `sol`  
  - Status: Published  
  - GitHub URL: https://github.com/4got1en/6ol-core/rituals/middayflow.md  
  - Summary: Breath-work & quick gratitude pause.  

- **Evening Harvest**  
  - Type: Ritual  
  - Loop Level: 1  
  - Passphrase: `sol`  
  - Status: Published  
  - GitHub URL: https://github.com/4got1en/6ol-core/rituals/eveningharvest.md  
  - Summary: Black journal reflection & sync ritual.  

*(Copy any block above and edit the fields when you create a new Scroll or Ritual.)*

---

## 🌟 4. Whisper Engine v3 Features

> Advanced ritual logic, visual drops, and Discord integration added in latest expansion.

### Reflection Gates
- **Purpose**: Users must provide thoughtful reflection before unlocking new loop levels
- **Questions**:
  - Level 1: "What sparked your curiosity to begin this journey?"
  - Level 2: "How has your understanding of yourself shifted since beginning?"
  - Level 3: "What shadow within you is ready to be acknowledged?"
  - Level 4: "What patterns are you ready to architect into your life?"
  - Level 5: "How will you carry this light forward into the world?"
- **Requirement**: Minimum 10 characters of thoughtful reflection

### Time Locks
- **Purpose**: Enforce at least 24 hours between loop level unlocks
- **Implementation**: Tracks unlock timestamps in localStorage
- **Behavior**: Shows remaining wait time if user attempts early unlock

### Visual Drops (Whisper Upgrade 5 Foundation)
- **Purpose**: Generate image-rendered scrolls for enhanced delivery
- **Technology**: Canvas-based markdown-to-image rendering
- **Status**: Placeholder implementation ready for enhancement
- **Test**: Use "Generate Test Visual Drop" button in hub

### Discord Sync
- **Purpose**: Auto-post loop-bound scrolls to #whisper-engine channel
- **Schedule**: Daily at 13:00 UTC
- **Logic**: Selects scrolls based on user's current loop level
- **Configuration**: Webhook URL required for activation

---

## 📝 3. Journal Entries

> Log daily reflections here. Add one bullet per day, copy/paste the template below.

- **2025-06-05**  
  - Content: “Felt energized after Morning Seed”  
  - Related Ritual: Morning Seed Offering  
  - Loop Level: 1  
  - Mood: Reflective  

- **2025-06-04**  
  - Content: “Struggled to stay present midday”  
  - Related Ritual: Midday Flow Check  
  - Loop Level: 1  
  - Mood: Neutral  

*(To add today’s entry, copy this format and change the date. You can also remove “Related Ritual” or “Mood” if you don’t need them.)*

---

## 🚀 How to Use & Update

1. **Edit directly in GitHub (or your phone’s Markdown editor).**  
   - Anytime a project changes status (Backlog → In Progress → Complete), update that bullet under **Projects**.  
   - When you draft a new Scroll/Ritual, add a new block under **Content Library** with its details and GitHub URL.  
   - At the end of each day (or whenever you journal), append a new entry under **Journal Entries**.

2. **Linking in GitHub**  
   - If you later create a real file at `scrolls/daylight.md`, update the “GitHub URL” so it points to that Markdown or HTML file.  
   - Same for rituals: once you build `rituals/morningseed.md`, adjust the URL here.

3. **Naming conventions**  
   - Give every new file in GitHub a matching slug (e.g., `nightvision.md` for Night-Vision Insight).  
   - Keep “passphrase” lowercase (it’s case-sensitive in your `loop-engine.js`).

4. **No tables needed**  
   - Everything is bullet-list style—phone-friendly and easy to scan.  
   - If you want to reorder, just drag the bullets up or down in GitHub’s editor.

5. **Future automation**  
   - Whenever you add a new Scroll/Ritual in the repo, you’ll manually copy its metadata into this file.  
   - Down the line, you could write a simple Node.js script or GitHub Action to parse these blocks and cross-check with actual files, but that’s optional.

---

### Summary

- **Projects**: Keep one bullet per initiative, update status / priority / next action as you go.  
- **Content Library**: List each Scroll and Ritual with loop level, passphrase, status, summary, and a GitHub link.  
- **Journal Entries**: Daily reflections—date, content, ritual used, mood.

Once this is committed, you have a **living Control Center** entirely in Markdown—no Notion required. Whenever you ask, “What’s next?” you can scan this file to see:

- Which Project is highest priority.  
- Which Scroll/Ritual needs drafting or publishing.  
- Whether you’ve logged today’s journal.

Keep it updated and we’ll always have a single source of truth in your **`6ol-core`** repo.