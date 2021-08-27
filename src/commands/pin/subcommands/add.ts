import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { Config } from '../../../database';
import { PinsConfig } from '../../../repository';
import { checkCtxPermissions } from '../../_utils';
import { bold } from '../../../format';
import { extractIDsFromMessageLink, respondWithNoPinsConfig } from './_common';

const add = new SubCommand({
  name: 'add',
  displayName: 'Add Pin',
  description: 'Pin a message',
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

    const { messageId, channelId } = extractIDsFromMessageLink(link);

    // Get pins config.
    const pinsCfg = await ctx.config().get<PinsConfig>(guildId, Config.PINS);
    if (!pinsCfg || !pinsCfg.permittedChannels) {
      return respondWithNoPinsConfig(ctx);
    }

    const channelIndex = pinsCfg.permittedChannels.indexOf(channelId);

    const canManageChannel = checkCtxPermissions(ctx, [
      Discord.Permission.MANAGE_CHANNELS,
    ])[1];

    if (channelIndex > -1) {
      // Pin message
      await ctx.api.pinMessage(channelId, messageId);

      // Post confirmation
      return ctx.interactionApi.respondWithMessage(bold('Message pinned.'));
    } else if (canManageChannel) {
      // Pin message
      await ctx.api.pinMessage(channelId, messageId);

      // Post confirmation
      return ctx.interactionApi.respondWithMessage(
        bold('Message pinned') + ' using your `MANAGE_CHANNELS` permission.',
      );
    }

    // User does not have permission
    return ctx.interactionApi.respondWithError(
      'You do not have permission to pin messages in this channel.',
    );
  },
});

export default add;
