import Api from '../Api';
import { Repositories } from '../repository';
import AuditLogger from '../auditLogger';
import unmute, { UnmuteJobData } from './unmute';
import addBirthdayRoles, { AddBirthdayRolesData } from './addBirthdayRoles';
import removeBirthdayRoles, {
  RemoveBirthdayRolesData,
} from './removeBirthdayRoles';
import sendBirthdayMessages, {
  SendBirthdayMessagesData,
} from './sendBirthdayMessages';
import sendCountdownAnnouncements, {
  SendCountdownAnnouncementsData,
} from './sendCountdownAnnouncements';

export enum JobType {
  ADD_BIRTHDAY_ROLES = 'add_birthday_roles',
  REMOVE_BIRTHDAY_ROLES = 'remove_birthday_roles',
  SEND_BIRTHDAY_MESSAGES = 'send_birthday_messages',
  SEND_COUNTDOWN_ANNOUNCEMENTS = 'send_countdown_announcements',
  UNMUTE = 'unmute',
}

export type JobTypeMap = {
  [JobType.UNMUTE]: UnmuteJobData;
  [JobType.ADD_BIRTHDAY_ROLES]: AddBirthdayRolesData;
  [JobType.REMOVE_BIRTHDAY_ROLES]: RemoveBirthdayRolesData;
  [JobType.SEND_BIRTHDAY_MESSAGES]: SendBirthdayMessagesData;
  [JobType.SEND_COUNTDOWN_ANNOUNCEMENTS]: SendCountdownAnnouncementsData;
};

export type JobContext<T extends JobType> = {
  data: JobTypeMap[T];
  api: Api;
  repos: Repositories;
  auditLogger: AuditLogger;
};

export type JobHandler<T extends JobType = JobType> = (
  data: JobContext<T>,
) => Promise<unknown>;

export type JobHandlers = {
  [T in JobType]: JobHandler<T>;
};

/**
 * None of these job handlers have scheduling by themselves.
 * The Scheduler executes these at the scheduled times.
 */
const jobHandlers: JobHandlers = {
  [JobType.UNMUTE]: unmute,
  [JobType.ADD_BIRTHDAY_ROLES]: addBirthdayRoles,
  [JobType.REMOVE_BIRTHDAY_ROLES]: removeBirthdayRoles,
  [JobType.SEND_BIRTHDAY_MESSAGES]: sendBirthdayMessages,
  [JobType.SEND_COUNTDOWN_ANNOUNCEMENTS]: sendCountdownAnnouncements,
};

export default jobHandlers;
