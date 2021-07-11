import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { Config } from '../../database';
import { MailConfig } from '../../repository/ConfigRepo';

/**
 * Ensure correct permissions for the `Muted` role when channels are updated.
 */
const mailThread = new Trigger({
  event: Discord.Event.CHANNEL_DELETE,
  handler: async ctx => {
    const data = ctx.data;
    const { guild_id: guildId } = data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    const mailCfg = await ctx.config().get<MailConfig>(guildId, Config.MAIL);
    if (!mailCfg) {
      throw new Error('No mail configuration found');
    }
    if (!mailCfg.guildId) return;

    // Delete the mail thread in the database associated with that channel ID.
    // If none exists, then the deletion is a no-op.
    return ctx.mail().deleteByChannelId(mailCfg.guildId, data.id);
  },
});

export default mailThread;
