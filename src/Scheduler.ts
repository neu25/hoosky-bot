import jobHandlers, { JobHandler, JobType } from './jobHandlers';
import { Repositories } from './repository';
import { SerializedJob } from './repository/JobRepo';
import Api from './Api';

export const SCHEDULING_PASS_DELAY = 200;

export type Job<T extends JobType = JobType> = {
  reschedule?: (lastDate: Date) => Date;
} & SerializedJob<T>;

class Scheduler {
  private _cachedJobs: Record<string, Job>;
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

  jobs(): Job[] {
    return Object.values(this._cachedJobs);
  }

  async loadJobsFromRepo(): Promise<void> {
    const jobs = await this._repos.jobs.list(this._guildId);
    const cachedJobs: Record<string, SerializedJob> = {};
    for (const j of jobs) {
      cachedJobs[j._id] = j;
    }
    this._cachedJobs = cachedJobs;
  }

  start(): void {
    this.stop();
    console.log(`[Scheduler] Starting for guild ${this._guildId}`);

    this._loop = setInterval(
      () => this._schedulingPass(),
      SCHEDULING_PASS_DELAY,
    );
  }

  stop(): void {
    if (this._loop) {
      console.log(`[Scheduler] Stopping for guild ${this._guildId}`);
      clearInterval(this._loop);
    }
    this._loop = undefined;
  }

  async addJob<T extends JobType>(job: Job<T>): Promise<void> {
    console.log('[Scheduler] Adding job:', job);

    const { reschedule: _, ...serialized } = job;

    await this._repos.jobs.updateOrInsert(this._guildId, serialized);
    this._cachedJobs[job._id] = job;
  }

  async removeJob(id: string): Promise<void> {
    console.log(`[Scheduler] Removing job ${id}`);

    delete this._cachedJobs[id];
    await this._repos.jobs.delete(this._guildId, id);
  }

  private _schedulingPass(): void {
    const jobs = this._filterJobsToRun();

    for (const j of jobs) {
      console.log('[Scheduler] Running job:', j);

      // If the job should be reschedule, then override the stored job with the
      // new time. Otherwise, remove the job.
      if (j.reschedule) {
        const nextDate = j.reschedule(j.targetDate);
        this.addJob({ ...j, targetDate: nextDate }).catch(e => {
          throw e;
        });
      } else {
        this.removeJob(j._id).catch(e => {
          throw e;
        });
      }

      const handler = jobHandlers[j.type] as JobHandler;
      handler({
        repos: this._repos,
        api: this._api,
        data: j.data,
      }).catch(e => console.error(e));
    }
  }

  private _filterJobsToRun(): Job[] {
    const now = Date.now();
    return Object.values(this._cachedJobs).filter(
      j => now >= j.targetDate.getTime(),
    );
  }
}

export default Scheduler;
