import { Config } from '../database';
import { RolesConfig } from '../repository';
import { JobHandler, JobType } from './index';

export type UnmuteJobData = {
  guildId: string;
  userId: string;
};

const unmute: JobHandler<JobType.UNMUTE> = async ctx => {
  const { data } = ctx;

  const rolesCfg = await ctx.repos.config.get<RolesConfig>(
    data.guildId,
    Config.ROLES,
  );
  if (!rolesCfg) {
    throw new Error('No roles configuration found');
  }
  if (!rolesCfg.muted) {
    throw new Error('Muted role missing in roles configuration');
  }

  await ctx.auditLogger.logMessage(data.guildId, {
    title: 'Removing mute',
    description: `The mute for <@${data.userId}> has ended, so I am removing the Muted role from them.`,
  });

  return ctx.api.removeRoleFromMember(
    data.guildId,
    data.userId,
    rolesCfg.muted,
  );
};

export default unmute;
