import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { Config } from '../../../database';
import { PinsConfig } from '../../../repository';

const enable = new SubCommand({
  name: 'enable',
  displayName: 'Enable Pins',
  description: 'Enable pin commands',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel to enable pin commands in',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channel = ctx.getArgument<string>('channel')!;

    const pinsCfg = await ctx.config().get<PinsConfig>(guildId, Config.PINS);

    if (!pinsCfg || !pinsCfg.permittedChannels) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch pins config.`,
      );
    }

    // Channel is already enabled, return message.
    if (pinsCfg.permittedChannels.indexOf(channel) > -1) {
      return ctx.interactionApi.respondWithMessage(
        `<#${channel}> is already enabled.`,
      );
    }

    // Update the `pins` configuration value.
    pinsCfg.permittedChannels.push(channel);

    // Update database.
    await ctx.config().update(guildId, Config.PINS, pinsCfg);

    // Send confirmation.
    return ctx.interactionApi.respondWithMessage(
      `<#${channel}> is now enabled!`,
    );
  },
});

export default enable;
