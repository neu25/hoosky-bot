import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { deletePoll, getPoll, closePoll } from '../_common';

export const close = new SubCommand({
  name: 'close',
  displayName: 'Close',
  description: 'Closes all your polls',
  options: [
    new CommandOption({
      name: 'id',
      description: 'Id of the poll. Find it with /poll list',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'delete',
      description: 'Delete the message instead of just closing it.',
      type: Discord.CommandOptionType.BOOLEAN,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.interaction.member?.user?.id;
    const pollId = ctx.getArgument('id') as string;
    if (!userId) {
      return ctx.respondWithError('Unable to identify you');
    }

    const poll = await getPoll(ctx, guildId, pollId, userId);
    if (poll == null) {
      return;
    }

    if (ctx.getArgument('delete') as boolean) {
      deletePoll(ctx, guildId, pollId);
      await ctx.api.deleteMessage(poll._id, poll.channelId);
      return await ctx.respondWithMessage('Poll deleted succesfully', true);
    }

    closePoll(ctx, guildId, poll);
  },
});
