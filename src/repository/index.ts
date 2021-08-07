import { Database } from '../database';
import BirthdayRepo from './BirthdayRepo';
import CourseRepo from './CourseRepo';
import ConfigRepo from './ConfigRepo';
import PollRepo from './PollRepo';
import MailRepo from './MailRepo';
import CountdownRepo from './CountdownRepo';
import CountdownAnnouncementRepo from './CountdownAnnouncementRepo';
import JobRepo from './JobRepo';
import BoardRepo from './BoardRepo';

export type { Birthday, BirthdayMessage } from './BirthdayRepo';
export type { Course, Section } from './CourseRepo';

export type Repositories = {
  birthdays: BirthdayRepo;
  courses: CourseRepo;
  jobs: JobRepo;
  boards: BoardRepo;
  mail: MailRepo;
  config: ConfigRepo;
  countdowns: CountdownRepo;
  countdownAnnouncements: CountdownAnnouncementRepo;
  poll: PollRepo;
};

export const setupRepos = (db: Database): Repositories => {
  return {
    birthdays: new BirthdayRepo(db),
    courses: new CourseRepo(db),
    boards: new BoardRepo(db),
    jobs: new JobRepo(db),
    mail: new MailRepo(db),
    config: new ConfigRepo(db),
    countdowns: new CountdownRepo(db),
    countdownAnnouncements: new CountdownAnnouncementRepo(db),
    poll: new PollRepo(db),
  };
};

export { BirthdaysConfig, GuildConfig, RolesConfig } from './ConfigRepo';
