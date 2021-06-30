import * as Discord from '../../Discord';
import Command from '../../Command';
import SubCommand from '../../SubCommand';
import CommandOption from '../../CommandOption';
import '../starboard/_Boards'


const setstarboard = new Command({
  name: 'setstarboard',
  description: 'Manage starboards',
  options: [
    new SubCommand({
      name: 'configure',
      displayName: 'Configure',
      description: 'Configure a channel as a new starboard',
      requiredPermissions: [Discord.Permission.MANAGE_CHANNELS],
      options: [
        new CommandOption({
          name: 'channel',
          description: 'Choose the new starboard channel',
          required: true,
          type: Discord.CommandOptionType.CHANNEL,
        }),
        new CommandOption({
          name: 'emoji',
          description: "Choose new board's emoji",
          required: true,
          type: Discord.CommandOptionType.STRING,
        }),
        new CommandOption({
          name: 'minstars',
          description: 'Minimum stars required to get on the board',
          required: true,
          type: Discord.CommandOptionType.INTEGER,
        }),
      ],
      handler: async ctx => {
        //get information about new board
        const channelId = ctx.getArgument('channel') as string;
        const channelName = (await ctx.api.getChannel(channelId)).name;
        const emoji = ctx.getArgument('emoji') as string;
        const minstars = ctx.getArgument('minstars') as number;
        //respond to user
        await ctx.respondWithMessage(`Starboard created in <#${channelId}> with ${minstars} minimum reactions of ${emoji} required`);
        //add information to Boards object so it can be accessed from starboard.ts
        Boards.addBoard(channelName!,channelId,emoji,minstars)
        /*
        Use response system to extract variables from parameters
        Use database as a means to communicate with starboard.ts and as a means to store aformentioned variables
        Implement/Utilize a listening system to recognize when the number of stars has been reached (DONE)
          Once code works, revamp setstarboard to include self-star:(boolean), starring a bot(boolean), and emoji(STRING)
      */
      },
    }),
  ],
});

export default setstarboard;
