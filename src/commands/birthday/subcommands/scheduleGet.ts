import cronstrue from 'cronstrue';
import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config } from '../../../database';
import { BirthdaysConfig } from '../../../repository';

export const scheduleGet = new SubCommand({
  name: 'schedule-get',
  displayName: 'Get Schedule',
  description: 'Get schedule for sending birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    // Fetch the role configuration from the database.
    const birthdaysCfg = await ctx
      .config()
      .get<BirthdaysConfig>(guildId, Config.BIRTHDAYS);

    if (!birthdaysCfg || !birthdaysCfg.schedule) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch birthdays config`,
      );
    }

    return ctx.interactionApi.respondWithMessage(
      `Birthday messages send ${cronstrue
        .toString(birthdaysCfg.schedule, { verbose: true })
        .toLowerCase()}`,
    );
  },
});

export default scheduleGet;
