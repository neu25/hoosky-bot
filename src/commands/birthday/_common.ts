import dayjs from 'dayjs';
import { GuildMember } from '../../Discord';
import ExecutionContext from '../../ExecutionContext';

export const formatHourMinute = (hour: number, minute: number): string => {
  return dayjs()
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0)
    .format('h:mm a');
};

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
