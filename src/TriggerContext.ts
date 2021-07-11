import Api from './Api';
import { Repositories } from './repository';
import ConfigRepo from './repository/ConfigRepo';
import CourseRepo from './repository/CourseRepo';

class TriggerContext<T> {
  readonly api: Api;
  readonly repos: Repositories;
  readonly data: T;

  constructor(api: Api, repos: Repositories, data: T) {
    this.api = api;
    this.repos = repos;
    this.data = data;
  }

  courses(): CourseRepo {
    return this.repos.courses;
  }

  config(): ConfigRepo {
    return this.repos.config;
  }
}

export default TriggerContext;
