import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';

export type CountdownDate = {
  _id: string;
  events: Event[];
};

export type Event = {
  id: number;
  name: string;
  channel: string;
};

class CountdownRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getById(guildId: string, id: number): Promise<CountdownDate | null> {
    return this.collection(guildId).findOne({ 'events.id': id });
  }

  async getByDate(
    guildId: string,
    date: string,
  ): Promise<CountdownDate | null> {
    return this.collection(guildId).findOne({ _id: date });
  }

  async scan(guildId: string): Promise<Cursor<CountdownDate>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<CountdownDate[]> {
    return (await this.scan(guildId)).toArray();
  }

  async create(guildId: string, date: string, event: Event): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: date },
      { $push: { events: event } },
      { upsert: true },
    );
  }

  async deleteCountdown(guildId: string, date: string): Promise<void> {
    await this.collection(guildId).deleteOne({ _id: date });
  }

  async deleteEvent(guildId: string, date: string, id: number): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: date },
      { $pull: { events: { id } } },
    );
  }

  /**
   * Returns the `countdowns` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<CountdownDate> {
    return this._db.getDb(guildId).collection(Collection.COUNTDOWNS);
  }
}

export default CountdownRepo;
