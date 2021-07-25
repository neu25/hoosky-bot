import jobHandlers from './jobHandlers';
import { Repositories } from './repository';
import { SerializedJob } from './repository/JobRepo';
import Api from './Api';
import { generateId } from './utils';

export const SCHEDULING_PASS_DELAY = 500;

class Scheduler {
  private _cachedJobs: Record<string, SerializedJob>;
  private _loop?: NodeJS.Timeout;
  private readonly _guildId: string;
  private readonly _repos: Repositories;
  private readonly _api: Api;

  constructor(api: Api, repos: Repositories, guildId: string) {
    this._cachedJobs = {};
    this._guildId = guildId;
    this._api = api;
    this._repos = repos;
  }

  async start(): Promise<void> {
    const jobs = await this._repos.jobs.list(this._guildId);
    this.stop();

    const cachedJobs: Record<string, SerializedJob> = {};
    for (const j of jobs) {
      cachedJobs[j._id] = j;
    }
    this._cachedJobs = cachedJobs;

    this._loop = setInterval(
      () => this._schedulingPass(),
      SCHEDULING_PASS_DELAY,
    );
  }

  stop(): void {
    if (this._loop) {
      clearInterval(this._loop);
    }
    this._loop = undefined;
  }

  async addJob(job: Omit<SerializedJob, '_id'>): Promise<void> {
    const taggedJob = {
      ...job,
      _id: job.type + `-${Date.now()}-${generateId()}`,
    };

    console.log('[SCHEDULER] Adding job:', taggedJob);

    await this._repos.jobs.create(this._guildId, taggedJob);
    this._cachedJobs[taggedJob._id] = taggedJob;
  }

  async removeJob(id: string): Promise<void> {
    console.log(`[SCHEDULER] Removing job ${id}`);

    delete this._cachedJobs[id];
    await this._repos.jobs.delete(this._guildId, id);
  }

  private _schedulingPass(): void {
    const jobs = this._filterJobsToRun();

    for (const j of jobs) {
      console.log('[SCHEDULER] Running job:', j);

      this.removeJob(j._id).catch(e => {
        throw e;
      });

      jobHandlers[j.type]({
        repos: this._repos,
        api: this._api,
        data: j.data,
      }).catch(e => console.error(e));
    }
  }

  private _filterJobsToRun(): SerializedJob[] {
    const now = Date.now();
    return Object.values(this._cachedJobs).filter(
      j => now >= j.targetDate.getTime(),
    );
  }
}

export default Scheduler;
