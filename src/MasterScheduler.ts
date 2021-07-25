import Scheduler from './Scheduler';
import Api from './Api';
import { Repositories } from './repository';
import { SerializedJob } from './repository/JobRepo';

class MasterScheduler {
  private readonly _api: Api;
  private readonly _repos: Repositories;
  private readonly _schedulers: Record<string, Scheduler>;

  constructor(api: Api, repos: Repositories) {
    this._api = api;
    this._repos = repos;
    this._schedulers = {};
  }

  async addJob(
    guildId: string,
    job: Omit<SerializedJob, '_id'>,
  ): Promise<void> {
    await this.mustGetScheduler(guildId).addJob(job);
  }

  async removeJob(guildId: string, jobId: string): Promise<void> {
    await this.mustGetScheduler(guildId).removeJob(jobId);
  }

  mustGetScheduler(guildId: string): Scheduler {
    const sc = this._schedulers[guildId];
    if (!sc) {
      throw new Error(`No scheduler found for guild ${guildId}`);
    }
    return sc;
  }

  async _startScheduler(guildId: string): Promise<void> {
    this._stopScheduler(guildId);

    const sc = new Scheduler(this._api, this._repos, guildId);
    await sc.start();

    this._schedulers[guildId] = sc;
  }

  _stopScheduler(guildId: string): void {
    const sc = this._schedulers[guildId];
    if (sc) {
      sc.stop();
    }
  }
}

export default MasterScheduler;
