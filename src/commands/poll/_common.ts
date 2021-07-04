import ExecutionContext from '../../ExecutionContext';
import { Collection } from '../../database';
import { Collection as MongoCollection } from 'mongodb';

export type Poll = {
  _id: string;
  userId: string;
  channelId: string;
  content: string;
  reactions: string[];
  reactionCounts?: number[];
  closed?: boolean;
};

export const createPoll = async (
  ctx: ExecutionContext,
  guildId: string,
  poll: Poll,
): Promise<void> => {
  await pollCollection(ctx, guildId).insertOne(poll);
};

export const getPoll = async (
  ctx: ExecutionContext,
  guildId: string,
  pollId: string,
  userId?: string,
): Promise<Poll | null> => {
  const poll = await pollCollection(ctx, guildId).findOne({
    _id: pollId,
    userId: userId,
  });
  if (poll != null) {
    return poll;
  } else {
    await ctx.respondWithMessage(
      `Couldn't find Poll with id: ${pollId}\nEither it isn't your poll or it doesn't exist.`,
      true,
    );
    return null;
  }
};

export const deletePoll = async (
  ctx: ExecutionContext,
  guildId: string,
  pollId: string,
): Promise<void> => {
  pollCollection(ctx, guildId).deleteMany({ _id: pollId }, function (err) {
    if (err) {
      console.log('Failed deleting the polls.');
      throw err;
    }
  });
};

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

export const setReactionCounts = async (
  ctx: ExecutionContext,
  guildId: string,
  pollId: string,
  counts: number[],
): Promise<void> => {
  pollCollection(ctx, guildId).updateOne(
    { _id: pollId },
    { $set: { reactionCounts: counts } },
  );
};

export const setClosed = async (
  ctx: ExecutionContext,
  guildId: string,
  pollId: string,
  bool?: true | boolean,
): Promise<void> => {
  pollCollection(ctx, guildId).updateOne(
    { _id: pollId },
    { $set: { closed: bool } },
  );
};

export const closePoll = async (
  ctx: ExecutionContext,
  guildId: string,
  poll: Poll,
): Promise<void> => {
  if (!poll.closed) {
    const reactionCounts: number[] = await calculateReactionCounts(ctx, poll);
    setReactionCounts(ctx, guildId, poll._id, reactionCounts);

    let content = `${poll.content}\n\n***Poll closed!***\n**Results:**\n`;
    for (let i = 0; i < reactionCounts.length; ++i) {
      content += `    ${poll.reactions[i]} - ${reactionCounts[i]}\n`;
    }

    setClosed(ctx, guildId, poll._id, true);
    ctx.api.editMessage(poll._id, poll.channelId, content);
    ctx.api.deleteAllReactions(poll._id, poll.channelId);

    ctx.respondWithMessage('Poll closed succesfully.', true);
  } else {
    ctx.respondWithMessage('That poll is already closed.', true);
  }
};

/**
 * Returns the `poll` collection for the specified guild.
 *
 * @param ctx The relevant execution context.
 * @param guildId The ID of the guild.
 */
const pollCollection = (
  ctx: ExecutionContext,
  guildId: string,
): MongoCollection<Poll> => {
  return ctx.db.getDb(guildId).collection(Collection.POLL);
};
