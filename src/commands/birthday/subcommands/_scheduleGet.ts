import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config, BirthdaysConfig } from '../../../database';
import { bold } from '../../../format';

export const scheduleGet = new SubCommand({
  name: 'schedule-get',
  displayName: 'Get Schedule',
  description: 'Get schedule for sending birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    // Fetch the role configuration from the database.
    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (birthdaysCfg) {
      return ctx.respondWithMessage(
        `${bold('Birthdays schedule updated:')} \`${birthdaysCfg.schedule}\``,
      );
    }

    return ctx.respondWithError(`Unable to get the birthdays schedule`);
  },
});

export default scheduleGet;
