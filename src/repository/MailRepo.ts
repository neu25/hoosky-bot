import { Collection as MongoCollection } from 'mongodb';
import { Collection, Database } from '../database';

export type MailThread = {
  _id: string; // The ID of the user who started the mail thread.
  dmChannelId: string;
  threadChannelId: string;
  topControlsMsgId: string;
  lastSenderMsgId: string;
};

class MailRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getByUserId(
    guildId: string,
    userId: string,
  ): Promise<MailThread | null> {
    return this.collection(guildId).findOne({ _id: userId });
  }

  async getByChannelId(
    guildId: string,
    threadChannelId: string,
  ): Promise<MailThread | null> {
    return this.collection(guildId).findOne({ threadChannelId });
  }

  async updateByUserId(
    guildId: string,
    userId: string,
    thread: Partial<Omit<MailThread, '_id'>>,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: userId },
      {
        $set: thread,
      },
      { upsert: true },
    );
  }

  async deleteByChannelId(
    guildId: string,
    threadChannelId: string,
  ): Promise<void> {
    await this.collection(guildId).deleteOne({ threadChannelId });
  }

  /**
   * Returns the `mail` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<MailThread> {
    return this._db.getDb(guildId).collection(Collection.MAIL);
  }
}

export default MailRepo;
