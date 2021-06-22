import { Db, MongoClient } from 'mongodb';
import {
  Collection,
  Config,
  guildConfig,
  rolesConfig,
  birthdaysConfig,
} from './constants';

class Database {
  private readonly _client: MongoClient;
  private readonly _dbName: string;

  constructor(url: string, dbName: string) {
    this._client = new MongoClient(url);
    this._dbName = dbName;
  }

  /**
   * Connects to the MongoDB database.
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client.connect(err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  /**
   * Returns the MongoClient instance.
   */
  client(): MongoClient {
    return this._client;
  }

  /**
   * Returns the MongoDB database instance.
   */
  getDb(guildId: string): Db {
    return this._client.db(`${this._dbName}-${guildId}`);
  }

  /**
   * Inserts default configuration values into the `config` collection. If one
   * already exists, the insertion is skipped.
   */
  async initializeConfig(guildIds: string[]): Promise<void> {
    for (const gId of guildIds) {
      await this.insertDefaultConfigValue(gId, Config.ROLES, rolesConfig);
      await this.insertDefaultConfigValue(gId, Config.GUILD, guildConfig);
      await this.insertDefaultConfigValue(
        gId,
        Config.BIRTHDAYS,
        birthdaysConfig,
      );
    }
  }

  async getConfigValue<T>(
    guildId: string,
    docId: string,
  ): Promise<Partial<T> | undefined> {
    const cfg = await this.getDb(guildId)
      .collection(Collection.CONFIG)
      .findOne({ _id: docId });
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
  async updateConfigValue(
    guildId: string,
    docId: string,
    value: unknown,
  ): Promise<void> {
    await this.getDb(guildId)
      .collection(Collection.CONFIG)
      .updateOne(
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

  /**
   * Inserts a configuration document into the `config` collection if one does
   * not already exist.
   *
   * @param guildId The ID of the guild.
   * @param docId The ID of the document.
   * @param value The value of the document.
   */
  async insertDefaultConfigValue(
    guildId: string,
    docId: string,
    value: unknown,
  ): Promise<void> {
    await this.getDb(guildId)
      .collection(Collection.CONFIG)
      .updateOne(
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
}

export default Database;
