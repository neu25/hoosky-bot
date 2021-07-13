import ExecutionContext from '../../ExecutionContext';
import { Config } from '../../database';
import { RolesConfig } from '../../repository';

export const parseDuration = (duration: string): number => {
  let seconds = 0;
  const hours = duration.match(/(\d+)\s*h/);
  const minutes = duration.match(/(\d+)\s*m/);

  if (hours) {
    seconds += parseInt(hours[1]) * 3600;
  }

  if (minutes) {
    seconds += parseInt(minutes[1]) * 60;
  }

  return seconds;
};

export const respondSetupError = async (
  ctx: ExecutionContext,
): Promise<void> => {
  await ctx.interactionApi.respondWithError(
    'Focus mode role(s) not set up yet. Try running `/focus setup`.',
  );
};

export const getFocusHardRoleOrExit = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<string | undefined> => {
  // Fetch the roles configuration from the server.
  const rolesCfg = await mustGetRolesConfig(ctx, guildId);
  if (!rolesCfg.focusHard) {
    await respondSetupError(ctx);
    return;
  }

  // Get a list of all guild roles, and make sure the focusHard role still exists.
  const guildRoles = await ctx.api.getGuildRoles(guildId);
  if (!guildRoles.find(r => r.id === rolesCfg.focusHard)) {
    await respondSetupError(ctx);
    return;
  }

  return rolesCfg.focusHard;
};

export const getFocusSoftRoleOrExit = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<string | undefined> => {
  // Fetch the roles configuration from the server.
  const rolesCfg = await mustGetRolesConfig(ctx, guildId);
  if (!rolesCfg.focusHard) {
    await respondSetupError(ctx);
    return;
  }

  // Get a list of all guild roles, and make sure the focusSoft role still exists.
  const guildRoles = await ctx.api.getGuildRoles(guildId);
  if (!guildRoles.find(r => r.id === rolesCfg.focusSoft)) {
    await respondSetupError(ctx);
    return;
  }

  return rolesCfg.focusSoft;
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
