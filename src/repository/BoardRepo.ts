import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';

export type Board = {
  _id: string;
  emoji: string;
  minReactions: number;
};

class BoardRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getByChannelId(
    guildId: string,
    channelId: string,
  ): Promise<Board | null> {
    return this.collection(guildId).findOne({ _id: channelId });
  }

  async getByEmoji(guildId: string, emoji: string): Promise<Board | null> {
    return this.collection(guildId).findOne({ emoji });
  }

  async create(guildId: string, board: Board): Promise<void> {
    await this.collection(guildId).insertOne(board);
  }

  async scan(guildId: string): Promise<Cursor<Board>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<Board[]> {
    return (await this.scan(guildId)).toArray();
  }

  /**
   * Returns the `boards` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<Board> {
    return this._db.getDb(guildId).collection(Collection.BOARDS);
  }
}

export default BoardRepo;
