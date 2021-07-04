import { Database } from '../database';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import PollRepo from './PollRepo';

export type { Course } from './CourseRepo';

export type Repositories = {
  courses: CourseRepo;
  config: ConfigRepo;
  poll: PollRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    courses: new CourseRepo(db),
    config: new ConfigRepo(db),
    poll: new PollRepo(db),
  };
};
export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
