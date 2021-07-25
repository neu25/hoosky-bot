import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { compareRank, guildRoleListToMap } from '../_utils';
import { Config } from '../../database';
import { RolesConfig } from '../../repository';
import { JobType } from '../../jobHandlers';
import { UnmuteJobData } from '../../jobHandlers/unmute';

export const respondSetupError = async (
  ctx: ExecutionContext,
): Promise<void> => {
  await ctx.interactionApi.respondWithError(
    'Muted role not set up yet. Try running `/mute setup`.',
  );
};

export const getMuteRoleOrExit = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<string | undefined> => {
  // Fetch the roles configuration from the server.
  const rolesCfg = await mustGetRolesConfig(ctx, guildId);
  if (!rolesCfg.muted) {
    await respondSetupError(ctx);
    return;
  }

  // Get a list of all guild roles, and make sure the muted role still exists.
  const guildRoles = await ctx.api.getGuildRoles(guildId);
  if (!guildRoles.find(r => r.id === rolesCfg.muted)) {
    await respondSetupError(ctx);
    return;
  }

  return rolesCfg.muted;
};

export const mustGetRolesConfig = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<Partial<RolesConfig>> => {
  const rolesCfg = await ctx.config().get<RolesConfig>(guildId, Config.ROLES);
  if (!rolesCfg) {
    throw new Error('No roles configuration found');
  }
  return rolesCfg;
};

export const checkMutePermissionsOrExit = async (
  ctx: ExecutionContext,
  guildId: string,
  targetUserId: string,
): Promise<boolean> => {
  const { interaction } = ctx;
  const executorMember = interaction.member as Discord.GuildMember;

  // Get a map of role IDs to guild roles.
  const guildRoles = guildRoleListToMap(await ctx.api.getGuildRoles(guildId));

  // Get information about the user being muted.
  const targetMember = await ctx.api.getGuildMember(guildId, targetUserId);

  // Make sure the executor is ranked above the target.
  if (targetMember.roles.length > 0) {
    if (compareRank(guildRoles, targetMember, executorMember) >= 0) {
      await ctx.interactionApi.respondWithError(
        `You can only use moderation commands on users ranked lower than you.`,
      );
      return false;
    }
  }

  return true;
};

export const createUnmuteJob = async (
  ctx: ExecutionContext,
  userId: string,
  targetDate: Date,
): Promise<void> => {
  const guildId = ctx.mustGetGuildId();

  const data: UnmuteJobData = { guildId, userId };
  await ctx.scheduler.addJob(guildId, {
    type: JobType.UNMUTE,
    targetDate,
    data,
  });
};

export const removeUnmuteJob = async (
  ctx: ExecutionContext,
  userId: string,
): Promise<void> => {
  const guildId = ctx.mustGetGuildId();

  const jobs = await ctx.repos.jobs.list(guildId);
  for (const j of jobs) {
    if (j.type === JobType.UNMUTE) {
      const data = j.data as UnmuteJobData;
      if (data.guildId === guildId && data.userId === userId) {
        await ctx.scheduler.removeJob(guildId, j._id);
      }
    }
  }
};
