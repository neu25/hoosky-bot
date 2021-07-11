import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';

const hardMode = new SubCommand({
  name: 'hard-mode',
  displayName: 'Hard Mode',
  description: 'Activate hard focus mode',
  requiredPermissions: [Discord.Permission.KICK_MEMBERS],
  options: [
    new CommandOption({
      name: 'duration',
      description: 'The duration to activate focus mode',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    return ctx.interactionApi.respondWithError(
      `This command is still in development.`,
    );
  },
});

export default hardMode;
