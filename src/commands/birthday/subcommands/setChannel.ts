import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { CommandOptionType } from '../../../Discord';
import { Config } from '../../../database';
import { bold } from '../../../format';
import { BirthdaysConfig } from '../../../repository';

const setChannel = new SubCommand({
  name: 'set-channel',
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
    const channel = ctx.getArgument<string>('channel')!;

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
    birthdaysCfg.channel = channel;

    // Update database.
    await ctx.config().update(guildId, Config.BIRTHDAYS, birthdaysCfg);

    return ctx.interactionApi.respondWithMessage(
      `${bold('Birthdays channel updated')} to <#${channel}>`,
    );
  },
});

export default setChannel;
