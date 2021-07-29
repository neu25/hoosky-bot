import { Collection as MongoCollection } from 'mongodb';
import { Collection, Database } from '../database';

export type CountdownAnnouncement = {
  _id: string;
  channelId: string;
  eventId: number;
};

class CountdownAnnouncementRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async listByEventId(
    guildId: string,
    eventId: number,
  ): Promise<CountdownAnnouncement[] | null> {
    return this.collection(guildId).find({ eventId }).toArray();
  }

  async getByMessageId(
    guildId: string,
    messageId: string,
  ): Promise<CountdownAnnouncement | null> {
    return this.collection(guildId).findOne({ _id: messageId });
  }

  async create(
    guildId: string,
    channelId: string,
    messageId: string,
    eventId: number,
  ): Promise<void> {
    await this.collection(guildId).insertOne({
      _id: messageId,
      channelId,
      eventId,
    });
  }

  async deleteByEventId(guildId: string, eventId: number): Promise<void> {
    await this.collection(guildId).deleteMany({ eventId });
  }

  /**
   * Returns the `countdownAnnouncements` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<CountdownAnnouncement> {
    return this._db
      .getDb(guildId)
      .collection(Collection.COUNTDOWN_ANNOUNCEMENTS);
  }
}

export default CountdownAnnouncementRepo;
