import { Database } from '../database';
import BirthdayRepo from './BirthdayRepo';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import PollRepo from './PollRepo';
import MailRepo from './MailRepo';
import JobRepo from './JobRepo';

export type { Birthday, BirthdayMessage } from './BirthdayRepo';
export type { Course, Section } from './CourseRepo';

export type Repositories = {
  birthdays: BirthdayRepo;
  courses: CourseRepo;
  jobs: JobRepo;
  mail: MailRepo;
  config: ConfigRepo;
  poll: PollRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    birthdays: new BirthdayRepo(db),
    courses: new CourseRepo(db),
    jobs: new JobRepo(db),
    mail: new MailRepo(db),
    config: new ConfigRepo(db),
    poll: new PollRepo(db),
  };
};

export { RolesConfig } from './ConfigRepo';
export { GuildConfig } from './ConfigRepo';
export { BirthdaysConfig } from './ConfigRepo';
