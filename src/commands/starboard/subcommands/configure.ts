import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { AnyboardConfig } from '../../../repository/ConfigRepo';
import { Config } from '../../../database';

const configure = new SubCommand({
  name: 'configure',
  displayName: 'Configure',
  description: 'Configure a channel as a new anyboard',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel to display highlighted messages',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
    new CommandOption({
      name: 'min-reactions',
      description:
        'The minimum number of reactions required to get highlighted',
      required: true,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channelId = ctx.getArgument<string>('channel')!;
    const minReactionCount = ctx.getArgument<number>('min-reactions')!;

    const cfgUpdate: Partial<AnyboardConfig> = {
      channelId,
      minReactionCount,
    };

    await ctx.config().update(guildId, Config.ANYBOARD, cfgUpdate);

    await ctx.interactionApi.respondWithMessage(
      `Anyboard set to <#${channelId}> with ${minReactionCount} reactions required.`,
    );

    /*
    Use response system to extract variables from parameters
    Use database as a means to communicate with starboard.ts and as a means to store aformentioned variables
    Implement/Utilize a listening system to recognize when the number of stars has been reached (DONE)
      Once code works, revamp setstarboard to include self-star:(boolean), starring a bot(boolean), and emoji(STRING)
  */
  },
});

export default configure;
