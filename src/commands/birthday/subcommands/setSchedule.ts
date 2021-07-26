import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config } from '../../../database';
import { bold } from '../../../format';
import { BirthdaysConfig } from '../../../repository';
import { formatHourMinute } from '../_common';

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
    const hour = ctx.getArgument<number>('hour')!;
    const minute = ctx.getArgument<number>('minute')!;

    // Fetch the role configuration from the database.
    const birthdaysCfg = await ctx
      .config()
      .get<BirthdaysConfig>(guildId, Config.BIRTHDAYS);
    if (!birthdaysCfg) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch birthday configuration.`,
      );
    }

    // Update the `birthdays` configuration value.
    birthdaysCfg.scheduledHour = hour;
    birthdaysCfg.scheduledMinute = minute;

    // Update database.
    await ctx.config().update(guildId, Config.BIRTHDAYS, birthdaysCfg);

    // Restart the scheduler for this guild.
    await ctx.scheduler.startSchedulerWithDefaultJobs(guildId);

    return ctx.interactionApi.respondWithMessage(
      bold('Birthdays schedule updated!') +
        ' Messages will send every day at ' +
        bold(formatHourMinute(hour, minute)) +
        '.',
    );
  },
});

export default setSchedule;
