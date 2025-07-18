/**
 * Auto-crossposts every new message in any Announcement channel (“news channel”)
 * so followers get the push-notification immediately—no manual Publish click.
 */
const { Events, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = client => {
  client.on(Events.MessageCreate, async message => {
    // 1. Skip DMs and non-announcement channels
    if (message.channel.type !== ChannelType.GuildAnnouncement) return;

    // 2. Crosspost only if the author is the bot itself OR someone with Manage-Messages
    const isSelf = message.author.id === client.user.id;
    const hasManageMessages =
      message.member?.permissionsIn(message.channel)
        .has(PermissionsBitField.Flags.ManageMessages);

    if (!isSelf && !hasManageMessages) return;

    // 3. Publish
    try {
      await message.crosspost();
      console.log(`[auto-crosspost] Published announcement ${message.id}`);
    } catch (err) {
      console.error('[auto-crosspost] Failed to crosspost:', err);
    }
  });
};
