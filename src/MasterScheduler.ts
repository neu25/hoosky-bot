import Scheduler, { Job } from './Scheduler';
import Api from './Api';
import { Repositories } from './repository';
import { JobType } from './jobHandlers';
import { addDefaultJobs } from './jobHandlers/_defaultJobs';
import AuditLogger from './auditLogger';

class MasterScheduler {
  private readonly _api: Api;
  private readonly _repos: Repositories;
  private readonly _schedulers: Record<string, Scheduler>;
  private readonly _auditLogger: AuditLogger;

  constructor(api: Api, repos: Repositories, auditLogger: AuditLogger) {
    this._api = api;
    this._repos = repos;
    this._auditLogger = auditLogger;
    this._schedulers = {};
  }

  async addJob<T extends JobType>(guildId: string, job: Job<T>): Promise<void> {
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

  async startSchedulerWithDefaultJobs(guildId: string): Promise<void> {
    this.stopScheduler(guildId);

    const sc = new Scheduler(
      this._api,
      this._repos,
      this._auditLogger,
      guildId,
    );
    this._schedulers[guildId] = sc;

    await sc.loadJobsFromRepo();
    await addDefaultJobs(sc, this._repos, guildId);
    await sc.start();
  }

  stopScheduler(guildId: string): void {
    const sc = this._schedulers[guildId];
    if (sc) {
      sc.stop();
    }
  }
}

export default MasterScheduler;
