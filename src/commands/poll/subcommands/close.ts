import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { closePoll } from '../_common';

const close = new SubCommand({
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
      return ctx.interactionApi.respondWithError('Unable to identify you');
    }

    const poll = await ctx.poll().getById(guildId, pollId, userId);
    if (poll === null) {
      ctx.interactionApi.respondWithError("Could't find poll");
      return;
    }

    if (ctx.getArgument('delete') as boolean) {
      ctx.poll().deleteById(guildId, pollId);
      await ctx.api.deleteMessage(poll._id, poll.channelId);
      return await ctx.interactionApi.respondWithMessage(
        'Poll deleted succesfully',
        true,
      );
    }

    closePoll(ctx, guildId, poll);
  },
});

export default close;
