import { Db, MongoClient } from 'mongodb';

const GLOBAL_GUILD = 'global';

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
   * Returns the MongoDB database instance for the specified guild.
   */
  getDb(guildId: string): Db {
    return this._client.db(`${this._dbName}-${guildId}`);
  }

  /**
   * Returns the MongoDB database instance for all guilds.
   */
  getGlobalDb(): Db {
    return this.getDb(GLOBAL_GUILD);
  }
}

export default Database;
