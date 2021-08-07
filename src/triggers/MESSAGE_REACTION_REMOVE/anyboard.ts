import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { formatEmoji } from '../../utils';
import {
  generateHighlightMessageContent,
  getHighestReaction,
} from '../MESSAGE_REACTION_ADD/anyboard';

const anyboard = new Trigger({
  event: Discord.Event.MESSAGE_REACTION_REMOVE,
  handler: async ctx => {
    const {
      user_id: ogUserId,
      guild_id: guildId,
      channel_id: ogChannelId,
      message_id: ogMessageId,
      emoji,
    } = ctx.data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    // Ignore the bot's own reactions.
    if (ogUserId === ctx.botUser.id) return;

    // Try to get this board message. If this is `null`, then it means this message
    // hasn't been highlighted yet.
    const boardMsg = await ctx
      .anyboardMessages()
      .getByMessageId(guildId, ogMessageId);
    if (!boardMsg) return;

    // Format emoji to a consistent representation consumable by the Discord UI.
    const formattedUnreactEmoji = formatEmoji(emoji);

    // If the un-reacted emoji isn't the most-reacted emoji, ignore this event.
    if (boardMsg.emoji !== formattedUnreactEmoji) return;

    // Get the original message.
    const ogMessage = await ctx.api.getChannelMessage(ogChannelId, ogMessageId);
    const ogReactions = ogMessage.reactions ?? [];

    const deleteMessage = async () => {
      await ctx.api.deleteMessage(
        boardMsg.highlightChannelId,
        boardMsg.highlightMessageId,
      );
      await ctx.anyboardMessages().delete(guildId, ogMessageId);
    };

    // If there are no reactions left, delete the message.
    if (ogReactions.length === 0) return deleteMessage();

    const highestReaction = getHighestReaction(ogReactions);
    const formattedHighestEmoji = formatEmoji(highestReaction.emoji);

    // Reaction count and emoji haven't changed, do nothing.
    if (
      boardMsg.reactionCount === highestReaction.count &&
      boardMsg.emoji === formattedHighestEmoji
    ) {
      return;
    }

    if (highestReaction.count === 0) {
      return deleteMessage();
    } else {
      await ctx.api.editMessage(
        boardMsg.highlightChannelId,
        boardMsg.highlightMessageId,
        {
          content: generateHighlightMessageContent(
            ogChannelId,
            highestReaction,
            formattedHighestEmoji,
          ),
        },
      );

      await ctx.anyboardMessages().update(guildId, ogMessageId, {
        reactionCount: highestReaction.count,
        emoji: formattedHighestEmoji,
      });
    }
  },
});

export default anyboard;
