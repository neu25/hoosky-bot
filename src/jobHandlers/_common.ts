import dayjs from 'dayjs';
import * as Discord from '../Discord';
import { Config } from '../database';
import { RolesConfig } from '../repository';
import { JobContext, JobType } from './index';

export const getBirthdayRole = async (
  ctx: JobContext<JobType.ADD_BIRTHDAY_ROLES | JobType.REMOVE_BIRTHDAY_ROLES>,
): Promise<Discord.Role | null> => {
  const { guildId } = ctx.data;

  const rolesCfg = await ctx.repos.config.get<RolesConfig>(
    guildId,
    Config.ROLES,
  );
  if (!rolesCfg) {
    throw new Error('No birthday role configuration found');
  }
  if (!rolesCfg.birthday) return null;

  const roles = await ctx.api.getGuildRoles(guildId);
  return roles.find(r => r.id === rolesCfg.birthday) ?? null;
};

export const handleBirthdayJob = async (
  ctx: JobContext<JobType.ADD_BIRTHDAY_ROLES | JobType.REMOVE_BIRTHDAY_ROLES>,
  add: boolean,
): Promise<void> => {
  const { data } = ctx;
  const { guildId } = data;

  const birthdayRole = (await getBirthdayRole(ctx))?.id;
  if (!birthdayRole) return;

  const today = dayjs().format('MM/DD');
  const isLeapYear = dayjs().isLeapYear();
  const birthdays = await ctx.repos.birthdays.getByDay(guildId, today);

  const processRole = (userId: string) => {
    return add
      ? ctx.api.addRoleToMember(guildId, userId, birthdayRole)
      : ctx.api.removeRoleFromMember(guildId, userId, birthdayRole);
  };

  if (birthdays && birthdays.users.length > 0) {
    await ctx.auditLogger.logMessage({
      title: (add ? 'Adding' : 'Removing') + ' birthday roles',
      description: add
        ? 'I am giving the birthday role to the following people:\n'
        : 'I am removing the birthday role from the following people:\n' +
          birthdays.users.map(userId => `• <@${userId}>`).join('\n'),
    });

    for (const userId of birthdays.users) {
      await processRole(userId);
    }
  }

  // Handle leap years
  if (!isLeapYear && today === '02/28') {
    const leapYearBirthdays = await ctx.repos.birthdays.getByDay(
      guildId,
      dayjs('2/29/2000').format('MM/DD'),
    );

    if (leapYearBirthdays) {
      for (const userId of leapYearBirthdays.users) {
        await processRole(userId);
      }
    }
  }
};
