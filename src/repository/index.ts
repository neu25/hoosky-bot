import { Database } from '../database';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import MailRepo from './MailRepo';

export type { Course, Section } from './CourseRepo';

export type Repositories = {
  courses: CourseRepo;
  mail: MailRepo;
  config: ConfigRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    courses: new CourseRepo(db),
    mail: new MailRepo(db),
    config: new ConfigRepo(db),
  };
};
export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
