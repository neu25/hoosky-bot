import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { authorAvatarUrl, messageLink } from '../../cdn';
import { transformAttachmentsToEmbeds } from '../MESSAGE_CREATE/_utils';
import { bold, hyperlink } from '../../format';

/**
 * TO DO:
 * be able to store board info without resetting when bot restarts
 * update board message when there's a new reaction instead of sending a new message
 * include files in starboard message
 * (extra) include replied messages in starboard message
 */
const starboard = new Trigger({
  event: Discord.Event.MESSAGE_REACTION_ADD,
  handler: async ctx => {
    const {
      guild_id: guildId,
      channel_id: channelId,
      message_id: messageId,
      emoji,
    } = ctx.data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    const board = await ctx.boards().getByEmoji(guildId, emoji.name);
    if (!board) return;

    const message = await ctx.api.getChannelMessage(channelId, messageId);
    const { author, referenced_message: referencedMessage } = message;
    const reactions = message.reactions!;

    const fields: Discord.EmbedField[] = [
      {
        name: 'Original',
        value: hyperlink(
          'Jump to message',
          messageLink(guildId, channelId, messageId),
        ),
      },
    ];
    if (referencedMessage) {
      const referencedContent = referencedMessage.content
        ? `>>> ${referencedMessage.content}`
        : '[Attachment]';

      fields.push({
        name: `Replying to ${referencedMessage.author.username}#${referencedMessage.author.discriminator}`,
        value: referencedContent,
      });
    }

    // Get the specific reaction type on the message matching the emoji added.
    const reactionForEmoji = reactions.find(r => r.emoji.name === emoji.name);
    if (!reactionForEmoji) return;

    if (reactionForEmoji.count >= board.minReactions) {
      await ctx.api.createMessage(channelId, {
        content: `${bold(
          reactionForEmoji.count.toLocaleString(),
        )} | <#${channelId}>`,
        embeds: [
          {
            fields,
            description: message.content,
            author: {
              name: `${author.username}#${author.discriminator}`,
              icon_url: authorAvatarUrl(author),
            },
            timestamp: message.timestamp,
            type: Discord.EmbedType.RICH,
          },
          ...transformAttachmentsToEmbeds(message.attachments),
        ],
      });
      return;
    }
  },
});

export default starboard;
