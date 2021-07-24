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
    const addRoleSchedule = '5 0 * * *'; // Each day at 00:05 Eastern Time
    const removeRoleSchedule = '55 23 * * *'; // Each day at 23:55 Eastern Time

    // Add birthday role
    jobAdd = new cron.CronJob(
      addRoleSchedule,
      async () => {
        console.log('[SCHEDULER] Running birthday add role');

        const today = dayjs().format('MM/DD');
        const isLeapYear = dayjs().isLeapYear();
        const birthdays = await ctx.birthdays().getByDay(guildId, today);

        if (birthdays) {
          for (const userId of birthdays.users) {
            await ctx.api.addRoleToMember(guildId, userId, role);
          }
        }

        // Handle leap years
        if (!isLeapYear && today === '02/28') {
          const leapYearBirthdays = await ctx
            .birthdays()
            .getByDay(guildId, dayjs('2/29/2000').format('MM/DD'));

          if (leapYearBirthdays) {
            for (const userId of leapYearBirthdays.users) {
              await ctx.api.addRoleToMember(guildId, userId, role);
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
        console.log('[SCHEDULER] Running birthday remove role');

        const today = dayjs().format('MM/DD');
        const isLeapYear = dayjs().isLeapYear();
        const birthdays = await ctx.birthdays().getByDay(guildId, today);

        if (birthdays) {
          for (const userId of birthdays.users) {
            await ctx.api.removeRoleFromMember(guildId, userId, role);
          }
        }

        // Handle leap years
        if (!isLeapYear && today === '02/28') {
          const leapYearBirthdays = await ctx
            .birthdays()
            .getByDay(guildId, dayjs('2/29/2000').format('MM/DD'));

          if (leapYearBirthdays) {
            for (const userId of leapYearBirthdays.users) {
              await ctx.api.removeRoleFromMember(guildId, userId, role);
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
