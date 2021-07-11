import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';

/**
 * Config data structures
 */

export type Birthday = {
  _id: number;
  users: string[];
};

export type BirthdayMessage = {
  id: number;
  message: string;
};

export type BirthdaysConfig = {
  schedule: string;
  channel: string;
  messages: BirthdayMessage[];
};

/**
 * Default config values
 */

export const birthdaysConfig: BirthdaysConfig = {
  schedule: '00 15 10 * * *',
  channel: '',
  messages: [{ id: 1, message: 'Happy birthday, %!' }],
};

class BirthdayRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  /**
   * Returns the `birthdays` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<Birthday> {
    return this._db.getDb(guildId).collection(Collection.BIRTHDAYS);
  }
}

export default BirthdayRepo;
