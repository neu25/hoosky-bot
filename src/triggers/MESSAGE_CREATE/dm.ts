import * as Discord from '../../Discord';
import { ButtonStyle, MessageComponentType } from '../../Discord';
import Trigger from '../../Trigger';
import { Config } from '../../database';
import { MailConfig } from '../../repository/ConfigRepo';
import { generateChannelData } from '../../commands/mail/_common';
import { authorAvatarUrl } from '../../cdn';
import Snowflake from '../../Snowflake';
import { dateToUnixTime } from '../../utils';
import { transformAttachmentsToEmbeds } from './_utils';

/**
 * Handle direct messages.
 */
const dm = new Trigger({
  event: Discord.Event.MESSAGE_CREATE,
  handler: async ctx => {
    const { data } = ctx;
    const { author } = data;

    // Ignore the bot's own messages.
    if (author.id === ctx.botUser.id) return;

    const authorSnowflake = new Snowflake(author.id);

    const dmChannel = await ctx.api.getChannel(data.channel_id);
    if (dmChannel.type !== Discord.ChannelType.DM) {
      // Ignore non-DM messages.
      return;
    }

    const mailCfg = await ctx.config().getGlobal<MailConfig>(Config.MAIL);
    if (!mailCfg?.guildId || !mailCfg?.categoryId) {
      // Server mail not set up yet, so ignore the DM.
      return;
    }
    const { guildId, categoryId } = mailCfg;

    let mailThread = await ctx.mail().getByUserId(guildId, data.author.id);
    if (!mailThread) {
      // Create a new channel for this thread.
      const threadChannel = await ctx.api.createChannel(
        guildId,
        generateChannelData(author.username, author.discriminator, categoryId),
      );

      const topControlsMsg = await ctx.api.createMessage(threadChannel.id, {
        embeds: [
          {
            title: 'Beginning of mail thread',
            type: Discord.EmbedType.RICH,
            color: Discord.Color.PRIMARY,
            fields: [
              {
                name: 'User',
                value: `<@${author.id}>`,
              },
              {
                name: 'Account Created',
                value: `<t:${dateToUnixTime(authorSnowflake.getDate())}:R>`,
              },
            ],
          },
        ],
        components: [
          {
            type: MessageComponentType.ActionRow,
            components: [
              {
                type: MessageComponentType.Button,
                style: ButtonStyle.Primary,
                label: 'Delete mail thread',
                custom_id: 'mail-delete-thread',
              },
              {
                type: MessageComponentType.Button,
                style: ButtonStyle.Danger,
                label: 'Block user',
                custom_id: 'mail-block-user',
              },
            ],
          },
        ],
      });

      mailThread = {
        _id: data.author.id,
        threadChannelId: threadChannel.id,
        dmChannelId: dmChannel.id,
        topControlsMsgId: topControlsMsg.id,
        lastSenderMsgId: '',
      };
      await ctx.mail().create(guildId, mailThread);
    } else {
      // Delete the existing bottom controls, as we'll be sending new ones.
      if (mailThread.lastSenderMsgId) {
        // Errors may occur if messages are sent too quickly.
        try {
          await ctx.api.editMessage(
            mailThread.threadChannelId,
            mailThread.lastSenderMsgId,
            {
              components: [],
            },
          );
        } catch (e) {
          console.warn(e);
        }
      }
    }

    const lastSenderMsg = await ctx.api.createMessage(
      mailThread.threadChannelId,
      {
        embeds: [
          {
            title: 'New message',
            type: Discord.EmbedType.RICH,
            description: data.content,
            timestamp: data.timestamp,
            author: {
              name: `${author.username}#${author.discriminator}`,
              icon_url: authorAvatarUrl(author),
            },
          },
          ...transformAttachmentsToEmbeds(data.attachments),
        ],
        components: [
          {
            type: MessageComponentType.ActionRow,
            components: [
              {
                type: MessageComponentType.Button,
                style: ButtonStyle.Success,
                label: 'Reply',
                custom_id: 'mail-reply',
              },
            ],
          },
        ],
      },
    );

    await ctx.mail().updateByUserId(guildId, author.id, {
      lastSenderMsgId: lastSenderMsg.id,
    });

    await ctx.api.createMessage(dmChannel.id, {
      embeds: [
        {
          title: 'Message delivered!',
          description: 'A mod will get back to you soon',
        },
      ],
    });
  },
});

export default dm;
