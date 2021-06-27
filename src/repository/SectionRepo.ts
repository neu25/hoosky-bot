import { Collection as MongoCollection } from 'mongodb';
import { Collection, Database } from '../database';
import CourseRepo, { Course } from './CourseRepo';

export type Section = {
  number: number;
  members: string[];
};

class SectionRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async create(
    guildId: string,
    roleId: string,
    sectionInfo: Section,
  ): Promise<void> {
    this.collection(guildId).updateOne(
      {
        roleId,
      },
      {
        $push: {
          sections: sectionInfo,
        },
      },
    );
  }

  async addMember(
    guildId: string,
    userId: string,
    roleId: string,
    sectionNum: number,
  ): Promise<void> {
    this.collection(guildId).updateOne(
      {
        roleId,
        'sections.number': sectionNum,
      },
      {
        $push: {
          'sections.$.members': userId,
        },
      },
    );
  }

  async removeMember(
    guildId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    this.collection(guildId).updateOne(
      {
        roleId,
        'sections.members': userId,
      },
      {
        $pull: {
          'sections.$.members': userId,
        },
      },
    );
  }

  async getMembers(
    guildId: string,
    roleId: string,
    sectionNum: number,
  ): Promise<string[] | undefined> {
    return (
      await new CourseRepo(this._db).getByRoleId(guildId, roleId)
    )?.sections.find(item => item.number === sectionNum)?.members;
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

export default SectionRepo;
