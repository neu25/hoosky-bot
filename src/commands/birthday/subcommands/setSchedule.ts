import cronstrue from 'cronstrue';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config } from '../../../database';
import { bold } from '../../../format';
import { padNumber } from '../../../utils';
import { BirthdaysConfig } from '../../../repository';
import {
  configureScheduler,
  startScheduler,
  stopScheduler,
} from '../scheduler';

export const setSchedule = new SubCommand({
  name: 'set-schedule',
  displayName: 'Set Schedule',
  description: 'Set schedule for sending birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'hour',
      description: 'Hour to send messages (e.g., 09)',
      required: true,
      type: CommandOptionType.INTEGER,
    }),
    new CommandOption({
      name: 'minute',
      description: 'Minute to send messages (e.g., 45)',
      required: true,
      type: CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const hour = ctx.getArgument<number>('hour') as number;
    const minute = ctx.getArgument<number>('minute') as number;

    const paddedHour = padNumber(hour, 2);
    const paddedMinute = padNumber(minute, 2);
    const schedule = `00 ${paddedMinute} ${paddedHour} * * *`;

    // Fetch the role configuration from the database.
    const birthdaysCfg = await ctx
      .config()
      .get<BirthdaysConfig>(guildId, Config.BIRTHDAYS);

    if (!birthdaysCfg) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch birthdays config`,
      );
    }

    // Update the `birthdays` configuration value.
    birthdaysCfg.schedule = schedule;

    // Update database.
    await ctx.config().update(guildId, Config.BIRTHDAYS, birthdaysCfg);

    // Restart scheduler.
    await stopScheduler();
    await configureScheduler(ctx, guildId);
    await startScheduler();

    return ctx.interactionApi.respondWithMessage(
      `${bold('Birthdays schedule updated!')} Messages will send ${cronstrue
        .toString(schedule, {
          verbose: true,
        })
        .toLowerCase()}`,
    );
  },
});

export default setSchedule;
