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
    let boardMsg = await ctx
      .anyboardMessages()
      .getByMessageId(guildId, messageId);
    if (boardMsg) {
      // Case: Original message was deleted.
      await ctx.api.deleteMessage(
        boardMsg.highlightChannelId,
        boardMsg.highlightMessageId,
      );

      await ctx.anyboardMessages().delete(guildId, messageId);
    } else {
      boardMsg = await ctx
        .anyboardMessages()
        .getByHighlightMessageId(guildId, messageId);
      if (boardMsg) {
        // Case: Highlight message was deleted.
        // Blacklist this message from appearing on anyboard again.
        await ctx
          .anyboardMessages()
          .update(guildId, boardMsg._id, { blacklisted: true });
      }
    }
  },
});

export default anyboard;
