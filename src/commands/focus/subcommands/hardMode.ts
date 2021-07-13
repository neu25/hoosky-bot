import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { parseDuration } from '../_common';

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
    // const guildId = ctx.mustGetGuildId();
    const duration = ctx.getArgument<string>('duration')!.trim();
    const parsedDuration = parseDuration(duration);

    if (!parsedDuration || parsedDuration === 0) {
      return ctx.interactionApi.respondWithError(`Invalid duration`);
    }

    return ctx.interactionApi.respondWithError(
      `This command is still in development [Soft mode focus, ${parsedDuration} seconds]`,
    );
  },
});

export default hardMode;
