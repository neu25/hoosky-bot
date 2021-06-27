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
  options: any[],
  type: number,
) => {
  const commandOptions: any[] = [];
  if (!options) {return commandOptions; }
  for (const option of options) {
    if (option.type == type) {
      commandOptions.push(option);
    }
  }
  return commandOptions;
}

export const countSubCommands = (
  options: any[],
): number => {
  return getOptionsOfType(options, 1).length;
}
