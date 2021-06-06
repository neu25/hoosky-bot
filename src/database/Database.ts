import { Db, MongoClient } from 'mongodb';
import { Collection, Config, guildConfig } from './constants';

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
  db(): Db {
    return this._client.db(this._dbName);
  }

  /**
   * Inserts default configuration values into the `config` collection. If one
   * already exists, the insertion is skipped.
   */
  async initializeConfig(): Promise<void> {
    await this._insertDefaultConfigValue(Config.GUILD, guildConfig);
  }

  /**
   * Inserts a configuration document into the `config` collection if one does
   * not already exist.
   *
   * @param id The ID of the document.
   * @param value The value of the document.
   */
  private async _insertDefaultConfigValue(
    id: string,
    value: any,
  ): Promise<void> {
    await this.db()
      .collection(Collection.CONFIG)
      .updateOne(
        { _id: id },
        {
          $setOnInsert: {
            _id: id,
            value,
          },
        },
        { upsert: true },
      );
  }
}

export default Database;
