import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { Poll } from '../../../repository/PollRepo';

const create = new SubCommand({
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

    await ctx.respondWithEmbed({
      type: Discord.EmbedType.RICH,
      title: ctx.getArgument('question') as string,
      fields: [],
    });

    const msg = await ctx.getResponse();
    const emojis = ctx.getArgument('emojis') as string;
    const customEmojiRegex = /<a:.+?:\d+>|<:.+?:\d+>/g;
    const customEmojis = emojis.match(customEmojiRegex);
    const reactions = [];

    for (const c of emojis) {
      if (/\p{Extended_Pictographic}/u.test(c)) {
        await ctx.api.createReaction(msg.id, msg.channel_id, c);
        reactions.push(c);
      }
    }

    if (customEmojis != null)
      customEmojis.forEach(element => {
        ctx.api.createReaction(msg.id, msg.channel_id, element);
        reactions.push(element);
      });

    const poll: Poll = {
      _id: msg.id,
      userId: userId,
      channelId: msg.channel_id,
      content: msg.content,
      reactions: reactions,
      reactionCounts: [],
      closed: false,
    };

    ctx.poll().create(guildId, poll);
  },
});

export default create;
