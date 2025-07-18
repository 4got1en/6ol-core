# Discord Server Management Playbook (2025)

This playbook covers setup, automation, and maintenance for a modern Discord community, integrating native features and proven third-party bots.

---

## 1. Structure

- **Enable Community Mode**
  - Go to Server Settings → Enable Community.
  - Unlock announcement, forum, and events channels.
- **Set Up Core Channels**
  - Organize text, voice, Stage, and Forum channels for clarity.
- **Announcement Channels**
  - Create and configure for push notifications.
  - Use Auto-Crosspost bot for automation (see `/discord-playbook/auto-crosspost-example.js`).
- **Scheduled Events**
  - Use Discord’s event feature for RSVP and reminders.
- **Webhooks (Zapier/Pipedream)**
  - Automate content feeds (RSS, YouTube, Twitter) into channels (see `/discord-playbook/webhook-example.md`).

---

## 2. Moderation & Safety

- **AutoMod**
  - Configure keyword lists, spam/malware filters, and auto time-outs.
- **Mod Bots**
  - Add Dyno, Carl-bot, or MEE6 for infractions, mutes, and reaction roles (see `/discord-playbook/dyno-config-example.json`).
- **Anti-Raid & Logging**
  - Enable Discord’s raid protection; log activity in a private #mod-log.
- **Permission Audits**
  - Review roles quarterly (see `/discord-playbook/permission-audit.js`).

---

## 3. Engagement

- **Level/XP Bots**
  - Use Arcane or Tatsu for progression and role perks.
- **Event Bots**
  - Add Sesh for time-zone aware events and Google Calendar integration.
- **Mini-Games**
  - Enable Dank Memer, Wordle, or Discord Activities for fun.
- **Forum Channels**
  - Use for recurring Q&A and searchable threads.

---

## 4. Insights

- **Server Insights**
  - Monitor retention, invite sources, and active channels.
- **Statbot**
  - Track granular analytics, growth, and auto-promote active members (see `/discord-playbook/statbot-config-example.json`).
- **A/B Testing**
  - Use hidden channels and Statbot to compare engagement before rolling out changes.

---

## 5. Feedback & Maintenance

- **Monthly**: Prune channels, rotate event themes, update AutoMod lists.
- **Quarterly**: Run emoji polls or Google Forms for community feedback.
- **Iterate**: Use Statbot data to archive or refresh underperforming channels.
- **Sample Audit Script**: See `/discord-playbook/permission-audit.js`.

---

## Implementation Timeline

- **Day 1**: Enable Community, set up AutoMod, add Dyno.
- **Week 1**: Launch announcement/forum channels, add Sesh and Statbot.
- **Month 1**: Use Insights to identify hot channels; schedule a live event.
- **Ongoing**: Automate content, maintain civility, analyze data, and iterate.

---

## Files & Scripts

- `auto-crosspost-example.js`: Example bot for auto-crossposting announcements.
- `webhook-example.md`: Zapier/Pipedream webhook setup guide.
- `dyno-config-example.json`: Sample Dyno bot configuration.
- `statbot-config-example.json`: Sample Statbot configuration.
- `permission-audit.js`: Script to help audit Discord server permissions.
