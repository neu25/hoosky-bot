import Interaction from '../../Interaction';
import { transformAttachmentsToEmbeds } from '../../triggers/MESSAGE_CREATE/_utils';
import * as Discord from '../../Discord';
import { authorAvatarUrl } from '../../cdn';

enum FollowUp {
  MESSAGE = 'message',
}

const reply = new Interaction({
  id: 'mail-reply',
  handler: async ctx => {
    const { interaction } = ctx;
    const member = interaction.member!;

    await ctx.interactionApi.respondWithMessage(
      `<@${member.user!.id}> Send the message you want HooskBot to forward`,
    );

    const promptMsg = await ctx.interactionApi.getResponse();

    return ctx.expectMessageFollowUp(
      FollowUp.MESSAGE,
      interaction.channel_id ?? '',
      promptMsg.id,
      member.user!.id,
      60_000,
    );
  },
  msgFollowUpHandlers: {
    [FollowUp.MESSAGE]: async (tctx, ectx) => {
      const guildId = ectx.mustGetGuildId();
      const replyMsg = tctx.data;
      const { author } = replyMsg;

      const mailThread = await ectx
        .mail()
        .getByChannelId(guildId, replyMsg.channel_id);
      if (!mailThread) {
        return ectx.api.createErrorReply(
          replyMsg.channel_id,
          replyMsg.id,
          'Unable to determine mail thread associated with this channel',
        );
      }

      const otherEmbeds = transformAttachmentsToEmbeds(replyMsg.attachments);
      await ectx.api.createMessage(mailThread.dmChannelId, {
        embeds: [
          {
            title: 'New message',
            description: replyMsg.content,
            type: Discord.EmbedType.RICH,
            color: Discord.Color.SUCCESS,
            timestamp: replyMsg.timestamp,
            author: {
              name: `Mods`,
            },
          },
          ...otherEmbeds,
        ],
      });

      // Delete the bot's response prompting for user input.
      await ectx.interactionApi.deleteResponse();

      // Delete the user's message that was forwarded.
      await ectx.api.deleteMessage(replyMsg.channel_id, replyMsg.id);

      // Create an embed indicating the replied message and the author.
      await ectx.api.createMessage(replyMsg.channel_id, {
        embeds: [
          {
            title: 'Sent message',
            type: Discord.EmbedType.RICH,
            color: Discord.Color.SUCCESS,
            description: replyMsg.content,
            timestamp: replyMsg.timestamp,
            author: {
              name: `${author.username}#${author.discriminator}`,
              icon_url: authorAvatarUrl(author),
            },
          },
          ...transformAttachmentsToEmbeds(replyMsg.attachments),
        ],
      });
    },
  },
});

export default reply;
