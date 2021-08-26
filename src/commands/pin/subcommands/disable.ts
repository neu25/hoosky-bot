import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { Config } from '../../../database';
import { PinsConfig } from '../../../repository';

const disable = new SubCommand({
  name: 'disable',
  displayName: 'Disable Pins',
  description: 'Disable pin commands',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel to disable pin commands in',
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

    const channelIndex = pinsCfg.permittedChannels.indexOf(channel);

    // Channel is already disabled, return message.
    if (channelIndex === -1) {
      return ctx.interactionApi.respondWithMessage(
        `<#${channel}> is already disabled.`,
      );
    }

    // Update the `pins` configuration value.
    pinsCfg.permittedChannels.splice(channelIndex, 1);

    // Update database.
    await ctx.config().update(guildId, Config.PINS, pinsCfg);

    // Send confirmation.
    return ctx.interactionApi.respondWithMessage(
      `<#${channel}> is now disabled!`,
    );
  },
});

export default disable;
