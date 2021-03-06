import { Database } from '../database';
import BirthdayRepo from './BirthdayRepo';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import PollRepo from './PollRepo';
import MailRepo from './MailRepo';
import CountdownRepo from './CountdownRepo';
import CountdownAnnouncementRepo from './CountdownAnnouncementRepo';
import AutoclearRepo from './AutoclearRepo';
import JobRepo from './JobRepo';
import AnyboardMessageRepo from './AnyboardMessageRepo';

export type { Birthday, BirthdayMessage } from './BirthdayRepo';
export type { Course, Section } from './CourseRepo';

export type Repositories = {
  birthdays: BirthdayRepo;
  courses: CourseRepo;
  jobs: JobRepo;
  boardMessages: AnyboardMessageRepo;
  mail: MailRepo;
  config: ConfigRepo;
  countdowns: CountdownRepo;
  countdownAnnouncements: CountdownAnnouncementRepo;
  autoclear: AutoclearRepo;
  poll: PollRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    birthdays: new BirthdayRepo(db),
    courses: new CourseRepo(db),
    boardMessages: new AnyboardMessageRepo(db),
    jobs: new JobRepo(db),
    mail: new MailRepo(db),
    config: new ConfigRepo(db),
    countdowns: new CountdownRepo(db),
    countdownAnnouncements: new CountdownAnnouncementRepo(db),
    autoclear: new AutoclearRepo(db),
    poll: new PollRepo(db),
  };
};

export {
  BirthdaysConfig,
  GuildConfig,
  RolesConfig,
  PinsConfig,
} from './ConfigRepo';
