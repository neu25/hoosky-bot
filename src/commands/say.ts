import * as Discord from '../Discord';
import Command from '../Command';

enum FollowUp {
  MESSAGE = 'message',
}

const bulkCreate = new Command({
  name: 'say',
  displayName: 'Say',
  description: 'Send a message as HooskBot',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  handler: async ctx => {
    const userId = ctx.mustGetUserId();
    await ctx.interactionApi.respondSilently(
      'Send the message you want HooskBot to echo. Your message will be deleted.',
    );
    // Wait for a follow-up message for up to 30s.
    ctx.expectMessageFollowUp(FollowUp.MESSAGE, userId, 30000);
  },
  msgFollowUpHandlers: {
    [FollowUp.MESSAGE]: async (tctx, ectx) => {
      const message = tctx.data;
      const userId = ectx.mustGetUserId();

      // Delete the user's message.
      await tctx.api.deleteMessage(message.channel_id, message.id);

      // Echo the message.
      await tctx.api.createMessage(message.channel_id, {
        content: message.content,
        tts: message.tts,
        embeds: message.embeds,
        message_reference: message.referenced_message,
        components: message.components,
      });

      // Stop treated this user's messages as follow-ups.
      ectx.unexpectFollowUp(userId);
    },
  },
});

export default bulkCreate;
