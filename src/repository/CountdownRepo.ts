import { Collection as MongoCollection } from 'mongodb';
import { Collection, Database } from '../database';

export type Date = {
  _id: string;
  events: Event[];
};

export type Event = {
  name: string;
  channel: string;
};

class CountdownRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async create(guildId: string, date: string, event: Event): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: date },
      { $push: { events: event } },
      { upsert: true },
    );
  }

  /**
   * Returns the `countdowns` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<Date> {
    return this._db.getDb(guildId).collection(Collection.COUNTDOWNS);
  }
}

export default CountdownRepo;
