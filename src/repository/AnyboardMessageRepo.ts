import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';

export type AnyboardMessage = {
  _id: string; // Original message ID
  userId: string;
  sendDate: Date;
  highlightChannelId: string; // Channel ID of posted highlight
  highlightMessageId: string; // Message ID of posted highlight
  reactionCount: number;
};

class AnyboardMessageRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getByMessageId(
    guildId: string,
    messageId: string,
  ): Promise<AnyboardMessage | null> {
    return this.collection(guildId).findOne({ _id: messageId });
  }

  async create(guildId: string, message: AnyboardMessage): Promise<void> {
    await this.collection(guildId).insertOne(message);
  }

  async update(
    guildId: string,
    messageId: string,
    update: Partial<Omit<AnyboardMessage, '_id'>>,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: messageId },
      {
        $set: update,
      },
    );
  }

  async delete(guildId: string, messageId: string): Promise<void> {
    await this.collection(guildId).deleteOne({ _id: messageId });
  }

  async scan(guildId: string): Promise<Cursor<AnyboardMessage>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<AnyboardMessage[]> {
    return (await this.scan(guildId)).toArray();
  }

  /**
   * Returns the `boards` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<AnyboardMessage> {
    return this._db.getDb(guildId).collection(Collection.ANYBOARD_MESSAGES);
  }
}

export default AnyboardMessageRepo;
