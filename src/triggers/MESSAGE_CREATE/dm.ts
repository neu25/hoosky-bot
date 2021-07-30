import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as Discord from '../../Discord';
import { ButtonStyle, MessageComponentType } from '../../Discord';
import TriggerContext from '../../TriggerContext';
import Trigger from '../../Trigger';
import { Config } from '../../database';
import { GlobalMailConfig } from '../../repository/ConfigRepo';
import { MailThread } from '../../repository/MailRepo';
import { generateChannelData } from '../../commands/mail/_common';
import { authorAvatarUrl } from '../../cdn';
import Snowflake from '../../Snowflake';
import { transformAttachmentsToEmbeds } from './_utils';

dayjs.extend(relativeTime);

const sendTopControlsMessage = (
  ctx: TriggerContext<Discord.Message>,
  threadChannel: Discord.Channel,
  userId: string,
  accountCreation: Date,
): Promise<Discord.Message> => {
  const day = dayjs(accountCreation);

  return ctx.api.createMessage(threadChannel.id, {
    embeds: [
      {
        title: 'Beginning of mail thread',
        type: Discord.EmbedType.RICH,
        color: Discord.Color.PRIMARY,
        fields: [
          {
            name: 'User',
            value: `<@${userId}>`,
          },
          {
            name: 'Account Created',
            value: `${day.format(
              'ddd, MMM D, YYYY h:mm A',
            )} (${day.fromNow()})`,
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
};

const forwardMessage = (
  ctx: TriggerContext<Discord.Message>,
  mailThread: MailThread,
  author: Discord.Message['author'],
  content: string,
  attachments: Discord.Attachment[],
  timestamp: string,
): Promise<Discord.Message> => {
  return ctx.api.createMessage(mailThread.threadChannelId, {
    embeds: [
      {
        title: 'New message',
        type: Discord.EmbedType.RICH,
        description: content,
        timestamp: timestamp,
        author: {
          name: `${author.username}#${author.discriminator}`,
          icon_url: authorAvatarUrl(author),
        },
      },
      ...transformAttachmentsToEmbeds(attachments),
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
  });
};

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

    const dmChannel = await ctx.api.getChannel(data.channel_id);
    if (dmChannel.type !== Discord.ChannelType.DM) {
      // Ignore non-DM messages.
      return;
    }

    // Debounce all messages with a 2 second interval. This means that the bot accumulates
    // received DMs that are under 2 seconds apart and forwards them in 1 lump message.
    ctx.debouncer.debounce(
      `trigger-dm-${author.id}`,
      2000,
      data, // Here, we provide the data to be saved in case this execution gets bounced.
      // The following callback gets executed once no messages have been sent for a
      // 2 second period, and all the bounced messages are supplied in the array `bouncedMessages`.
      async bouncedMessages => {
        // Get the server mail configuration.
        const mailCfg = await ctx
          .config()
          .getGlobal<GlobalMailConfig>(Config.MAIL);
        if (!mailCfg?.guildId || !mailCfg?.categoryId) {
          // Server mail not set up yet, so ignore the DM.
          return;
        }
        const { guildId, categoryId, blockedUserIds } = mailCfg;

        // Make sure this user hasn't been blocked from sending mail.
        if (blockedUserIds?.includes(author.id)) {
          console.log(
            '[DM] Ignoring mail message from blocked user',
            author.id,
          );
          return;
        }

        // Let the sender know that their message was delivered.
        await ctx.api.createMessage(dmChannel.id, {
          embeds: [
            {
              title: 'Message delivered!',
              description: 'A mod will get back to you soon',
            },
          ],
        });

        // Get any existing mail threads from the database.
        let mailThread = await ctx.mail().getByUserId(guildId, data.author.id);

        // This function creates a new channel for the mail thread and inserts an
        // entry into the database.
        const createNewMailThread = async () => {
          // No existing mail thread, so we create a new channel for this thread.
          const threadChannel = await ctx.api.createChannel(
            guildId,
            generateChannelData(
              author.username,
              author.discriminator,
              categoryId,
            ),
          );

          // Extract the date the user's account was created out of the user ID.
          const accountCreation = new Snowflake(author.id).getDate();

          // Create a message with basic info about the sender and thread control buttons.
          const topControlsMsg = await sendTopControlsMessage(
            ctx,
            threadChannel,
            author.id,
            accountCreation,
          );

          const newMailThread = {
            _id: data.author.id,
            threadChannelId: threadChannel.id,
            dmChannelId: dmChannel.id,
            topControlsMsgId: topControlsMsg.id,
            lastSenderMsgId: '',
          };

          // In case the mail thread already exists for the user, just update it.
          // If not, this inserts the mail thread.
          await ctx
            .mail()
            .updateByUserId(guildId, newMailThread._id, newMailThread);

          return newMailThread;
        };

        if (!mailThread) {
          mailThread = await createNewMailThread();
        } else {
          // There is an existing mail thread.
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
              // Error code 10003: Unknown channel.
              if (e.code === 10003) {
                mailThread = await createNewMailThread();
              }
            }
          }
        }

        // Combine all the bounced messages into one.
        const combinedContent = bouncedMessages.map(m => m.content).join('\n');
        const combinedAttachments = bouncedMessages
          .map(a => a.attachments)
          .flat(1);
        const lastMessage = bouncedMessages[bouncedMessages.length - 1];

        // Forward the sender's message into the mail thread channel.
        const forwardedMessage = await forwardMessage(
          ctx,
          mailThread,
          author,
          combinedContent,
          combinedAttachments,
          lastMessage.timestamp,
        );

        // Store the message ID of the sender's last forwarded message.
        await ctx.mail().updateByUserId(guildId, author.id, {
          lastSenderMsgId: forwardedMessage.id,
        });
      },
    );
  },
});

export default dm;
