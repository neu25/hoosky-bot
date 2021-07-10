import Command from '../Command';
import ExecutionContext from '../ExecutionContext';
import { hasPermission } from '../permissions';
import CommandOptionChoice from '../CommandOptionChoice';
import * as Discord from '../Discord';
import SubCommand from '../SubCommand';

export const guildRoleListToMap = (
  roles: Discord.Role[],
): Record<string, Discord.Role> => {
  const map: Record<string, Discord.Role> = {};
  for (const r of roles) {
    map[r.id] = r;
  }
  return map;
};

export const compareRank = (
  guildRoles: Record<string, Discord.Role>,
  m1: Discord.GuildMember,
  m2: Discord.GuildMember,
): number => {
  const m1Rank = getHighestRank(m1.roles.map(id => guildRoles[id]));
  const m2Rank = getHighestRank(m2.roles.map(id => guildRoles[id]));

  return m1Rank - m2Rank;
};

/**
 * Returns the highest rank number out of all the provided roles. Higher ranks
 * mean higher precedence.
 *
 * @param roles An array of Discord roles to check.
 */
export const getHighestRank = (roles: Discord.Role[]): number => {
  let highest = 0;
  for (const r of roles) {
    if (r.position > highest) {
      highest = r.position;
    }
  }
  return highest;
};

/**
 * Counts the number of subcommands, out of the array of command options,
 * that the executor of the execution context can access.
 *
 * @param ctx The execution context.
 * @param cmd The command.
 */
export const countCtxAccessibleSubCommands = (
  ctx: ExecutionContext,
  cmd: Command,
): number => {
  const validSubCommands =
    Object.values(cmd.subCommands).filter(subCommand => {
      if (!(subCommand instanceof SubCommand)) return false;
      return checkCtxPermissions(ctx, subCommand.requiredPerms)[1];
    }) || [];
  return validSubCommands.length;
};

/**
 * Returns whether the executor of the provided execution context can run the
 * provided command.
 *
 * @param ctx The execution context.
 * @param cmd The command being run.
 */
export const ctxCanRunCommand = (
  ctx: ExecutionContext,
  cmd: Command,
): boolean => {
  return (
    // Ensure the executor possesses the required permissions.
    checkCtxPermissions(ctx, cmd.requiredPerms)[1] &&
    // Ensure the executor can access at least 1 subcommand;
    (countCtxAccessibleSubCommands(ctx, cmd) !== 0 ||
      // OR there are no subcommands.
      Object.values(cmd.subCommands).length === 0)
  );
};

/**
 * Converts a list of commands into a list of command option choices.
 *
 * This is used by the `/help` command to auto-complete the names of commands
 * with help texts.
 *
 * @param commandsList A list of commands.
 */
export const convertCommandListToOptionsList = (
  commandsList: Command[],
): CommandOptionChoice[] => {
  const choices: CommandOptionChoice[] = [];
  for (const command of commandsList) {
    choices.push(
      new CommandOptionChoice({
        name: command.name,
        value: command.name,
      }),
    );
  }
  return choices;
};

/**
 * Checks whether the executor of the provided execution context has all of the
 * provided required permissions.
 *
 * Returns a 2-element array:
 *  - 0: The missing Discord permission, or undefined.
 *  - 1: Whether all permission were met.
 *
 * @param ctx The execution context.
 * @param requiredPerms The required permissions.
 */
export const checkCtxPermissions = (
  ctx: ExecutionContext,
  requiredPerms: Discord.Permission[],
): [Discord.Permission, false] | [undefined, true] => {
  const { interaction } = ctx;
  if (!interaction.member) {
    throw new Error('No member found in interaction');
  }

  const executorPerms = parseInt(interaction.member.permissions ?? '0');

  // Ensure that every required permission is possessed by the executor.
  for (const req of requiredPerms) {
    if (!hasPermission(executorPerms, req)) {
      return [req, false];
    }
  }

  return [undefined, true];
};
