import * as Discord from '../../../Discord';
import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import { extractEmojis } from '../../../utils';

const configure = new SubCommand({
  name: 'configure',
  displayName: 'Configure',
  description: 'Configure a channel as a new starboard',
  requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
  options: [
    new CommandOption({
      name: 'channel',
      description: 'The channel to display boarded messages',
      required: true,
      type: Discord.CommandOptionType.CHANNEL,
    }),
    new CommandOption({
      name: 'emoji',
      description: 'The board’s emoji',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'min-reactions',
      description:
        'The minimum number of reactions required to get on the board',
      required: true,
      type: Discord.CommandOptionType.INTEGER,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const channelId = ctx.getArgument<string>('channel')!;
    const emojiString = ctx.getArgument<string>('emoji')!;
    const minReactions = ctx.getArgument<number>('min-reactions')!;

    // Make sure there is no existing board.
    const existingBoard = await ctx.boards().getByChannelId(guildId, channelId);
    if (existingBoard) {
      return ctx.interactionApi.respondWithError(
        `<#${channelId}> has already been taken by the starboard for emoji ${existingBoard.emoji}.`,
      );
    }

    const emojis = extractEmojis(emojiString);
    if (emojis === null || emojis.length === 0) {
      return ctx.interactionApi.respondWithError(
        'Please specify the board’s emoji.',
      );
    }
    const emoji = emojis[0];

    await ctx.boards().create(guildId, {
      _id: channelId,
      emoji,
      minReactions,
    });

    await ctx.interactionApi.respondWithMessage(
      `Starboard created for <#${channelId}> with ${minReactions} minimum reactions of ${emoji} required.`,
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
