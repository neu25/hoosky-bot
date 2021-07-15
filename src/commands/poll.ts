import * as Discord from '../Discord';
import Command from '../Command';
import SubCommand from '../SubCommand';
import CommandOption from '../CommandOption';

/**
 * Basic /poll command.
 * TODO:
 *  - Delete poll/reactions
 *  - Time based poll
 *  - Reaction-count to close poll
 */
const poll = new Command({
  name: 'poll',
  displayName: 'Poll',
  description: 'Manage polls',
  options: [
    new SubCommand({
      name: 'create',
      displayName: 'Create',
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
          description: 'The poll’s message',
          required: true,
          type: Discord.CommandOptionType.STRING,
        }),
      ],
      handler: async ctx => {
        await ctx.interactionApi.respondWithMessage(
          ctx.getArgument('question')!,
        );

        const msg = await ctx.interactionApi.getResponse();
        const emojis = ctx.getArgument<string>('emojis')!;
        const customEmojiRegex = /<a:.+?:\d+>|<:.+?:\d+>/g;
        const customEmojis = emojis.match(customEmojiRegex);

        for (const c of emojis) {
          if (/\p{Extended_Pictographic}/u.test(c)) {
            await ctx.api.createReaction(msg.id, msg.channel_id, c);
          }
        }

        if (customEmojis !== null)
          customEmojis.forEach(element => {
            ctx.api.createReaction(msg.id, msg.channel_id, element);
          });
      },
    }),
  ],
});

export default poll;
