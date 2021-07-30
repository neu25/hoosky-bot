import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { bold } from '../../../format';
import { Config } from '../../../database';
import { GuildConfig } from '../../../repository';

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
    const guildId = ctx.mustGetGuildId();
    const channelId = ctx.getArgument<string>('channel')!;

    const channel = await ctx.api.getChannel(channelId);
    if (channel.type !== Discord.ChannelType.GUILD_TEXT) {
      return ctx.interactionApi.respondWithError(
        bold('Invalid channel type.') +
          ' The logging channel must be a text channel.',
      );
    }

    const currentGuildCfg =
      (await ctx.config().get<GuildConfig>(guildId, Config.GUILD)) ?? {};
    const update: Partial<GuildConfig> = {
      ...currentGuildCfg,
      loggingChannelId: channelId,
    };

    ctx.auditLogger.setChannel(guildId, channelId);
    await ctx.config().update(guildId, Config.GUILD, update);

    await ctx.interactionApi.respondWithMessage(
      bold('Logging channel set') + ` to <#${channelId}>.`,
    );
  },
});

export default setLoggingChannel;
