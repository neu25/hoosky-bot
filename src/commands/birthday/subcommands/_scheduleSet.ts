import cronstrue from 'cronstrue';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config, BirthdaysConfig } from '../../../database';
import { bold } from '../../../format';
import { padNumber } from '../../../utils';
import {
  configureScheduler,
  startScheduler,
  stopScheduler,
} from '../scheduler';

export const scheduleSet = new SubCommand({
  name: 'schedule-set',
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
    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (birthdaysCfg) {
      // Update the `birthdays` configuration value.
      birthdaysCfg.schedule = schedule;

      // Update database.
      await ctx.db.updateConfigValue(guildId, Config.BIRTHDAYS, birthdaysCfg);

      // Restart scheduler.
      await stopScheduler();
      await configureScheduler(ctx, guildId);
      await startScheduler();

      return ctx.respondWithMessage(
        `${bold('Birthdays schedule updated!')} Messages will send ${cronstrue
          .toString(schedule, {
            verbose: true,
          })
          .toLowerCase()}`,
      );
    }

    return ctx.respondWithError(`Unable to update the birthdays schedule`);
  },
});

export default scheduleSet;
