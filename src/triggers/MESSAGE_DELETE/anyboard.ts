import * as Discord from '../../Discord';
import Trigger from '../../Trigger';

const anyboard = new Trigger({
  event: Discord.Event.MESSAGE_DELETE,
  handler: async ctx => {
    const { id: messageId, guild_id: guildId } = ctx.data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }
    // Try to get this board message. If this is `null`, then it means this message
    // hasn't been highlighted yet.
    const boardMsg = await ctx
      .anyboardMessages()
      .getByMessageId(guildId, messageId);
    if (!boardMsg) return;

    await ctx.api.deleteMessage(
      boardMsg.highlightChannelId,
      boardMsg.highlightMessageId,
    );

    await ctx.anyboardMessages().delete(guildId, messageId);
  },
});

export default anyboard;
