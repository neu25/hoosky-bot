import { MongoClient } from 'mongodb';

class Database {
  private readonly _client: MongoClient;

  constructor(url: string) {
    this._client = new MongoClient(url);
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
}

export default Database;
