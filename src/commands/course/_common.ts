import { Cursor, Collection as MongoCollection } from 'mongodb';
import { Collection } from '../../database';
import ExecutionContext from '../../ExecutionContext';
import { bold } from '../../format';

export type Course = {
  _id: string;
  subject: string;
  number: number;
  name: string;
  roleId: string;
  members: string[];
  sections: Section[];
};

export type Section = {
  number: number;
  members: string[];
};

/**
 * Returns a formatted version of the course name.
 *
 * @param course The course to format.
 */
export const formatCourse = (course: Course): string => {
  return `${course._id} - ${course.name}`;
};

/**
 * Returns a partially-bolded version of the full course string. Only the course
 * subject and number are bolded, not the name.
 *
 * @param course The course to format and partially bold.
 */
export const semiBoldCourse = (course: Course): string => {
  return bold(course._id) + ` - ${course.name}`;
};

/**
 * Returns a bolded version of the full course string.
 *
 * @param course The course to format and bold.
 */
export const boldCourse = (course: Course): string => {
  return bold(formatCourse(course));
};

export const courseExists = async (
  ctx: ExecutionContext,
  guildId: string,
  id: string,
): Promise<boolean> => {
  return !!(await getCourseById(ctx, guildId, id));
};

export const getCourseById = async (
  ctx: ExecutionContext,
  guildId: string,
  id: string,
): Promise<Course | null> => {
  return coursesCollection(ctx, guildId).findOne({ _id: id });
};

export const getCourseByRoleId = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
): Promise<Course | null> => {
  return coursesCollection(ctx, guildId).findOne({ roleId });
};

export const scanCourses = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<Cursor<Course>> => {
  return coursesCollection(ctx, guildId).find();
};

export const createCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  courseInfo: Course,
): Promise<void> => {
  await coursesCollection(ctx, guildId).insertOne(courseInfo);
};

export const deleteCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  courseInfo: Course,
): Promise<void> => {
  await coursesCollection(ctx, guildId).deleteOne({
    roleId: courseInfo.roleId,
  });
};

export const addUserToCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<void> => {
  await coursesCollection(ctx, guildId).updateOne(
    {
      roleId: roleId,
    },
    {
      $push: {
        members: userId,
      },
    },
  );
};

export const removeUserFromCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<void> => {
  await coursesCollection(ctx, guildId).updateOne(
    {
      roleId: roleId,
    },
    {
      $pull: {
        members: userId,
      },
    },
  );
  await coursesCollection(ctx, guildId).updateOne(
    {
      roleId: roleId,
      'sections.members': userId,
    },
    {
      $pull: {
        'sections.$.members': userId,
      },
    },
  );
};

export const createSection = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
  sectionNum: number,
  members: string[] = [],
): Promise<void> => {
  await coursesCollection(ctx, guildId).updateOne(
    {
      roleId: roleId,
    },
    {
      $push: {
        sections: {
          number: sectionNum,
          members: members,
        },
      },
    },
  );
};

export const addUserToSection = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
  roleId: string,
  sectionNum: number,
): Promise<void> => {
  await coursesCollection(ctx, guildId).updateOne(
    {
      roleId: roleId,
      'sections.number': sectionNum,
    },
    {
      $push: {
        'sections.$.members': userId,
      },
    },
  );
};

export const getCourseMembers = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
): Promise<string[] | undefined> => {
  return (await getCourseByRoleId(ctx, guildId, roleId))?.members;
};

export const getSectionMembers = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
  sectionNum: number,
): Promise<string[] | undefined> => {
  return (await getCourseByRoleId(ctx, guildId, roleId))?.sections.find(
    item => item.number === sectionNum,
  )?.members;
};

/**
 * Returns the `courses` collection for the specified guild.
 *
 * @param ctx The relevant execution context.
 * @param guildId The ID of the guild.
 */
const coursesCollection = (
  ctx: ExecutionContext,
  guildId: string,
): MongoCollection<Course> => {
  return ctx.db.getDb(guildId).collection(Collection.COURSES);
};
