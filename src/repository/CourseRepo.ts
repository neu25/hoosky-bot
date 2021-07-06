import { Collection as MongoCollection, Cursor } from 'mongodb';
import { Collection, Database } from '../database';

export type Course = {
  _id: string;
  subject: string;
  number: number;
  name: string;
  roleId: string;
  members: string[];
  sections: Record<string, Section>;
};

export type Section = {
  number: number;
  members: string[];
};

class CourseRepo {
  private readonly _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  async getById(guildId: string, id: string): Promise<Course | null> {
    return this.collection(guildId).findOne({ _id: id });
  }

  async getByRoleId(guildId: string, roleId: string): Promise<Course | null> {
    return this.collection(guildId).findOne({ roleId });
  }

  async exists(guildId: string, id: string): Promise<boolean> {
    return !!(await this.getById(guildId, id));
  }

  async scan(guildId: string): Promise<Cursor<Course>> {
    return this.collection(guildId).find();
  }

  async list(guildId: string): Promise<Course[]> {
    return (await this.scan(guildId)).toArray();
  }

  async listRoles(guildId: string): Promise<string[]> {
    const courses = await this.list(guildId);
    return courses.map(c => c.roleId);
  }

  async create(guildId: string, course: Course): Promise<void> {
    await this.collection(guildId).insertOne(course);
  }

  async updateById(
    guildId: string,
    id: string,
    course: Partial<Omit<Course, '_id'>>,
  ): Promise<void> {
    await this.collection(guildId).updateOne({ _id: id }, { $set: course });
  }

  async updateByRoleId(
    guildId: string,
    roleId: string,
    course: Partial<Omit<Course, '_id'>>,
  ): Promise<void> {
    await this.collection(guildId).updateOne({ roleId }, { $set: course });
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
        // `$addToSet` does nothing if `userId` is already in `members`.
        $addToSet: {
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
    await this.removeMemberFromAllSections(guildId, userId, roleId);
  }

  async getMembers(
    guildId: string,
    roleId: string,
  ): Promise<string[] | undefined> {
    return (await this.getByRoleId(guildId, roleId))?.members;
  }

  async sectionExists(
    guildId: string,
    roleId: string,
    sectionNum: number,
  ): Promise<boolean> {
    return !!(await this.getSection(guildId, roleId, sectionNum));
  }

  async getSection(
    guildId: string,
    roleId: string,
    sectionNum: number,
  ): Promise<Section | null> {
    const sections = await this.getSections(guildId, roleId);
    if (!sections || !sections[sectionNum]) return null;
    return sections[sectionNum];
  }

  async getSections(
    guildId: string,
    roleId: string,
  ): Promise<Record<string, Section> | null> {
    const course = await this.getByRoleId(guildId, roleId);
    if (!course) return null;
    return course.sections;
  }

  async createSection(
    guildId: string,
    roleId: string,
    section: Section,
  ): Promise<void> {
    await this.updateSection(guildId, roleId, section);
  }

  async updateSection(
    guildId: string,
    roleId: string,
    section: Section,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      { roleId },
      {
        $set: {
          [`sections.${section.number}`]: section,
        },
      },
    );
  }

  async addMemberToSection(
    guildId: string,
    roleId: string,
    sectionNum: number,
    userId: string,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      { roleId },
      {
        // `$addToSet` does nothing if `userId` is already in `members`.
        $addToSet: {
          [`sections.${sectionNum}.members`]: userId,
        },
      },
    );
  }

  async removeMemberFromSection(
    guildId: string,
    roleId: string,
    sectionNum: number,
    userId: string,
  ): Promise<void> {
    await this.collection(guildId).updateOne(
      { roleId },
      {
        $pull: {
          [`sections.${sectionNum}.members`]: userId,
        },
      },
    );
  }

  async removeMemberFromAllSections(
    guildId: string,
    roleId: string,
    userId: string,
  ): Promise<void> {
    const course = await this.getByRoleId(guildId, roleId);
    if (!course) return;

    for (const [sectionNum, section] of Object.entries(course.sections)) {
      // Remove the user from all sections.
      course.sections[sectionNum].members = section.members.filter(
        (id: string) => id !== userId,
      );
    }

    // Remove the `_id` property from `course`.
    const { _id, ...newCourse } = course;
    await this.updateById(guildId, _id, newCourse);
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
