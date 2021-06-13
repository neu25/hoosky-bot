import { Database } from './database';
import Api from './Api';
import { AxiosInstance } from 'axios';

class TriggerContext<T> {
  readonly api: Api;
  readonly db: Database;
  private readonly _data: T;

  constructor(
    appId: string,
    client: AxiosInstance,
    database: Database,
    data: T,
  ) {
    this.api = new Api(appId, client);
    this.db = database;
    this._data = data;
  }

  getData(): T {
    return this._data;
  }
}

export default TriggerContext;
