import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { compareRank, guildRoleListToMap } from '../_utils';
import { Config, RolesConfig } from '../../database';

export const mustGetRolesConfig = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<Partial<RolesConfig>> => {
  const rolesCfg = await ctx.db.getConfigValue<RolesConfig>(
    guildId,
    Config.ROLES,
  );
  if (!rolesCfg) {
    throw new Error('No roles configuration found');
  }
  return rolesCfg;
};

export const checkMutePermissions = async (
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
      await ctx.respondWithError(
        `You can only use moderation commands on users ranked lower than you.`,
      );
      return false;
    }
  }

  return true;
};
