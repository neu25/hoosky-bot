import ExecutionContext from '../../ExecutionContext';
import { Poll } from '../../repository/PollRepo';

export const calculateReactionCounts = async (
  ctx: ExecutionContext,
  poll: Poll,
): Promise<number[]> => {
  const reactionCounts: number[] = [];

  for (const emoji of poll.reactions) {
    let count = 0;
    const users = await ctx.api.getReactions(poll._id, poll.channelId, emoji);
    for (const user of users) {
      if (!user.bot) ++count;
    }
    reactionCounts.push(count);
  }

  return reactionCounts;
};

export const closePoll = async (
  ctx: ExecutionContext,
  guildId: string,
  poll: Poll,
): Promise<void> => {
  if (!poll.closed) {
    const reactionCounts: number[] = await calculateReactionCounts(ctx, poll);
    ctx.poll().setReactionCounts(guildId, poll._id, reactionCounts);

    let content = `${poll.content}\n\n***Poll closed!***\n**Results:**\n`;
    for (let i = 0; i < reactionCounts.length; ++i) {
      content += `    ${poll.reactions[i]} - ${reactionCounts[i]}\n`;
    }

    ctx.poll().setClosed(guildId, poll._id, true);
    ctx.api.editMessage(poll._id, poll.channelId, content);
    ctx.api.deleteAllReactions(poll._id, poll.channelId);

    ctx.respondWithMessage('Poll closed succesfully.', true);
  } else {
    ctx.respondWithMessage('That poll is already closed.', true);
  }
};
