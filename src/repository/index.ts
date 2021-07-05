import { Database } from '../database';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';

export type { Course } from './CourseRepo';

export type Repositories = {
  courses: CourseRepo;
  config: ConfigRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    courses: new CourseRepo(db),
    config: new ConfigRepo(db),
  };
};
export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
