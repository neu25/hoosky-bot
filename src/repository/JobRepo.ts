import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';
import { JobType } from '../jobHandlers';

export type SerializedJob = {
  _id: string;
  type: JobType;
  targetDate: Date;
  data: any;
};

class JobRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getById(guildId: string, jobId: string): Promise<SerializedJob | null> {
    return this.collection(guildId).findOne({ _id: jobId });
  }

  async scan(guildId: string): Promise<Cursor<SerializedJob>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<SerializedJob[]> {
    return (await this.scan(guildId)).toArray();
  }

  /**
   * You usually don't want to call this directly. To make sure the job is pushed
   * onto the currently-running scheduler, create the job through MasterScheduler.
   *
   * @param guildId The ID of the guild.
   * @param job The scheduled job.
   */
  async create(guildId: string, job: SerializedJob): Promise<void> {
    await this.collection(guildId).insertOne(job);
  }

  async delete(guildId: string, jobId: string): Promise<void> {
    await this.collection(guildId).deleteOne({ _id: jobId });
  }

  /**
   * Returns the `jobs` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<SerializedJob> {
    return this._db.getDb(guildId).collection(Collection.JOBS);
  }
}

export default JobRepo;
