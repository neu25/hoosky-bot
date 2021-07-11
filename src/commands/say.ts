import axios from 'axios';
import * as Discord from '../Discord';
import Command from '../Command';

enum FollowUp {
  MESSAGE = 'message',
}

const download = async (url: string): Promise<ArrayBuffer> => {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  return res.data as ArrayBuffer;
};

const bulkCreate = new Command({
  name: 'say',
  displayName: 'Say',
  description: 'Send a message as HooskBot',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  handler: async ctx => {
    const { interaction } = ctx;
    const userId = ctx.mustGetUserId();

    await ctx.interactionApi.respondSilently(
      'Send the message you want HooskBot to echo. Your message will be deleted.',
    );

    // Wait for a follow-up message for up to 30s.
    ctx.expectMessageFollowUp(
      FollowUp.MESSAGE,
      userId,
      interaction.channel_id ?? '',
      60_000,
    );
  },
  msgFollowUpHandlers: {
    [FollowUp.MESSAGE]: async (tctx, ectx) => {
      const message = tctx.data;
      const userId = ectx.mustGetUserId();

      let attachment: Discord.Attachment | undefined;
      let arrayBuffer: ArrayBuffer | undefined;
      if (message.attachments.length > 0) {
        attachment = message.attachments[0];
        arrayBuffer = await download(attachment.url);
      }

      // Delete the user's message.
      await tctx.api.deleteMessage(message.channel_id, message.id);

      if (attachment && arrayBuffer) {
        const payload: Discord.CreateMessagePayload & { file: ArrayBuffer } = {
          content: message.content,
          message_reference: message.referenced_message,
          file: arrayBuffer,
        };

        // Echo the message with the attachment.
        await tctx.api.createMessageWithFile(
          message.channel_id,
          attachment.filename,
          attachment.content_type ?? '',
          payload,
        );
      } else {
        // Echo the message.
        await tctx.api.createMessage(message.channel_id, {
          content: message.content,
          tts: message.tts,
          embeds: message.embeds,
          message_reference: message.referenced_message,
          components: message.components,
        });
      }

      // Stop treated this user's messages as follow-ups.
      ectx.unexpectFollowUp(message.channel_id, userId);
    },
  },
});

export default bulkCreate;
