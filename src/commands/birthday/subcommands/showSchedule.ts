import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config } from '../../../database';
import { BirthdaysConfig } from '../../../repository';
import { bold } from '../../../format';
import { formatHourMinute } from '../_common';

const showSchedule = new SubCommand({
  name: 'show-schedule',
  displayName: 'Show Schedule',
  description: 'Show schedule for sending birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    // Fetch the role configuration from the database.
    const birthdaysCfg = await ctx
      .config()
      .get<BirthdaysConfig>(guildId, Config.BIRTHDAYS);
    if (
      !birthdaysCfg ||
      birthdaysCfg.scheduledHour === undefined ||
      birthdaysCfg.scheduledMinute === undefined
    ) {
      return ctx.interactionApi.respondWithMessage(
        `No birthday schedule set. Run \`/birthday set-schedule\`.`,
      );
    }

    const { scheduledHour, scheduledMinute } = birthdaysCfg;
    return ctx.interactionApi.respondWithMessage(
      `Birthday messages send every day at ` +
        bold(formatHourMinute(scheduledHour, scheduledMinute)),
    );
  },
});

export default showSchedule;
