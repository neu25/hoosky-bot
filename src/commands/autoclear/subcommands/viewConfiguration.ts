import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import { bold, inlineCode } from '../../../format';
import { formatMsLong } from '../../../utils';

const viewConfiguration = new SubCommand({
  name: 'view-configuration',
  displayName: 'View Autoclear Configuration',
  description:
    'View the channels and message expiration times configured for autoclear',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();

    const autoclears = await ctx.autoclears().list(guildId);

    if (autoclears.length === 0) {
      return ctx.interactionApi.respondWithMessage(
        'No autoclears have been configured yet. Run ' +
          bold('/autoclear enable') +
          ' to set up autoclear.',
      );
    }

    return ctx.interactionApi.respondWithMessage(
      'Autoclear is currently configured for the following channels:\n' +
        autoclears
          .map(
            ac => `• <#${ac._id}> - ${inlineCode(formatMsLong(ac.duration))}`,
          )
          .join('\n'),
    );
  },
});

export default viewConfiguration;
