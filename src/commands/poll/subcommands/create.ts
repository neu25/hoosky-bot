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
    const userId = ctx.mustGetUserId();
    const username = ctx.interaction.member?.user?.username;
    const date = new Date(Date.now()).toLocaleString();
    const question = ctx.getArgument('question') as string;
    if (!userId) {
      return ctx.interactionApi.respondWithError('Unable to identify you');
    }

    const emojis = ctx.getArgument('emojis') as string;
    const emojiRegexAbomination =
      /<a:.+?:\d+>|\p{Extended_Pictographic}|<:.+?:\d+>/gu;
    const reactions = emojis.match(emojiRegexAbomination);

    if (reactions === null) {
      ctx.interactionApi.respondWithError('Please define valid emojis');
      return;
    }

    const descriptions =
      ctx.getArgument('descriptions') !== undefined
        ? (ctx.getArgument('descriptions') as string)
            .split(',')
            .map(function (segment) {
              return segment.trim();
            })
        : undefined;

    const embedFields: Discord.EmbedField[] = [];
    if (descriptions !== undefined && descriptions.length > reactions.length) {
      ctx.interactionApi.respondWithError(
        'There are too many descriptions for the specified amount of emojis',
      );
    } else if (
      descriptions !== undefined &&
      descriptions.length < reactions.length
    ) {
      ctx.interactionApi.respondWithError(
        'There are too few descriptions for the specified amount of emojis',
      );
    } else if (descriptions !== undefined) {
      for (let i = 0, len = descriptions.length; i < len; i++) {
        embedFields.push({
          name: ` - ${descriptions[i]}`,
          value: ` → ${reactions[i]}`,
          inline: true,
        });
      }
    }
    embedFields.push({
      name: `Created by: ${username}`,
      value: `*${date}*`,
    });

    const embed: Discord.Embed = {
      type: Discord.EmbedType.RICH,
      title: question,
      description: descriptions !== undefined ? 'Choices: ' : undefined,
      fields: embedFields,
      color: Discord.Color.PRIMARY,
    };

    await ctx.interactionApi.respondWithEmbed(embed);

    const msg = await ctx.interactionApi.getResponse();

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
      createdAt: date,
      createdBy: username,
    };

    ctx.poll().create(guildId, poll);
  },
});

export default create;
