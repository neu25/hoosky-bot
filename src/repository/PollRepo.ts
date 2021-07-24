import { Cursor, Collection as MongoCollection } from 'mongodb';
import { Collection, Database } from '../database';

export type Poll = {
  _id: string;
  userId: string;
  channelId: string;
  question: string;
  reactions: string[];
};

class PollRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async create(guildId: string, poll: Poll): Promise<void> {
    await this.collection(guildId).insertOne(poll);
  }

  async getById(
    guildId: string,
    pollId: string,
    userId?: string,
  ): Promise<Poll | null> {
    return this.collection(guildId).findOne({
      _id: pollId,
      userId: userId,
    });
  }

  async getAllByUserId(guildId: string, userId: string): Promise<Cursor<Poll>> {
    return this.collection(guildId).find({
      userId: userId,
    });
  }

  async deleteById(guildId: string, pollId: string): Promise<void> {
    await this.collection(guildId).deleteMany({ _id: pollId });
  }

  /**
   * Returns the `poll` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<Poll> {
    return this._db.getDb(guildId).collection(Collection.POLL);
  }
}

export default PollRepo;
