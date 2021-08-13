import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { AnyboardConfig } from '../../../repository/ConfigRepo';
import { Config } from '../../../database';
import { bold, pluralize } from '../../../format';
import ExecutionContext from '../../../ExecutionContext';

export const respondAnyboardNotConfigured = async (
  ctx: ExecutionContext,
): Promise<void> => {
  await ctx.interactionApi.respondWithMessage(
    'Anyboard has not been configured yet. Run ' +
      bold('/anyboard configure') +
      ' to set it up.',
  );
};

const viewConfiguration = new SubCommand({
  name: 'view-configuration',
  displayName: 'View Anyboard Configuration',
  description:
    'View the channel, reaction threshold, and blacklisted channels configured for anyboard',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

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

    let msg =
      [
        `Anyboard is currently configured to <#${anyboardCfg.channelId}> with a threshold of`,
        bold(
          anyboardCfg.minReactionCount.toString(10) +
            pluralize(' reaction', anyboardCfg.minReactionCount) +
            '.',
        ),
      ].join(' ') + '\n';

    if (anyboardCfg.blacklistedChannelIds.length === 0) {
      msg += 'There are no blacklisted channels.';
    } else {
      msg +=
        'The following channels are blacklisted:\n' +
        anyboardCfg.blacklistedChannelIds.map(c => `• <#${c}>`).join('\n');
    }

    await ctx.interactionApi.respondWithMessage(msg);
  },
});

export default viewConfiguration;
