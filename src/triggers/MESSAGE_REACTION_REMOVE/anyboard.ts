import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { formatEmoji } from '../../utils';
import { generateHighlightMessageContent } from '../MESSAGE_REACTION_ADD/anyboard';

const anyboard = new Trigger({
  event: Discord.Event.MESSAGE_REACTION_REMOVE,
  handler: async ctx => {
    const {
      user_id: reactorUserId,
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
      emoji,
    } = ctx.data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    // Ignore the bot's own reactions.
    if (reactorUserId === ctx.botUser.id) return;

    // Try to get this board message. If this is `null`, then it means this message
    // hasn't been highlighted yet.
    const boardMsg = await ctx
      .anyboardMessages()
      .getByMessageId(guildId, messageId);
    if (!boardMsg) return;

    // Get the original message.
    const message = await ctx.api.getChannelMessage(channelId, messageId);
    const reactions = message.reactions ?? [];

    const deleteMessage = async () => {
      await ctx.api.deleteMessage(
        boardMsg.highlightChannelId,
        boardMsg.highlightMessageId,
      );
      await ctx.anyboardMessages().delete(guildId, messageId);
    };

    // Get the specific reaction type on the message matching the emoji added.
    const reactionForEmoji = reactions.find(r => r.emoji.name === emoji.name);
    if (!reactionForEmoji) {
      return deleteMessage();
    }

    // Reaction count hasn't changed, do nothing.
    if (boardMsg.reactionCount === reactionForEmoji.count) return;

    if (reactionForEmoji.count === 0) {
      return deleteMessage();
    } else {
      // Format emoji to a consistent representation consumable by the Discord UI.
      const formattedEmoji = formatEmoji(emoji);

      await ctx.api.editMessage(
        boardMsg.highlightChannelId,
        boardMsg.highlightMessageId,
        {
          content: generateHighlightMessageContent(
            channelId,
            reactionForEmoji,
            formattedEmoji,
          ),
        },
      );

      await ctx.anyboardMessages().update(guildId, messageId, {
        reactionCount: reactionForEmoji.count,
      });
    }
  },
});

export default anyboard;
