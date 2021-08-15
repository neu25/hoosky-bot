import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';

export type Autoclear = {
  _id: string;
  duration: number; // in hours
};

class AutoclearRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async scan(guildId: string): Promise<Cursor<Autoclear>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<Autoclear[]> {
    return (await this.scan(guildId)).toArray();
  }

  async set(guildId: string, _id: string, duration: number): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id },
      { $set: { duration } },
      { upsert: true },
    );
  }

  async get(guildId: string, _id: string): Promise<Autoclear | null> {
    return await this.collection(guildId).findOne({ _id });
  }

  async delete(guildId: string, _id: string): Promise<void> {
    await this.collection(guildId).deleteOne({ _id });
  }

  collection(guildId: string): MongoCollection<Autoclear> {
    return this._db.getDb(guildId).collection(Collection.AUTOCLEAR);
  }
}

export default AutoclearRepo;
