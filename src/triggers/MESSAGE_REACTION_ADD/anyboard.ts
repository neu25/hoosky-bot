import * as Discord from '../../Discord';
import Trigger from '../../Trigger';
import { authorAvatarUrl, messageLink } from '../../cdn';
import { transformAttachmentsToEmbeds } from '../MESSAGE_CREATE/_utils';
import { bold, EN_SPACE, hyperlink } from '../../format';
import { formatEmoji } from '../../utils';
import { AnyboardConfig } from '../../repository/ConfigRepo';
import { Config } from '../../database';

export const generateHighlightMessageContent = (
  channelId: string,
  reaction: Discord.Reaction,
  emojiString: string,
): string => {
  return [
    bold(reaction.count.toLocaleString()),
    ' × ',
    emojiString,
    `${EN_SPACE}|${EN_SPACE}`,
    `<#${channelId}>`,
  ].join('');
};

const anyboard = new Trigger({
  event: Discord.Event.MESSAGE_REACTION_ADD,
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

    // Format emoji to a consistent representation consumable by the Discord UI.
    const formattedEmoji = formatEmoji(emoji);

    // Get the original message.
    const ogMessage = await ctx.api.getChannelMessage(ogChannelId, ogMessageId);
    const { author, referenced_message: referencedMessage } = ogMessage;
    const ogReactions = ogMessage.reactions ?? [];

    // Get the specific reaction type on the message matching the emoji added.
    const reactionForEmoji = ogReactions.find(r => r.emoji.name === emoji.name);
    if (!reactionForEmoji) return;

    // Try to get this board message. If this is `null`, then it means this message
    // hasn't been highlighted yet.
    const boardMsg = await ctx
      .anyboardMessages()
      .getByMessageId(guildId, ogMessageId);
    if (boardMsg) {
      // Reaction count hasn't changed, do nothing.
      if (boardMsg.reactionCount === reactionForEmoji.count) return;

      await ctx.api.editMessage(
        boardMsg.highlightChannelId,
        boardMsg.highlightMessageId,
        {
          content: generateHighlightMessageContent(
            ogChannelId,
            reactionForEmoji,
            formattedEmoji,
          ),
        },
      );

      await ctx.anyboardMessages().update(guildId, ogMessageId, {
        reactionCount: reactionForEmoji.count,
      });

      return;
    }

    // Get config and create a new anyboard highlight.
    const anyboardCfg = await ctx
      .config()
      .get<AnyboardConfig>(guildId, Config.ANYBOARD);
    if (!anyboardCfg?.channelId || !anyboardCfg?.minReactionCount) return;

    // If the reaction is in the anyboard channel, do nothing.
    if (anyboardCfg.channelId === ogChannelId) return;

    const fields: Discord.EmbedField[] = [
      {
        name: 'Original',
        value: hyperlink(
          'Jump to message',
          messageLink(guildId, ogChannelId, ogMessageId),
        ),
      },
    ];
    if (referencedMessage) {
      const refAuthor = referencedMessage.author;
      const refContent = referencedMessage.content
        ? `>>> ${referencedMessage.content}`
        : '[Attachment]';

      const refMember = await ctx.api.getGuildMember(guildId, refAuthor.id);

      let refAuthorName: string;
      if (refMember.nick) {
        refAuthorName = `${refMember.nick} (${refAuthor.username}#${refAuthor.discriminator})`;
      } else {
        refAuthorName = `${refAuthor.username}#${refAuthor.discriminator}`;
      }

      fields.push({
        name: `Replying to ${refAuthorName}`,
        value: refContent,
      });
    }

    if (reactionForEmoji.count >= anyboardCfg.minReactionCount) {
      const authorMember = await ctx.api.getGuildMember(guildId, author.id);
      const authorName = authorMember.nick ?? author.username;

      const highlightMsg = await ctx.api.createMessage(anyboardCfg.channelId, {
        content: generateHighlightMessageContent(
          ogChannelId,
          reactionForEmoji,
          formattedEmoji,
        ),
        embeds: [
          {
            fields,
            description: ogMessage.content,
            author: {
              name: authorName,
              icon_url: authorAvatarUrl(author),
            },
            timestamp: ogMessage.timestamp,
            color: Discord.Color.WARNING,
            type: Discord.EmbedType.RICH,
          },
          ...transformAttachmentsToEmbeds(ogMessage.attachments),
        ],
      });

      await ctx.anyboardMessages().create(guildId, {
        _id: ogMessageId,
        userId: author.id,
        highlightMessageId: highlightMsg.id,
        highlightChannelId: highlightMsg.channel_id,
        reactionCount: reactionForEmoji.count,
      });

      // React to the message with the emoji.
      // await ctx.api.createReaction(
      //   highlightMsg.channel_id,
      //   highlightMsg.id,
      //   formattedEmoji,
      // );

      return;
    }
  },
});

export default anyboard;
