import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';

export type Birthday = {
  _id: number;
  users: string[];
};

export type BirthdayMessage = {
  id: number;
  message: string;
};

class BirthdayRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getByDay(guildId: string, day: number): Promise<Birthday | null> {
    return this.collection(guildId).findOne({ _id: day });
  }

  async getByUserId(guildId: string, userId: string): Promise<Birthday | null> {
    return this.collection(guildId).findOne({ users: userId });
  }

  async exists(guildId: string, userId: string): Promise<boolean> {
    return !!(await this.getByUserId(guildId, userId));
  }

  async dayExists(guildId: string, day: number): Promise<boolean> {
    return !!(await this.getByDay(guildId, day));
  }

  async scan(guildId: string): Promise<Cursor<Birthday>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<Birthday[]> {
    return (await this.scan(guildId)).toArray();
  }

  async birthdayExists(guildId: string, userId: string): Promise<boolean> {
    return !!(await this.getByUserId(guildId, userId));
  }

  async create(guildId: string, birthday: Birthday): Promise<void> {
    await this.collection(guildId).insertOne(birthday);
  }

  async set(guildId: string, day: number, userId: string): Promise<void> {
    if (await this.dayExists(guildId, day)) {
      await this.collection(guildId).updateOne(
        { _id: day },
        { $push: { users: userId } },
      );
    } else {
      await this.collection(guildId).insertOne({
        _id: day,
        users: [userId],
      });
    }
  }

  async unset(guildId: string, userId: string): Promise<void> {
    const birthday = await this.getByUserId(guildId, userId);
    const id = birthday?._id;

    await this.collection(guildId).updateOne(
      { _id: id },
      { $pull: { users: userId } },
    );

    // This user was the only user with a birthday on this day.
    // Delete the day.
    if (birthday && birthday.users.length === 1) {
      await this.collection(guildId).deleteOne({ _id: id });
    }
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
