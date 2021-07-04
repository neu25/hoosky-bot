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
      name: 'question',
      description: "The poll's message",
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'emojis',
      description: 'Insert as many emojis as you want',
      required: true,
      type: Discord.CommandOptionType.STRING,
    }),
    new CommandOption({
      name: 'descriptions',
      description:
        'Description for each emoji. Separate each description with a comma.',
      required: false,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.interaction.member?.user?.id;
    const question = ctx.getArgument('question') as string;
    if (!userId) {
      return ctx.respondWithError('Unable to identify you');
    }

    const emojis = ctx.getArgument('emojis') as string;
    const customEmojiRegex = /<a:.+?:\d+>|<:.+?:\d+>/g;
    const customEmojis = emojis.match(customEmojiRegex);
    const reactions = [];

    for (const c of emojis) {
      if (/\p{Extended_Pictographic}/u.test(c)) {
        reactions.push(c);
      }
    }

    if (customEmojis != null)
      customEmojis.forEach(element => {
        reactions.push(element);
      });

    const descriptions =
      ctx.getArgument('descriptions') != undefined
        ? (ctx.getArgument('descriptions') as string)
            .split(',')
            .map(function (segment) {
              return segment.trim();
            })
        : undefined;

    const embedFields: Discord.EmbedField[] = [];
    if (descriptions != undefined && descriptions.length > reactions.length) {
      ctx.respondWithError(
        'There are too many descriptions for the specified amount of emojis',
      );
    } else if (
      descriptions != undefined &&
      descriptions.length < reactions.length
    ) {
      ctx.respondWithError(
        'There are too few descriptions for the specified amount of emojis',
      );
    } else if (descriptions != undefined) {
      for (let i = 0, len = descriptions.length; i < len; i++) {
        embedFields.push({
          name: ` - ${descriptions[i]}`,
          value: ` → ${reactions[i]}`,
          inline: true,
        });
      }
    }

    const embed: Discord.Embed = {
      type: Discord.EmbedType.RICH,
      title: question,
      description: descriptions != undefined ? 'Options: ' : undefined,
      fields: embedFields,
    };

    await ctx.respondWithEmbed(embed);

    const msg = await ctx.getResponse();

    reactions.forEach(emoji => {
      ctx.api.createReaction(msg.id, msg.channel_id, emoji);
    });

    const poll: Poll = {
      _id: msg.id,
      userId: userId,
      channelId: msg.channel_id,
      question: question,
      reactions: reactions,
      reactionCounts: [],
      closed: false,
      embeds: [embed],
    };

    ctx.poll().create(guildId, poll);
  },
});

export default create;
