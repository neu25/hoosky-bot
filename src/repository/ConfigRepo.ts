import { Collection as MongoCollection } from 'mongodb';
import { Collection, Config, Database } from '../database';

/**
 * Config data structures
 */

export type GuildConfig = {
  commandPrefixes: string[];
};

export type RolesConfig = {
  muted: string;
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

export const rolesConfig: RolesConfig = {
  muted: '',
};

export const guildConfig: GuildConfig = {
  commandPrefixes: ['-'],
};

export const birthdaysConfig: BirthdaysConfig = {
  schedule: '00 15 10 * * *',
  channel: '',
  messages: [{ id: 1, message: 'Happy birthday, %!' }],
};

class ConfigRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  /**
   * Inserts default configuration values into the `config` collection. If one
   * already exists, the insertion is skipped.
   */
  async initialize(guildIds: string[]): Promise<void> {
    for (const gId of guildIds) {
      await this.insertIfNotExists(gId, Config.ROLES, rolesConfig);
      await this.insertIfNotExists(gId, Config.GUILD, guildConfig);
      await this.insertIfNotExists(gId, Config.BIRTHDAYS, birthdaysConfig);
    }
  }

  async get<T>(
    guildId: string,
    docId: string,
  ): Promise<Partial<T> | undefined> {
    const cfg = await this.collection(guildId).findOne({ _id: docId });
    return (cfg || {}).value;
  }

  /**
   * Updates a configuration document into the `config` collection, creating
   * one if it does not exist.
   *
   * @param guildId The ID of the guild.
   * @param docId The ID of the document.
   * @param value The value of the document.
   */
  async update(guildId: string, docId: string, value: unknown): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: docId },
      {
        $set: {
          _id: docId,
          value,
        },
      },
      { upsert: true },
    );
  }

  async findBirthdayMessage(
    guildId: string,
    _id: number,
  ): Promise<BirthdayMessage> {
    return await this.collection(guildId).findOne({ _id });
  }

  /**
   * Inserts a configuration document into the `config` collection if one does
   * not already exist.
   *
   * @param guildId The ID of the guild.
   * @param docId The ID of the document.
   * @param value The value of the document.
   */
  async insertIfNotExists(
    guildId: string,
    docId: string,
    value: unknown,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      { _id: docId },
      {
        $setOnInsert: {
          _id: docId,
          value,
        },
      },
      { upsert: true },
    );
  }

  collection(guildId: string): MongoCollection {
    return this._db.getDb(guildId).collection(Collection.CONFIG);
  }
}

export default ConfigRepo;
