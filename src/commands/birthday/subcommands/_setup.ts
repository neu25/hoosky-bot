import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config, BirthdaysConfig } from '../../../database';
import { bold } from '../../../format';

export const setup = new SubCommand({
  name: 'setup',
  displayName: 'Set Up Birthdays Channel',
  description: 'Set up channel for birthday messages',
  requiredPermissions: [Discord.Permission.MANAGE_ROLES],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'Birthdays channel',
      required: true,
      type: CommandOptionType.CHANNEL,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channel = ctx.getArgument<string>('channel') as string;

    // Fetch the role configuration from the database.
    const birthdaysCfg = await ctx.db.getConfigValue<BirthdaysConfig>(
      guildId,
      Config.BIRTHDAYS,
    );

    if (birthdaysCfg) {
      // Update the `birthdays` configuration value.
      birthdaysCfg.channel = channel;

      // Update database.
      await ctx.db.updateConfigValue(guildId, Config.BIRTHDAYS, birthdaysCfg);

      return ctx.respondWithMessage(
        `${bold('Birthdays channel updated')} to <#${channel}>`,
      );
    }

    return ctx.respondWithError(`Unable to update the birthdays channel`);
  },
});

export default setup;
