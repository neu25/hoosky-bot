import * as Discord from './Discord';
import { Repositories } from './repository';
import Api from './Api';
import FollowUpManager, { MessageFollowUpHandler } from './FollowUpManager';
import CourseRepo from './repository/CourseRepo';
import MailRepo from './repository/MailRepo';
import ConfigRepo from './repository/ConfigRepo';
import Debouncer from './Debouncer';
import PollRepo from './repository/PollRepo';
import BirthdayRepo from './repository/BirthdayRepo';
import CountdownRepo from './repository/CountdownRepo';
import MasterScheduler from './MasterScheduler';
import AuditLogger from './auditLogger';
import BoardRepo from './repository/BoardRepo';

export type State = Record<string, any>;

export type BaseContextOpts = {
  scheduler: MasterScheduler;
  debouncer: Debouncer;
  botUser: Discord.User;
  repos: Repositories;
  api: Api;
  followUpManager: FollowUpManager;
  auditLogger: AuditLogger;
};

class BaseContext {
  msgFollowUpHandlers: Record<string, MessageFollowUpHandler>;
  readonly scheduler: MasterScheduler;
  readonly debouncer: Debouncer;
  readonly botUser: Discord.User;
  readonly api: Api;
  readonly repos: Repositories;
  readonly auditLogger: AuditLogger;
  protected readonly _followUpManager: FollowUpManager;
  protected readonly _state: State;

  constructor(opts: BaseContextOpts) {
    this.scheduler = opts.scheduler;
    this.debouncer = opts.debouncer;
    this.botUser = opts.botUser;
    this.repos = opts.repos;
    this.api = opts.api;
    this.auditLogger = opts.auditLogger;
    this.msgFollowUpHandlers = {};
    this._state = {};
    this._followUpManager = opts.followUpManager;
  }

  countdowns(): CountdownRepo {
    return this.repos.countdowns;
  }

  boards(): BoardRepo {
    return this.repos.boards;
  }

  courses(): CourseRepo {
    return this.repos.courses;
  }

  mail(): MailRepo {
    return this.repos.mail;
  }

  birthdays(): BirthdayRepo {
    return this.repos.birthdays;
  }

  config(): ConfigRepo {
    return this.repos.config;
  }

  polls(): PollRepo {
    return this.repos.poll;
  }

  setState(key: string, value: unknown): void {
    this._state[key] = value;
  }

  getState(key: string): unknown | undefined {
    return this._state[key];
  }
}

export default BaseContext;
