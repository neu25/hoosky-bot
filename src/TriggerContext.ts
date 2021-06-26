import { AxiosInstance } from 'axios';
import Api from './Api';
import { Repositories } from './repository';
import ConfigRepo from './repository/ConfigRepo';
import CourseRepo from './repository/CourseRepo';

class TriggerContext<T> {
  readonly api: Api;
  readonly repos: Repositories;
  private readonly _data: T;

  constructor(
    appId: string,
    client: AxiosInstance,
    repos: Repositories,
    data: T,
  ) {
    this.api = new Api(appId, client);
    this.repos = repos;
    this._data = data;
  }

  courses(): CourseRepo {
    return this.repos.courses;
  }

  config(): ConfigRepo {
    return this.repos.config;
  }

  getData(): T {
    return this._data;
  }
}

export default TriggerContext;
