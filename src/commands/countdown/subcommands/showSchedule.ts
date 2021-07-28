import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config } from '../../../database';
import { CountdownConfig } from '../../../repository/ConfigRepo';
import { bold } from '../../../format';
import { formatHourMinute } from '../../birthday/_common';

const showSchedule = new SubCommand({
  name: 'show-schedule',
  displayName: 'Show Schedule',
  description: 'Show schedule for sending countdown announcements',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    // Fetch the role configuration from the database.
    const countdownCfg = await ctx
      .config()
      .get<CountdownConfig>(guildId, Config.COUNTDOWNS);
    if (
      !countdownCfg ||
      countdownCfg.scheduledHour === undefined ||
      countdownCfg.scheduledMinute === undefined
    ) {
      return ctx.interactionApi.respondWithMessage(
        `No countdown schedule is set. Run \`/countdown set-schedule\`.`,
      );
    }

    const { scheduledHour, scheduledMinute } = countdownCfg;
    return ctx.interactionApi.respondWithMessage(
      `Countdown announcements send every day at ` +
        bold(formatHourMinute(scheduledHour, scheduledMinute)),
    );
  },
});

export default showSchedule;
