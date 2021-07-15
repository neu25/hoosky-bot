import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { closePollAndShowResults } from '../_common';

const close = new SubCommand({
  name: 'close',
  displayName: 'Poll Close',
  description: 'Close your poll',
  options: [
    new CommandOption({
      name: 'id',
      description: 'Message ID of the poll. Find this with "/poll list"',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.mustGetUserId();
    const pollId = ctx.getArgument<string>('id')!;

    const poll = await ctx.polls().getById(guildId, pollId, userId);
    if (!poll) {
      return ctx.interactionApi.respondWithError(
        "Couldn't find poll. It may already be closed.",
      );
    }

    return closePollAndShowResults(ctx, poll);
  },
});

export default close;
