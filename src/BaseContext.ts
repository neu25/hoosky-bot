import * as Discord from './Discord';
import { Repositories } from './repository';
import Api from './Api';
import FollowUpManager, { MessageFollowUpHandler } from './FollowUpManager';
import CourseRepo from './repository/CourseRepo';
import MailRepo from './repository/MailRepo';
import ConfigRepo from './repository/ConfigRepo';
import Debouncer from './Debouncer';
import BirthdayRepo from './repository/BirthdayRepo';

export type State = Record<string, any>;

export type BaseContextOpts = {
  debouncer: Debouncer;
  botUser: Discord.User;
  repos: Repositories;
  api: Api;
  followUpManager: FollowUpManager;
};

class BaseContext {
  msgFollowUpHandlers: Record<string, MessageFollowUpHandler>;
  readonly debouncer: Debouncer;
  readonly botUser: Discord.User;
  readonly api: Api;
  readonly repos: Repositories;
  protected readonly _followUpManager: FollowUpManager;
  protected readonly _state: State;

  constructor(opts: BaseContextOpts) {
    this.debouncer = opts.debouncer;
    this.botUser = opts.botUser;
    this.repos = opts.repos;
    this.api = opts.api;
    this.msgFollowUpHandlers = {};
    this._state = {};
    this._followUpManager = opts.followUpManager;
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

  setState(key: string, value: unknown): void {
    this._state[key] = value;
  }

  getState(key: string): unknown | undefined {
    return this._state[key];
  }
}

export default BaseContext;
