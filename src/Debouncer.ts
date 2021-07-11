export type DebounceCallback<D> = (
  bouncedData: D[],
) => unknown | Promise<unknown>;

export type DebounceJob<D> = {
  bouncedData: D[];
  timer: NodeJS.Timeout;
  callback: DebounceCallback<D>;
};

/**
 * Debouncer acts as a rate-limiter, preventing users from overloading the bot and
 * generating excessive API requests.
 *
 * Instead of cancelling a rapid burst of jobs occurring over an interval of time,
 * it aggregates the data of each job. After the cooldown is over and no more jobs
 * of that type are being executed, a single execution occurs with ALL of the
 * accumulated job data.
 */
class Debouncer {
  private readonly _jobs: Record<string, DebounceJob<any>>;

  constructor() {
    this._jobs = {};
  }

  /**
   * Debounces, or limits the rate at which the callback function is invoked.
   * All executions with the same `jobKey` are aggregated if they occur within
   * the supplied `interval` time frame (in milliseconds).
   *
   * @param jobKey The job key for aggregation purposes.
   * @param interval The time frame to wait for new jobs (ms).
   * @param data The data for this job execution.
   * @param callback The function to execute once the job burst ceases.
   */
  debounce<D>(
    jobKey: string,
    interval: number,
    data: D,
    callback: DebounceCallback<D>,
  ): void {
    const execute = () => {
      const execJob = this._jobs[jobKey];
      delete this._jobs[jobKey];
      console.log(
        `[Debounced] Executing job ${jobKey} with ${execJob.bouncedData.length} bounced data`,
      );
      execJob.callback(execJob.bouncedData);
    };

    let job = this._jobs[jobKey];
    // If there is an existing job, then store the bounced data and reset the timer.
    if (job) {
      console.log(`[Debouncer] Job already exists for ${jobKey}, debounced`);
      job.bouncedData.push(data);
      clearTimeout(job.timer);
      job.timer = setTimeout(execute, interval);
      return;
    }

    job = {
      bouncedData: [data],
      timer: setTimeout(execute, interval),
      callback,
    };
    this._jobs[jobKey] = job;
  }
}

export default Debouncer;
