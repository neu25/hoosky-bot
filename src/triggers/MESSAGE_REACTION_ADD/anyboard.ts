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

export const getHighestReaction = (
  reactions: Discord.Reaction[],
): Discord.Reaction => {
  if (reactions.length === 0) {
    throw new Error('Reactions is empty');
  }

  let re = reactions[0];
  for (const r of reactions) {
    if (r.count > re.count) {
      re = r;
    }
  }
  return re;
};

const anyboard = new Trigger({
  event: Discord.Event.MESSAGE_REACTION_ADD,
  handler: async ctx => {
    const { data } = ctx;
    const {
      guild_id: guildId,
      channel_id: ogChannelId,
      message_id: ogMessageId,
    } = data;
    if (!guildId) {
      throw new Error('No guild ID found in trigger data');
    }

    // Ignore the bot's own reactions.
    if (data.user_id === ctx.botUser.id) return;

    const anyboardCfg = await ctx
      .config()
      .get<AnyboardConfig>(guildId, Config.ANYBOARD);
    if (
      !anyboardCfg?.channelId ||
      !anyboardCfg?.minReactionCount ||
      !anyboardCfg?.blacklistedChannelIds
    ) {
      return;
    }

    // If this channel is blacklisted, then ignore this reaction.
    if (anyboardCfg.blacklistedChannelIds.includes(ogChannelId)) return;

    // Try to get this board message. If this is `null`, then it means this message
    // hasn't been highlighted yet.
    const boardMsg = await ctx
      .anyboardMessages()
      .getByMessageId(guildId, ogMessageId);
    // If this message was blacklisted, then do nothing.
    if (boardMsg?.blacklisted) return;

    // Debounce all reactions with a 2 second interval. This means that the bot accumulates
    // reactions that are under 2 seconds apart and processes them in 1 lump sum.
    ctx.debouncer.debounce(
      `trigger-anyboard-${data.guild_id}-${data.channel_id}-${data.message_id}`,
      2000,
      ctx.data, // Here, we provide the data to be saved in case this execution gets bounced.
      // The following callback gets executed once no reactions have been made for a
      // 2 second period, and all the bounced reactions are supplied in the array `bouncedReactions`.
      async bouncedReactions => {
        // Format emoji to a consistent representation consumable by the Discord UI.
        const formattedReactEmojis = bouncedReactions.map(r =>
          formatEmoji(r.emoji),
        );

        // Get the original message.
        const ogMessage = await ctx.api.getChannelMessage(
          ogChannelId,
          ogMessageId,
        );
        const { author, referenced_message: referencedMessage } = ogMessage;
        const ogReactions = ogMessage.reactions ?? [];

        // Impossible case where there are no reactions on the message.
        if (ogReactions.length === 0) return;

        const highestReaction = getHighestReaction(ogReactions);
        const formattedHighestEmoji = formatEmoji(highestReaction.emoji);
        // Ignore the reactions if none of them are the highest.
        if (!formattedReactEmojis.includes(formattedHighestEmoji)) {
          return;
        }

        if (boardMsg) {
          // Reaction count hasn't changed, do nothing.
          if (boardMsg.reactionCount === highestReaction.count) return;

          let createNewHighlight = false;

          try {
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
              emoji: formattedHighestEmoji,
              reactionCount: highestReaction.count,
            });
          } catch (e) {
            console.error('Unable to edit anyboard highlight message');
            createNewHighlight = true;
            // Delete the old anyboard message entry, which is corrupt.
            await ctx.anyboardMessages().delete(guildId, ogMessageId);
          }

          if (!createNewHighlight) return;
        }

        // If the reaction is in the anyboard channel, do nothing.
        if (anyboardCfg.channelId === ogChannelId) return;

        const fields: Discord.EmbedField[] = [];
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

        fields.push({
          name: 'Original',
          value: hyperlink(
            'Jump to message',
            messageLink(guildId, ogChannelId, ogMessageId),
          ),
        });

        if (highestReaction.count >= anyboardCfg.minReactionCount!) {
          const authorMember = await ctx.api.getGuildMember(guildId, author.id);
          const authorName = authorMember.nick ?? author.username;

          const highlightMsg = await ctx.api.createMessage(
            anyboardCfg.channelId!,
            {
              content: generateHighlightMessageContent(
                ogChannelId,
                highestReaction,
                formattedHighestEmoji,
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
            },
          );

          await ctx.anyboardMessages().create(guildId, {
            _id: ogMessageId,
            userId: author.id,
            sendDate: new Date(ogMessage.timestamp),
            highlightMessageId: highlightMsg.id,
            highlightChannelId: highlightMsg.channel_id,
            emoji: formattedHighestEmoji,
            reactionCount: highestReaction.count,
            blacklisted: false,
          });

          // React to the message with the emoji.
          // await ctx.api.createReaction(
          //   highlightMsg.channel_id,
          //   highlightMsg.id,
          //   formattedEmoji,
          // );
        }
      },
    );
  },
});

export default anyboard;
