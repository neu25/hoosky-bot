import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { Config } from '../../../database';
import { PinsConfig } from '../../../repository';
import { checkCtxPermissions } from '../../_utils';

const remove = new SubCommand({
  name: 'remove',
  displayName: 'Remove Pin',
  description: 'Unpin a message',
  options: [
    new CommandOption({
      name: 'link',
      description:
        'Hover over the message, click `⋯`, click `Copy Message Link`',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const link = ctx.getArgument<string>('link')!;

    // Parse message link.
    const ids = link.substr(link.indexOf('/channels/') + 10).split('/');
    const channelId = ids[1];
    const messageId = ids[2];

    // Get pins config.
    const pinsCfg = await ctx.config().get<PinsConfig>(guildId, Config.PINS);
    if (!pinsCfg || !pinsCfg.permittedChannels) {
      return ctx.interactionApi.respondWithError(
        `Unable to fetch pins config.`,
      );
    }

    const channelIndex = pinsCfg.permittedChannels.indexOf(channelId);

    const canManageChannel = checkCtxPermissions(ctx, [
      Discord.Permission.MANAGE_CHANNELS,
    ])[1];

    if (channelIndex > -1) {
      // Unpin message
      await ctx.api.unpinMessage(channelId, messageId);

      // Post silent confirmation
      return ctx.interactionApi.respondSilently('Message unpinned!');
    } else if (canManageChannel) {
      // Unpin message
      await ctx.api.unpinMessage(channelId, messageId);

      // Post silent confirmation
      return ctx.interactionApi.respondSilently(
        'Message unpinned using `MANAGE_CHANNELS` permissions.',
      );
    }

    // User does not have permission
    return ctx.interactionApi.respondWithError(
      'Unfortunately, you do not have permission to unpin messages in this channel.',
    );
  },
});

export default remove;
