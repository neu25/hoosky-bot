import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import cron, { CronJob } from 'cron';
import * as Discord from '../../Discord';
import ExecutionContext from '../../ExecutionContext';
import TriggerContext from '../../TriggerContext';
import { Config } from '../../database';
import { RolesConfig } from '../../repository';

dayjs.extend(isLeapYear);

let jobAdd: CronJob;
let jobRemove: CronJob;

export const configureSchedulers = async (
  ctx: ExecutionContext | TriggerContext<Discord.Guild>,
  guildId: string,
): Promise<void> => {
  const rolesCfg = await ctx.config().get<RolesConfig>(guildId, Config.ROLES);
  if (!rolesCfg) {
    throw new Error('No birthday role configuration found');
  }

  if (!rolesCfg.birthday) return;

  const roles = await ctx.api.getGuildRoles(guildId);
  if (roles.find(r => r.id === rolesCfg.birthday)) {
    // Found birthday role
    const role = rolesCfg.birthday;
    const addRoleSchedule = '0 0 * * *'; // Each day at 00:00 Eastern
    const removeRoleSchedule = '59 23 * * *'; // Each day at 23:59 Eastern

    // Add birthday role
    jobAdd = new cron.CronJob(
      addRoleSchedule,
      async () => {
        const today = dayjs().format('MMDD');
        const isLeapYear = dayjs().isLeapYear();
        const birthdays = await ctx.birthdays().getByDay(guildId, today);

        if (birthdays && birthdays.users.length > 0) {
          for (let i = 0; i < birthdays.users.length; i++) {
            await ctx.api.addRoleToMember(guildId, birthdays.users[i], role);
          }
        }

        // Handle leap years
        if (!isLeapYear && today === '0228') {
          const leapYearBirthdays = await ctx
            .birthdays()
            .getByDay(guildId, dayjs('2/29/2000').format('MMDD'));

          if (leapYearBirthdays && leapYearBirthdays.users.length > 0) {
            for (let i = 0; i < leapYearBirthdays.users.length; i++) {
              await ctx.api.addRoleToMember(
                guildId,
                leapYearBirthdays.users[i],
                role,
              );
            }
          }
        }
      },
      undefined,
      undefined,
      'America/New_York',
    );

    // Remove birthday role
    jobRemove = new cron.CronJob(
      removeRoleSchedule,
      async () => {
        const today = dayjs().format('MMDD');
        const isLeapYear = dayjs().isLeapYear();
        const birthdays = await ctx.birthdays().getByDay(guildId, today);

        if (birthdays && birthdays.users.length > 0) {
          for (let i = 0; i < birthdays.users.length; i++) {
            await ctx.api.removeRoleFromMember(
              guildId,
              birthdays.users[i],
              role,
            );
          }
        }

        // Handle leap years
        if (!isLeapYear && today === '0228') {
          const leapYearBirthdays = await ctx
            .birthdays()
            .getByDay(guildId, dayjs('2/29/2000').format('MMDD'));

          if (leapYearBirthdays && leapYearBirthdays.users.length > 0) {
            for (let i = 0; i < leapYearBirthdays.users.length; i++) {
              await ctx.api.removeRoleFromMember(
                guildId,
                leapYearBirthdays.users[i],
                role,
              );
            }
          }
        }
      },
      undefined,
      undefined,
      'America/New_York',
    );
  }
};

export const startSchedulers = (): void => {
  if (jobAdd) {
    jobAdd.start();
  }
  if (jobRemove) {
    jobRemove.start();
  }
};

export const stopSchedulers = (): void => {
  if (jobAdd) {
    jobAdd.stop();
  }
  if (jobRemove) {
    jobRemove.stop();
  }
};

export const restartSchedulers = (): void => {
  stopSchedulers();
  startSchedulers();
};
