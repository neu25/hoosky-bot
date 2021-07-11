import Interaction from '../../Interaction';
import { blockUserMail, notifyOfBlock } from '../../commands/mail/_common';

const blockUser = new Interaction({
  id: 'mail-block-user',
  handler: async ctx => {
    const { interaction } = ctx;

    const mailThread = await ctx
      .mail()
      .getByChannelId(interaction.guild_id!, interaction.channel_id!);
    if (!mailThread) {
      return ctx.interactionApi.respondWithError(
        'Unable to determine mail thread associated with this channel',
      );
    }

    // Update the mail configuration in the database.
    await blockUserMail(ctx, mailThread._id);

    return notifyOfBlock(ctx, mailThread._id);
  },
});

export default blockUser;
