import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { bold } from '../../../format';
import { Config } from '../../../database';
import { BotConfig } from '../../../repository/ConfigRepo';

const setLoggingChannel = new SubCommand({
  name: 'set-logging-channel',
  displayName: 'Set Logging Channel',
  description: 'Set the channel where bot logs are posted',
  requiredPermissions: [Discord.Permission.ADMINISTRATOR],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
  ],
  handler: async ctx => {
    const channelId = ctx.getArgument<string>('channel')!;

    const channel = await ctx.api.getChannel(channelId);
    if (channel.type !== Discord.ChannelType.GUILD_TEXT) {
      return ctx.interactionApi.respondWithError(
        bold('Invalid channel type.') +
          ' The logging channel must be a text channel.',
      );
    }

    const currentBotCfg =
      (await ctx.config().getGlobal<BotConfig>(Config.BOT)) ?? {};
    const update: Partial<BotConfig> = {
      ...currentBotCfg,
      loggingChannelId: channelId,
    };

    await ctx.config().updateGlobal(Config.BOT, update);

    await ctx.interactionApi.respondWithMessage(
      bold('Logging channel set') + ` to <#${channelId}>.`,
    );
  },
});

export default setLoggingChannel;
