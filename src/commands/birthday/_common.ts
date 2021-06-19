import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';

export const getTargetUser = async (
  ctx: ExecutionContext,
  requestorId: string | undefined,
  targetUserId: string,
): Promise<Discord.User | undefined> => {
  if (targetUserId) {
    return await ctx.api.getUser(targetUserId);
  } else if (requestorId) {
    return await ctx.api.getUser(requestorId);
  }
};
