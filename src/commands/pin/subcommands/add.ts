import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
// import ExecutionContext from '../../../ExecutionContext';

const add = new SubCommand({
  name: 'add',
  displayName: 'Add Pin',
  description: 'Pin a message',
  options: [
    new CommandOption({
      name: 'message',
      description: 'ID of the message to pin',
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

export default add;
