import { User } from '../../Discord';
import ExecutionContext from '../../ExecutionContext';

export const getTargetUser = async (
  ctx: ExecutionContext,
  requestorId: string | undefined,
  targetUserId: string | undefined,
): Promise<User | undefined> => {
  if (targetUserId) {
    return await ctx.api.getUser(targetUserId);
  } else if (requestorId) {
    return await ctx.api.getUser(requestorId);
  }
};
