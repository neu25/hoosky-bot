import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { createPoll } from '../_common';

export const create = new SubCommand({
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
      description: "The poll's message",
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.interaction.member?.user?.id;
    if (!userId) {
      return ctx.respondWithError('Unable to identify you');
    }

    await ctx.respondWithMessage(ctx.getArgument('question') as string);

    const msg = await ctx.getResponse();
    const emojis = ctx.getArgument('emojis') as string;
    const customEmojiRegex = /<a:.+?:\d+>|<:.+?:\d+>/g;
    const customEmojis = emojis.match(customEmojiRegex);

    for (const c of emojis) {
      if (/\p{Extended_Pictographic}/u.test(c)) {
        await ctx.api.createReaction(msg.id, msg.channel_id, c);
      }
    }

    if (customEmojis != null)
      customEmojis.forEach(element => {
        ctx.api.createReaction(msg.id, msg.channel_id, element);
      });

    const poll = {
      _id: msg.id,
      userId: userId,
    };

    createPoll(ctx, guildId, poll);
  },
});
