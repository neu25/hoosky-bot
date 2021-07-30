import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { Config } from '../../../database';
import { GlobalMailConfig } from '../../../repository/ConfigRepo';
import CommandOption from '../../../CommandOption';

const setup = new SubCommand({
  name: 'setup',
  displayName: 'Mail Setup',
  description: 'Sets up server mail',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  options: [
    new CommandOption({
      name: 'category',
      description:
        'The channel category in which to create mail thread channels',
      type: Discord.CommandOptionType.CHANNEL,
      required: true,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const categoryId = ctx.getArgument<string>('category')!;

    const channel = await ctx.api.getChannel(categoryId);
    if (channel.type !== Discord.ChannelType.GUILD_CATEGORY) {
      return ctx.interactionApi.respondWithError(
        `<#${categoryId}> is not a channel category.`,
      );
    }

    // Update the mail configuration in the database.
    const mailCfg: GlobalMailConfig = {
      categoryId,
      guildId,
      blockedUserIds: [],
    };
    await ctx.config().updateGlobal(Config.MAIL, mailCfg);

    return ctx.interactionApi.respondWithMessage(
      'Successfully set up server mail',
    );
  },
});

export default setup;
