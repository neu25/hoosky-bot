import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { bold } from '../../../format';
import SubCommand from '../../../SubCommand';

const disable = new SubCommand({
  name: 'disable',
  displayName: 'Disable Autoclear',
  description: 'Disable autoclear for a channel',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'Channel to disable autoclear for',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channel = ctx.getArgument<string>('channel')!;

    await ctx.autoclears().delete(guildId, channel);
    return ctx.interactionApi.respondWithMessage(
      bold('Disabled autoclearing') + ` of <#${channel}>.`,
    );
  },
});

export default disable;
