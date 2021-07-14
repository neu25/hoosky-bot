import { User } from '../../Discord';
import ExecutionContext from '../../ExecutionContext';

export const getTargetUser = async (
  ctx: ExecutionContext,
  requesterId: string | undefined,
  targetUserId: string | undefined,
): Promise<User | undefined> => {
  if (targetUserId) {
    return ctx.api.getUser(targetUserId);
  } else if (requesterId) {
    return ctx.api.getUser(requesterId);
  }
};
