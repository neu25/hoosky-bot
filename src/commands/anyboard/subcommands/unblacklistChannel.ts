import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { AnyboardConfig } from '../../../repository/ConfigRepo';
import { Config } from '../../../database';
import { bold } from '../../../format';
import CommandOption from '../../../CommandOption';
import { respondAnyboardNotConfigured } from './viewConfiguration';

const unblacklistChannel = new SubCommand({
  name: 'unblacklist-channel',
  displayName: 'Un-blacklist Channel from Anyboard',
  description: 'Allow messages in a channel to be highlighted',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel to un-blacklist',
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

    const i = anyboardCfg.blacklistedChannelIds.findIndex(c => c === channelId);
    if (i === -1) {
      return ctx.interactionApi.respondWithError(
        `<#${channelId}> is not on the blacklist.`,
      );
    }

    anyboardCfg.blacklistedChannelIds.splice(i, 1);

    await ctx.config().update(guildId, Config.ANYBOARD, anyboardCfg);

    await ctx.interactionApi.respondWithMessage(
      [bold(`<#${channelId}> un-blacklisted`), 'from anyboard.'].join(' '),
    );
  },
});

export default unblacklistChannel;
