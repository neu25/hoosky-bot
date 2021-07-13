import { Database } from '../database';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import PollRepo from './PollRepo';
import MailRepo from './MailRepo';

export type { Course, Section } from './CourseRepo';

export type Repositories = {
  courses: CourseRepo;
  mail: MailRepo;
  config: ConfigRepo;
  poll: PollRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    courses: new CourseRepo(db),
    mail: new MailRepo(db),
    config: new ConfigRepo(db),
    poll: new PollRepo(db),
  };
};
export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
