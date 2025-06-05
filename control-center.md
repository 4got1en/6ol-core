# 🧭 6ol Control Center · Notion Template v0.1
_Lightweight, import-by-eye starter schema you can re-create in the Notion app in under 10 minutes._

---

## 1. Master Dashboard (page)

Create a top-level Notion **Page** named **“🧭 Control Center”**.  
Inside it, add the four databases below, plus a “Today” linked view at the top that filters for items scheduled/overdue today.

---

## 2. Databases & Properties

### A. **📂 Projects** (Table)
| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Short, actionable project name (“Temple Hub v0.2”) |
| Status | Select ⇒ 📈Idea / 🚧Active / ✅Complete / 💤On Hold |
| Pillar | Select ⇒ 🌞Core / 🌒Active / 🌑Backlog (mirrors roadmap layers) |
| GitHub File | URL | Link to the full-file source in 6ol-core |
| Next Action | Text | Single next brick to lay |
| Owner | Person | Usually “Ellery Costa” – future-proof for collaborators |
| Last Updated | Last edited time | Auto |

### B. **📜 Scrolls** (Table)
| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Scroll title (“Shadow Vow”) |
| Level Gate | Select ⇒ 1–10 | Loop-level required to unlock |
| Passphrase | Text | Plain text for now; later hashed & shadow-locked |
| GitHub Path | URL | HTML file in repo |
| Status | Select ⇒ ✏️Draft / 🔒Locked / 🔓Live |
| Updated | Last edited time | Auto |

### C. **⏳ Rituals** (Table)
| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Ritual name (“Morning Loop”) |
| Frequency | Select ⇒ Daily / Weekly / Monthly / On-Demand |
| Duration (min) | Number | Target minutes |
| Energy Loop Phase | Select ⇒ ☀️Create / 🌱Automate / 🌾Harvest / 🌑Reflect |
| Notes | Text | Tips, links, Apple Health shortcut IDs, etc. |

### D. **💲 Income Streams** (Table)
| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Stream name (“UnitedMasters daily payouts”) |
| Platform | Select ⇒ UM / Acorns / CashApp / PayPal / etc. |
| Avg $/mo | Number (USD) | Rolling 3-month average |
| Automated? | Checkbox | True once fully hands-off |
| Notes | Text | Webhooks, actions, blockers |

---

## 3. After you reproduce this in Notion

1. **Link the page** in your roadmap under Layer-2 like so: