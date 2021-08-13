import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { AnyboardConfig } from '../../../repository/ConfigRepo';
import { Config } from '../../../database';
import { bold } from '../../../format';
import CommandOption from '../../../CommandOption';
import { respondAnyboardNotConfigured } from './viewConfiguration';

const blacklistChannel = new SubCommand({
  name: 'blacklist-channel',
  displayName: 'Blacklist Channel from Anyboard',
  description: 'Prevent messages in a channel from being highlighted',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel to blacklist',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channelId = ctx.getArgument<string>('channel')!;

    const anyboardCfg = await ctx
      .config()
      .get<AnyboardConfig>(guildId, Config.ANYBOARD);
    if (
      !anyboardCfg ||
      !anyboardCfg.channelId ||
      !anyboardCfg.minReactionCount ||
      !anyboardCfg.blacklistedChannelIds
    ) {
      return respondAnyboardNotConfigured(ctx);
    }

    // Ignore if the channel is already blacklisted.
    if (anyboardCfg.blacklistedChannelIds.includes(channelId)) {
      await ctx.interactionApi.respondWithError(
        `<#${channelId}> is already on the blacklist.`,
      );
      return;
    }
    anyboardCfg.blacklistedChannelIds.push(channelId);

    await ctx.config().update(guildId, Config.ANYBOARD, anyboardCfg);

    await ctx.interactionApi.respondWithMessage(
      [bold(`<#${channelId}> blacklisted`), 'from anyboard.'].join(' '),
    );
  },
});

export default blacklistChannel;
