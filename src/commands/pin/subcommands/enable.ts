import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
// import ExecutionContext from '../../../ExecutionContext';

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
    // const guildId = ctx.mustGetGuildId();
    // const channel = ctx.getArgument<string>('channel')!;

    return ctx.interactionApi.respondWithMessage('Placeholder');
  },
});

export default enable;
