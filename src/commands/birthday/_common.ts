import { GuildMember } from '../../Discord';
import ExecutionContext from '../../ExecutionContext';

export const getTargetUser = async (
  ctx: ExecutionContext,
  guildId: string,
  requesterId: string | undefined,
  targetUserId: string | undefined,
): Promise<GuildMember | undefined> => {
  if (targetUserId) {
    return ctx.api.getGuildMember(guildId, targetUserId);
  } else if (requesterId) {
    return ctx.api.getGuildMember(guildId, requesterId);
  }
};
