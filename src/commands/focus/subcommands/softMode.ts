import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';

const softMode = new SubCommand({
  name: 'soft-mode',
  displayName: 'Soft Mode',
  description: 'Activate soft focus mode',
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

export default softMode;
