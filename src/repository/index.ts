import { Database } from '../database';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import SectionRepo from './SectionRepo';

export type { Course } from './CourseRepo';

export type Repositories = {
  courses: CourseRepo;
  config: ConfigRepo;
  sections: SectionRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    courses: new CourseRepo(db),
    config: new ConfigRepo(db),
    sections: new SectionRepo(db),
  };
};
export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
