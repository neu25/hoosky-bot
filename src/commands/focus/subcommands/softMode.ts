import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { parseDuration } from '../_common';

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
    // const guildId = ctx.mustGetGuildId();
    const duration = ctx.getArgument<string>('duration')!.trim();

    return ctx.interactionApi.respondWithError(
      `This command is still in development [Soft mode focus, ${parseDuration(
        duration,
      )} seconds]`,
    );
  },
});

export default softMode;
