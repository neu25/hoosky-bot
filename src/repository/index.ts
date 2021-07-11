import { Database } from '../database';
import BirthdayRepo from './BirthdayRepo';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';

export type {
  Birthday,
  BirthdayMessage,
  BirthdaysConfig,
} from './BirthdayRepo';
export type { Course, Section } from './CourseRepo';

export type Repositories = {
  birthdays: BirthdayRepo;
  courses: CourseRepo;
  config: ConfigRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    birthdays: new BirthdayRepo(db),
    courses: new CourseRepo(db),
    config: new ConfigRepo(db),
  };
};

export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
