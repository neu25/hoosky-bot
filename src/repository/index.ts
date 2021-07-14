import { Database } from '../database';
import BirthdayRepo from './BirthdayRepo';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import MailRepo from './MailRepo';

export type { Birthday, BirthdayMessage } from './BirthdayRepo';
export type { Course, Section } from './CourseRepo';

export type Repositories = {
  birthdays: BirthdayRepo;
  courses: CourseRepo;
  mail: MailRepo;
  config: ConfigRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    birthdays: new BirthdayRepo(db),
    courses: new CourseRepo(db),
    mail: new MailRepo(db),
    config: new ConfigRepo(db),
  };
};

export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
export { BirthdaysConfig } from './ConfigRepo';
