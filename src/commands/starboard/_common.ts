import ExecutionContext from '../../ExecutionContext';

export const getReactionCount = async (
  ctx: ExecutionContext,
  pollId: string,
  channelId: string,
  emoji: string,
): Promise<number> => {
  let count = 0;
  const users = await ctx.api.getReactions(pollId, channelId, emoji);
  for (const user of users) {
    if (!user.bot) ++count;
  }
  return count;
};
