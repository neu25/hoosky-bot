import ExecutionContext from '../../ExecutionContext';
import { Poll } from '../../repository/PollRepo';
import * as Discord from '../../Discord';

export const calculateReactionCounts = async (
  ctx: ExecutionContext,
  poll: Poll,
): Promise<number[]> => {
  const reactionCounts: number[] = [];

  for (const emoji of poll.reactions) {
    let count = 0;
    const users = await ctx.api.getReactions(poll._id, poll.channelId, emoji);
    for (const user of users) {
      if (!user.bot) ++count;
    }
    reactionCounts.push(count);
  }

  return reactionCounts;
};

export const closePoll = async (
  ctx: ExecutionContext,
  guildId: string,
  poll: Poll,
): Promise<void> => {
  if (!poll.closed) {
    const reactionCounts: number[] = await calculateReactionCounts(ctx, poll);
    ctx.poll().setReactionCounts(guildId, poll._id, reactionCounts);

    const embedFields: Discord.EmbedField[] = [];
    for (let i = 0; i < reactionCounts.length; ++i) {
      embedFields.push({
        name: poll.reactions[i],
        value: `· ${reactionCounts[i]}`,
        inline: true,
      });
    }

    const embeds: Discord.Embed[] = [
      poll.embeds[0],
      {
        type: Discord.EmbedType.RICH,
        title: '***Poll closed!***\n**Results:**\n',
        fields: embedFields,
      },
    ];

    ctx.poll().setClosed(guildId, poll._id, true);
    ctx.poll().setEmbeds(guildId, poll._id, embeds);

    ctx.api.editMessage(poll.channelId, poll._id, {
      embeds: embeds,
    });

    ctx.api.deleteAllReactions(poll._id, poll.channelId);

    ctx.interactionApi.respondWithMessage('Poll closed succesfully.', true);
  } else {
    ctx.interactionApi.respondWithError('That poll is already closed.');
  }
};
