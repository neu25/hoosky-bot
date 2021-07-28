import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config } from '../../../database';
import { bold } from '../../../format';
import { formatHourMinute } from '../../birthday/_common';
import { CountdownConfig } from '../../../repository/ConfigRepo';

const setSchedule = new SubCommand({
  name: 'set-schedule',
  displayName: 'Set Schedule',
  description: 'Set schedule for sending countdown announcements',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'hour',
      description: 'Hour, on a 24-hour clock, to send messages (e.g., 14)',
      required: true,
      type: CommandOptionType.INTEGER,
    }),
    new CommandOption({
      name: 'minute',
      description: 'Minute to send messages (e.g., 30)',
      required: true,
      type: CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const hour = ctx.getArgument<number>('hour')!;
    const minute = ctx.getArgument<number>('minute')!;

    // Fetch the role configuration from the database.
    const countdownCfg = await ctx
      .config()
      .get<CountdownConfig>(guildId, Config.COUNTDOWNS);
    if (!countdownCfg) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch countdown configuration.`,
      );
    }

    // Update the `countdown` configuration value.
    countdownCfg.scheduledHour = hour;
    countdownCfg.scheduledMinute = minute;

    // Update database.
    await ctx.config().update(guildId, Config.COUNTDOWNS, countdownCfg);

    // Restart the scheduler for this guild.
    await ctx.scheduler.startSchedulerWithDefaultJobs(guildId);

    return ctx.interactionApi.respondWithMessage(
      bold('Countdown schedule updated!') +
        ' Announcements will be made every day at ' +
        bold(formatHourMinute(hour, minute)) +
        '.',
    );
  },
});

export default setSchedule;
