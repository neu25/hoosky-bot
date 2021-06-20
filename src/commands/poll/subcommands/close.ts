import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { deletePolls } from '../_common';

export const close = new SubCommand({
  name: 'close',
  displayName: 'Close',
  description: 'Closes all your polls',
  options: [
    new CommandOption({
      name: 'delete',
      description: 'Delete the message instead of just locking it.',
      type: Discord.CommandOptionType.BOOLEAN,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.interaction.member?.user?.id;
    if (!userId) {
      return ctx.respondWithError('Unable to identify you');
    }

    const poll = {
      _id: ctx.getArgument('id') as string,
      userId: userId,
    };

    await deletePolls(ctx, guildId, poll);
    ctx.respondWithMessage('Polls closed succesfully.', true);
  },
});
