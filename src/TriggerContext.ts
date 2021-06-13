import { Database } from './database';
import Api from './Api';

class TriggerContext<T> {
  readonly api: Api;
  readonly db: Database;
  private readonly _data: T;

  constructor(appId: string, token: string, database: Database, data: T) {
    this.api = new Api(appId, token);
    this.db = database;
    this._data = data;
  }

  getData(): T {
    return this._data;
  }
}

export default TriggerContext;
