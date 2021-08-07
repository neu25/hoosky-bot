import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { AnyboardConfig } from '../../../repository/ConfigRepo';
import { Config } from '../../../database';
import { bold, pluralize } from '../../../format';

const configure = new SubCommand({
  name: 'configure',
  displayName: 'Configure Anyboard',
  description: 'Configure a channel as a new anyboard',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel to display highlighted messages',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
    new CommandOption({
      name: 'min-reactions',
      description:
        'The minimum number of reactions required to get highlighted',
      required: true,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channelId = ctx.getArgument<string>('channel')!;
    const minReactionCount = ctx.getArgument<number>('min-reactions')!;

    if (minReactionCount <= 0) {
      return ctx.interactionApi.respondWithError(
        'The reaction threshold must be greater than 0.',
      );
    }

    const anyboardCfg: AnyboardConfig = {
      channelId,
      minReactionCount,
      blacklistedChannelIds: [],
    };

    await ctx.config().update(guildId, Config.ANYBOARD, anyboardCfg);

    await ctx.interactionApi.respondWithMessage(
      [
        bold('Anyboard configured'),
        `to <#${channelId}> with`,
        bold(
          minReactionCount.toString(10) +
            ' ' +
            pluralize('reaction', minReactionCount),
        ),
        'required.',
      ].join(' '),
    );
  },
});

export default configure;
