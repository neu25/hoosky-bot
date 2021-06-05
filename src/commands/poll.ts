import * as Discord from '../Discord';
import Command from '../Command';
import SubCommand from '../SubCommand';
import CommandOption from '../CommandOption';

/**
 * Basic /pool command.
 * TODO:
 *  - Find a non-spaghetti way of veryfing custom emojis (format: <:name:id> ) since they are multichar.
 *  - Delete poll/reactions
 *  - Time based poll
 *  - Reaction-count to close poll
 *
 */
const poll = new Command({
  name: 'poll',
  description: 'Manage polls',
  options: [
    new SubCommand({
      name: 'create',
      description: 'Create a new poll',
      options: [
        new CommandOption({
          name: 'emojis',
          description: 'Insert as many emojis as you want',
          required: true,
          type: Discord.CommandOptionType.STRING,
        }),
        new CommandOption({
          name: 'question',
          description: "The poll's message",
          required: true,
          type: Discord.CommandOptionType.STRING,
        }),
      ],
      handler: async ctx => {
        await ctx.respondWithMessage(ctx.getArgument('question') as string);

        const msg = await ctx.getResponse();
        const emojis = ctx.getArgument('emojis') as string;

        for (const c of emojis) {
          if (/\p{Extended_Pictographic}/u.test(c)) {
            await ctx.createReaction(msg.id, msg.channel_id, c);
          }
        }
      },
    }),
  ],
});

export default poll;
