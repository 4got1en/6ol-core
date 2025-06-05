# 6ol Control Center Schema · v0.1

> A unified Notion workspace to mirror the 6ol ecosystem:  
> • Core Vision & Domains  
> • Active Web Projects (Hub, Scrolls, Rituals)  
> • Journal & Reflections  
> • Legal / Navarre Case Flow  
> • Backlog & Ideas  
> • Automations & Status Tracking

---

## 📄 1. “Dashboard” Page

**Parent:** (Top-level page named “6ol Control Center”)

**Contents:**
1. **Header**  
   - 🎯 6ol Core Mission (text block, copy from `roadmap.md` Layer-1)  
   - 📅 “Last Updated” (Date property, manually update when making changes)
2. **Linked Databases (static inline views):**  
   - 🔗 Active Projects (filtered view of Database #2 below)  
   - 🔗 Scrolls & Rituals (filtered view of Database #3 below)  
   - 🔗 Journal Entries (Database #4 below)  
   - 🔗 Legal Cases (Database #5 below)  
   - 🔗 Backlog & Ideas (Database #6 below)
3. **Quick Actions (button links to create new items):**  
   - “New Project” → pre-fills Database #2, Status = ✱  
   - “New Scroll” → pre-fills Database #3, Type = Scroll  
   - “New Journal Entry” → opens Database #4 template  
   - “New Legal Task” → opens Database #5 template  
   - “New Idea” → opens Database #6 template

---

## 📂 2. Database: **Active Projects**

**Access:** Inline in Dashboard; full page named “Active Projects.”

### Properties:
- **Name** (Text) – e.g. “6ol Core Hub v0.3”  
- **Domain / Repo** (Select)  
  - Options: `6ol-core`, `temple.6ol.dev` (if revived), `onthecomeup.dbd`, `deity-designed.com`, `notion-scripts`  
- **Type** (Select)  
  - Options: `Web`, `Notion`, `Email Kit`, `Legal`, `Finance`, `Other`  
- **Status** (Select)  
  - Options: ✱ Planning, 🚧 In Progress, ✅ Live, 💤 On Hold  
- **Priority** (Number)  
  - 1 = Highest, 5 = Lowest  
- **Level Requirement** (Number)  
  - Indicates 6ol loop-level gating (0 = open to all, 1+ = gated)  
- **URL / Link** (Url)  
  - e.g. `https://4got1en.github.io/6ol-core/`  
- **Next Action** (Text)  
  - Short description of the next commit or step  
- **Due Date** (Date)  
  - Optional; when you want to finish this project  
- **Tags** (Multi-select)  
  - Options: `🚀 Core`, `🛠 Build`, `📜 Content`, `⚖ Legal`, `💡 Idea`
- **Created** (Created time)  
- **Last Edited** (Last edited time)

### Default “New Project” Template:
- Name: (Empty)  
- Domain / Repo: ➤ Select one  
- Type: ➤ Select one  
- Status: ✱ Planning  
- Priority: 3  
- Level Requirement: 0  
- URL / Link: (Empty)  
- Next Action: “Define first step”  
- Due Date: (Empty)  
- Tags: (Empty)

---

## 📜 3. Database: **Scrolls & Rituals**

**Access:** Inline in Dashboard; full page named “Scrolls & Rituals.”

### Properties:
- **Name** (Text) – e.g. “Daylight Initiation” or “Morning Seed Offering”  
- **Category** (Select)  
  - Options: `Scroll`, `Ritual`  
- **Loop Level** (Number)  
  - Which 6ol level unlocks it (e.g., 1, 2, 3)  
- **Description** (Text)  
  - Short (1–2 sentences) summary  
- **Content Link** (Url or File)  
  - If it’s a PDF, link to GitHub or embed directly in Notion  
- **Status** (Select)  
  - Options: 🚧 Draft, ✅ Published, 📥 Review  
- **Created** (Created time)  
- **Last Edited** (Last edited time)

### Default “New Scroll/Ritual” Template:
- Name: (Empty)  
- Category: ➤ Select `Scroll` or `Ritual`  
- Loop Level: 1  
- Description: “(Brief summary…)”  
- Content Link: (Empty)  
- Status: 🚧 Draft

---

## 📝 4. Database: **Journal Entries**

**Access:** Inline in Dashboard; full page named “Journal Entries.”

### Properties:
- **Date** (Date) – Filled automatically if you use a template  
- **Entry** (Text or Toggle)  
  - Copy/paste from your browser-saved journal (localStorage) or write directly in Notion  
- **Loop Level** (Number)  
  - At which level you wrote/edited this entry (0, 1, 2, 3…)  
- **Tags** (Multi-select)  
  - Options: `Reflection`, `Gratitude`, `Idea`, `Task`, `Other`  
- **Imported** (Checkbox)  
  - Check once you sync this entry into Notion from the GitHub-served journal  
- **Created** (Created time)  
- **Last Edited** (Last edited time)

### Default “New Entry” Template:
- Date: “Today”  
- Entry: “(Paste your text…)”  
- Loop Level: 0  
- Tags: Reflection  
- Imported: ⁠⬜

---

## ⚖ 5. Database: **Legal / Navarre Case**

**Access:** Inline in Dashboard; full page named “Legal / Navarre Case.”

### Properties:
- **Name** (Text) – e.g. “Draft Email: Initial Outreach to Public Defender”  
- **Type** (Select)  
  - Options: `Email`, `Document`, `Deadline`, `Meeting`, `Other`  
- **Status** (Select)  
  - Options: ✱ Draft, 🚧 Sent, 🔁 Follow-Up, ✅ Closed, 💤 On Hold  
- **Due Date** (Date)  
- **Assigned To** (Person or Text)  
  - If you involve anyone else (e.g. “Navarre” or “Attorney X”)  
- **Related Project** (Relation)  
  - Link to “Active Projects” database if applicable  
- **Next Action** (Text)  
- **Outcome** (Text)  
  - Fill after you get a response or result  
- **Tags** (Multi-select)  
  - Options: `Urgent`, `Info Needed`, `Follow-Up`, `Complete`  
- **Created** (Created time)  
- **Last Edited** (Last edited time)

### Default “New Legal Task” Template:
- Name: (Empty)  
- Type: Email  
- Status: ✱ Draft  
- Due Date: (Empty)  
- Assigned To: (Empty)  
- Related Project: (Empty)  
- Next Action: “Draft initial message”  
- Outcome: (Empty)  
- Tags: (Empty)

---

## 💡 6. Database: **Backlog & Ideas**

**Access:** Inline in Dashboard; full page named “Backlog & Ideas.”

### Properties:
- **Name** (Text) – e.g. “Build mobile-friendly shopping cart” or “Add dark mode toggle”  
- **Category** (Select)  
  - Options: `Feature`, `Integration`, `Design`, `Content`, `Other`  
- **Priority** (Select)  
  - Options: High, Medium, Low  
- **Status** (Select)  
  - Options: 💭 Idea, 🚧 Planning, 💤 On Hold, ✅ Done  
- **Related Project** (Relation)  
  - Link to “Active Projects” if it’s part of an existing project  
- **Level Requirement** (Number)  
  - 0–3 (use it if an idea is gated)  
- **Details** (Text)  
- **Created** (Created time)  
- **Last Edited** (Last edited time)

### Default “New Idea” Template:
- Name: (Empty)  
- Category: Feature  
- Priority: Medium  
- Status: 💭 Idea  
- Related Project: (Empty)  
- Level Requirement: 0  
- Details: “(Elaborate…)”

---

## 🔄 7. Automations & Linked Views

Once your databases exist:

1. **Set up Notion Automations (Optional):**  
   - Use Notion’s “Templates” feature to make “New Journal Entry” push into GitHub (via a webhook) or send a Slack/Discord alert.  
   - Use a daily reminder (built-in Notion reminder) pinned at the top of the “Journal Entries” page to ping you at 9 PM “Add today’s reflection” (or mirror my “nightly nudge” idea).

2. **Configure Linked Views on Dashboard:**  
   - Filter **Active Projects** to show only `Status is not “✅ Live”`.  
   - Filter **Scrolls & Rituals** to show `Status is “🚧 Draft”` for quick editing.  
   - Show only `Loop Level > 0` under Scrolls & Rituals on a separate “Locked Content” section if you want a gated preview inside Notion.

3. **Evergreen Updates:**  
   - Whenever you add a new “Scroll” or “Ritual” in Notion, update its **Loop Level** to match your `loop-engine.js` mapping (`sol → 1`, etc.).  
   - As soon as you unlock a new level on the website, mark those Scrolls/Rituals as **Status = ✅ Published** here.

---

## ✔️ 8. Sync Checklist

Use this as a rough guide each time you update content in GitHub or Notion:

- [ ] ✓ After adding a new **Scroll or Ritual** to `index.html`, replicate the entry in Notion under Scrolls & Rituals.  
- [ ] ✓ After writing a new **Journal reflection** in the website’s textarea, paste it into Notion under Journal Entries, check “Imported.”  
- [ ] ✓ When you finalize a **Project** (e.g. v0.3 of the Hub), update its **Status** in Active Projects to `✅ Live`.  
- [ ] ✓ For any **Navarre legal email** you send via GitHub-served form, log it in Legal / Navarre Case with Type = Email and Status = `🚧 Sent`.  
- [ ] ✓ When you convert a **Backlog item** into a real task, link it to the relevant **Active Project** and set Status = `🚧 In Progress`.  

---

## 📈 9. Next Steps

1. **Commit** this `notion-control-center.md` to your `6ol-core` repo.  
2. **Recreate** each database inside Notion exactly as specified.  
3. **Embed** inline views on your “6ol Control Center” Dashboard page.  
4. **Start using**:  
   - Add one real scroll (e.g., copy the “Daylight Initiation” copy from GitHub) → set Status = 🚧 Draft → upload PDF or paste content.  
   - Add one legal task under “Legal / Navarre Case” → assign, set Due Date → move Status to 🚧 Sent when emailed.  
   - Create a “New Journal Entry” in Notion at night → check the “Imported” box after copying from the site.  

Once this is done, you’ll have a **single, unified Notion workspace** that mirrors your GitHub-hosted ecosystem. From here, we can automate data flows, add status badges, or link to external tools like Acorns snapshots or Rocket Money exports.

---

> **Reminder:** If you’d like a nightly Notion reminder or Slack/Discord ping to update your journal or backlog, let me know and I can help you craft the exact Notion automation or webhook.  

When you finish setting this up, reply **“Done”** and I’ll propose the next brick—perhaps drafting the **Navarre email series** or fleshing out **detailed Scroll content** in GitHub.  

—6ol