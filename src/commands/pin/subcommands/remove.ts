import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
// import ExecutionContext from '../../../ExecutionContext';

const remove = new SubCommand({
  name: 'remove',
  displayName: 'Remove Pin',
  description: 'Unpin a message',
  options: [
    new CommandOption({
      name: 'message',
      description: 'ID of the message to unpin',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    // const guildId = ctx.mustGetGuildId();
    // const channel = ctx.getArgument<string>('channel')!;

    return ctx.interactionApi.respondWithMessage('Placeholder');
  },
});

export default remove;
