import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';
import { Section } from './SectionRepo';
import SectionRepo from './SectionRepo';

export type Course = {
  _id: string;
  subject: string;
  number: number;
  name: string;
  roleId: string;
  members: string[];
  sections: Section[];
};

class CourseRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async exists(guildId: string, id: string): Promise<boolean> {
    return !!(await this.getById(guildId, id));
  }

  async getById(guildId: string, id: string): Promise<Course | null> {
    return this.collection(guildId).findOne({ _id: id });
  }

  async getByRoleId(guildId: string, roleId: string): Promise<Course | null> {
    return this.collection(guildId).findOne({ roleId });
  }

  async listRoles(guildId: string): Promise<string[]> {
    const courses = await this.list(guildId);
    return courses.map(c => c.roleId);
  }

  async scan(guildId: string): Promise<Cursor<Course>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<Course[]> {
    return (await this.scan(guildId)).toArray();
  }

  async create(guildId: string, courseInfo: Course): Promise<void> {
    await this.collection(guildId).insertOne(courseInfo);
  }

  async deleteByRoleId(guildId: string, roleId: string): Promise<void> {
    await this.collection(guildId).deleteOne({ roleId });
  }

  async addMember(
    guildId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      {
        roleId: roleId,
      },
      {
        $push: {
          members: userId,
        },
      },
    );
  }

  async removeMember(
    guildId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      {
        roleId: roleId,
      },
      {
        $pull: {
          members: userId,
        },
      },
    );
    await new SectionRepo(this._db).removeMember(guildId, userId, roleId);
  }

  async getMembers(
    guildId: string,
    roleId: string,
  ): Promise<string[] | undefined> {
    return (await this.getByRoleId(guildId, roleId))?.members;
  }

  /**
   * Returns the `courses` collection for the specified guild.
   *
   * @param guildId The ID of the guild.
   */
  collection(guildId: string): MongoCollection<Course> {
    return this._db.getDb(guildId).collection(Collection.COURSES);
  }
}

export default CourseRepo;
