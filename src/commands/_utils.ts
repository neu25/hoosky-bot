import Command from '../Command';
import ExecutionContext from '../ExecutionContext';
import { hasPermission } from '../permissions';
import CommandOptionChoice from '../CommandOptionChoice';
import * as Discord from '../Discord';

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

export const getHighestRank = (roles: Discord.Role[]): number => {
  let highest = 0;
  for (const r of roles) {
    if (r.position > highest) {
      highest = r.position;
    }
  }
  return highest;
};

const getOptionsOfType = (
  options: Discord.CommandOption[],
  type: number,
): Discord.CommandOption[] => {
  const commandOptions: Discord.CommandOption[] = [];
  if (!options) {
    return commandOptions;
  }
  for (const option of options) {
    if (option.type == type) {
      commandOptions.push(option);
    }
  }
  return commandOptions;
};

export const countSubCommands = (
  ctx: ExecutionContext,
  options: Discord.CommandOption[],
): number => {
  const subCommands = getOptionsOfType(options, 1) as any;

  const validSubCommands =
    subCommands.filter((subCommand: any) =>
      hasPermissions(ctx, subCommand.requiredPerms),
    ) || [];
  return validSubCommands.length;
};

const countAllSubCommands = (options: any[]): number => {
  const subCommands = getOptionsOfType(options, 1);
  return subCommands.length;
};

export const canRunCommand = (ctx: ExecutionContext, cmd: Command): boolean => {
  const command = cmd.serialize();
  // Permission to run command and either has more than one subcommand with permission to run or always has no subcommmands
  // Filters out commands with only subcommands requring more permissions than the user has
  return (
    hasPermissions(ctx, command.requiredPerms) &&
    (countSubCommands(ctx, command.options) != 0 ||
      countAllSubCommands(command.options) == 0)
  );
};

export const getCommandOptionChoices = (
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

export const hasPermissions = (
  ctx: ExecutionContext,
  requiredPerms: Discord.Permission[],
): boolean => {
  const { interaction } = ctx;
  if (!interaction.member) {
    throw new Error('No member found in interaction');
  }

  if (!requiredPerms) {
    return true;
  }

  const executorPerms = parseInt(interaction.member.permissions ?? '0');
  for (const p of requiredPerms) {
    if (!hasPermission(executorPerms, p)) {
      return false;
    }
  }

  return true;
};
