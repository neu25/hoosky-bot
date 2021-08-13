import dayjs from 'dayjs';
import { BirthdaysConfig, Repositories } from '../repository';
import { Config } from '../database';
import Scheduler from '../Scheduler';
import { CountdownConfig } from '../repository/ConfigRepo';
import { JobType } from './index';

export const addDefaultJobs = async (
  scheduler: Scheduler,
  repos: Repositories,
  guildId: string,
): Promise<void> => {
  await addBirthdayRoleJobs(scheduler, guildId);
  await addBirthdayMessageJobs(scheduler, repos, guildId);
  await addCountdownAnnouncementJobs(scheduler, repos, guildId);
  await addAutoclearJobs(scheduler, guildId);
};

const getNextTimeOf = (
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): dayjs.Dayjs => {
  const now = dayjs();

  let nextMidnight = dayjs()
    .millisecond(millisecond)
    .second(second)
    .minute(minute)
    .hour(hour);
  if (nextMidnight.isBefore(now)) {
    nextMidnight = nextMidnight.add(1, 'day');
  }

  return nextMidnight;
};

export const addBirthdayRoleJobs = async (
  scheduler: Scheduler,
  guildId: string,
): Promise<void> => {
  const targetAddDate = getNextTimeOf(0, 0, 5);
  const targetRemoveDate = getNextTimeOf(23, 55, 0);

  /**
   * Add birthday roles at 12:05 AM.
   */
  await scheduler.addJob({
    _id: JobType.ADD_BIRTHDAY_ROLES,
    type: JobType.ADD_BIRTHDAY_ROLES,
    targetDate: targetAddDate.toDate(),
    data: { guildId },
    // After executing, run it again the next day.
    reschedule: lastDate => dayjs(lastDate).add(1, 'day').toDate(),
  });

  /**
   * Remove birthday roles at 11:55 PM.
   */
  await scheduler.addJob({
    _id: JobType.REMOVE_BIRTHDAY_ROLES,
    type: JobType.REMOVE_BIRTHDAY_ROLES,
    targetDate: targetRemoveDate.toDate(),
    data: { guildId },
    // After executing, run it again the next day.
    reschedule: lastDate => dayjs(lastDate).add(1, 'day').toDate(),
  });
};

export const addBirthdayMessageJobs = async (
  scheduler: Scheduler,
  repos: Repositories,
  guildId: string,
): Promise<void> => {
  const birthdaysCfg = await repos.config.get<BirthdaysConfig>(
    guildId,
    Config.BIRTHDAYS,
  );
  if (!birthdaysCfg) return;

  const { scheduledHour, scheduledMinute } = birthdaysCfg;
  if (scheduledHour === undefined || scheduledMinute === undefined) return;

  const targetSendDate = getNextTimeOf(scheduledHour, scheduledMinute);

  /**
   * Send birthday messages.
   */
  await scheduler.addJob({
    _id: JobType.SEND_BIRTHDAY_MESSAGES,
    type: JobType.SEND_BIRTHDAY_MESSAGES,
    targetDate: targetSendDate.toDate(),
    data: { guildId },
    // After executing, run it again the next day.
    reschedule: lastDate => dayjs(lastDate).add(1, 'day').toDate(),
  });
};

export const addCountdownAnnouncementJobs = async (
  scheduler: Scheduler,
  repos: Repositories,
  guildId: string,
): Promise<void> => {
  const countdownCfg = await repos.config.get<CountdownConfig>(
    guildId,
    Config.COUNTDOWNS,
  );
  if (!countdownCfg) return;

  const { scheduledHour, scheduledMinute } = countdownCfg;
  if (scheduledHour === undefined || scheduledMinute === undefined) return;

  const targetSendDate = getNextTimeOf(scheduledHour, scheduledMinute);

  /**
   * Send countdown messages.
   */
  await scheduler.addJob({
    _id: JobType.SEND_COUNTDOWN_ANNOUNCEMENTS,
    type: JobType.SEND_COUNTDOWN_ANNOUNCEMENTS,
    targetDate: targetSendDate.toDate(),
    data: { guildId },
    // After executing, run it again the next day.
    reschedule: lastDate => dayjs(lastDate).add(1, 'day').toDate(),
  });
};

export const addAutoclearJobs = async (
  scheduler: Scheduler,
  guildId: string,
): Promise<void> => {
  const nextHour = dayjs().millisecond(0).second(0).minute(0).add(1, 'hour');

  await scheduler.addJob({
    _id: JobType.AUTOCLEAR,
    type: JobType.AUTOCLEAR,
    targetDate: nextHour.toDate(),
    data: { guildId },
    reschedule: lastDate => dayjs(lastDate).add(1, 'hour').toDate(),
  });
};
