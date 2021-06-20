import ExecutionContext from '../../ExecutionContext';
import { Collection } from '../../database';
import { Collection as MongoCollection } from 'mongodb';

export type Poll = {
  _id: string;
  userId: string;
  locked?: boolean;
};

export const createPoll = async (
  ctx: ExecutionContext,
  guildId: string,
  poll: Poll,
): Promise<void> => {
  await pollCollection(ctx, guildId).insertOne(poll);
};

export const deletePolls = async (
  ctx: ExecutionContext,
  guildId: string,
  poll: Poll,
): Promise<void> => {
  const db = ctx.db.getDb(guildId);

  db.collection(Collection.POLL).deleteMany(
    { _id: poll.userId },
    function (err) {
      if (err) {
        console.log('Failed deleting the polls.');
        throw err;
      }
    },
  );
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
