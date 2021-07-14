import ExecutionContext from '../../ExecutionContext';
import { Poll } from '../../repository/PollRepo';
import * as Discord from '../../Discord';
import { bold, EM_SPACE, pluralize } from '../../format';

export const fetchReactionCounts = async (
  ctx: ExecutionContext,
  poll: Poll,
): Promise<number[]> => {
  const reactionCounts: number[] = [];

  for (const emoji of poll.reactions) {
    let count = 0;
    const users = await ctx.api.getReactions(poll.channelId, poll._id, emoji);
    for (const u of users) {
      if (!u.bot) ++count;
    }
    reactionCounts.push(count);
  }

  return reactionCounts;
};

export const closePollAndShowResults = async (
  ctx: ExecutionContext,
  poll: Poll,
): Promise<void> => {
  const guildId = ctx.mustGetGuildId();

  const reactionCounts = await fetchReactionCounts(ctx, poll);
  const maxCount = Math.max(...reactionCounts);

  const body = reactionCounts!
    .map((count, i) => {
      const reaction = poll.reactions[i];

      // The most-voted for choices should have bold labels.
      let label = count.toLocaleString() + ' ' + pluralize('vote', count);
      if (count === maxCount) {
        label = bold(label);
      }

      return reaction + EM_SPACE + label;
    })
    .join('\n\n');

  const embed: Discord.Embed = {
    type: Discord.EmbedType.RICH,
    color: Discord.Color.SUCCESS,
    title: `Poll results for: ${bold(poll.question)}`,
    description: body,
    timestamp: new Date().toISOString(),
  };

  await ctx.interactionApi.respondWithEmbed(embed);
  await ctx.poll().deleteById(guildId, poll._id);
  return ctx.api.deleteAllReactions(poll.channelId, poll._id);
};
