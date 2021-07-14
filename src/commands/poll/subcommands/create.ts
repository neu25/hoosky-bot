import SubCommand from '../../../SubCommand';
import CommandOption from '../../../CommandOption';
import * as Discord from '../../../Discord';
import { authorAvatarUrl } from '../../../cdn';
import { EM_SPACE } from '../../../format';
import ExecutionContext from '../../../ExecutionContext';

const respondWithCountMismatch = (
  ctx: ExecutionContext,
  emojiCount: number,
  descriptionCount: number,
): Promise<void> => {
  return ctx.interactionApi.respondWithError(
    `You supplied ${emojiCount} emojis but ${descriptionCount} descriptions. ` +
      `There should be exactly 1 description for each emoji, or no descriptions at all.`,
  );
};

const create = new SubCommand({
  name: 'create',
  displayName: 'Poll Create',
  description: 'Create a new poll',
  options: [
    new CommandOption({
      name: 'question',
      description: 'The poll question',
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
        'Descriptions, separated by commas, corresponding to each emoji (the order matters)',
      required: false,
      type: Discord.CommandOptionType.STRING,
    }),
  ],
  handler: async ctx => {
    const { interaction } = ctx;
    const user = interaction.member!.user!;
    const date = new Date();
    const guildId = ctx.mustGetGuildId();
    const userId = ctx.mustGetUserId();

    const question = ctx.getArgument<string>('question')!;
    const emojis = ctx.getArgument<string>('emojis')!;
    const descriptionsArg = ctx.getArgument<string>('descriptions');

    const emojiRegexAbomination =
      /<a:.+?:\d+>|\p{Extended_Pictographic}|<:.+?:\d+>/gu;
    const reactions = emojis.match(emojiRegexAbomination);

    if (reactions === null) {
      return ctx.interactionApi.respondWithError('Please define valid emojis');
    }

    const descriptions =
      descriptionsArg !== undefined
        ? descriptionsArg.split(',').map(segment => segment.trim())
        : undefined;

    let body = '';
    if (
      descriptions !== undefined &&
      descriptions.length !== reactions.length
    ) {
      return respondWithCountMismatch(
        ctx,
        reactions.length,
        descriptions.length,
      );
    } else if (descriptions !== undefined) {
      body = reactions
        .map((r, i) => `${r}${EM_SPACE}${descriptions[i]}`)
        .join('\n\n');
    }

    const embed: Discord.Embed = {
      type: Discord.EmbedType.RICH,
      color: Discord.Color.PRIMARY,
      author: {
        name: `${user.username}#${user.discriminator}`,
        icon_url: authorAvatarUrl(user),
      },
      title: question,
      description: body,
      timestamp: date.toISOString(),
    };

    await ctx.interactionApi.respondWithEmbed(embed);
    const msg = await ctx.interactionApi.getResponse();

    await ctx.poll().create(guildId, {
      _id: msg.id,
      userId: userId,
      channelId: msg.channel_id,
      question: question,
      reactions: reactions,
    });

    for (const emoji of reactions) {
      await ctx.api.createReaction(msg.channel_id, msg.id, emoji);
    }
  },
});

export default create;
