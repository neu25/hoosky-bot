import { Cursor, Collection as MongoCollection } from 'mongodb';
import { Collection } from '../../database';
import ExecutionContext from '../../ExecutionContext';
import { bold } from '../../format';

export type Course = {
  _id: number;
  subject: string;
  name: string;
  roleId: string;
  members: string[];
};

/**
 * Returns a formatted version of the course name.
 *
 * @param course The course to format.
 */
export const formatCourse = (course: Course): string => {
  return `${course.subject} ${course._id} - ${course.name}`;
};

/**
 * Returns a partially-bolded version of the full course string. Only the course
 * subject and number are bolded, not the name.
 *
 * @param course The course to format and partially bold.
 */
export const semiBoldCourse = (course: Course): string => {
  return bold(`${course.subject} ${course._id}`) + ` - ${course.name}`;
};

/**
 * Returns a bolded version of the full course string.
 *
 * @param course The course to format and bold.
 */
export const boldCourse = (course: Course): string => {
  return bold(formatCourse(course));
};

export const courseNumberExists = async (
  ctx: ExecutionContext,
  guildId: string,
  number: number,
): Promise<boolean> => {
  return (
    (await coursesCollection(ctx, guildId).findOne({ _id: number })) !== null
  );
};

export const getCourse = async (
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
  const db = await ctx.db.getDb(guildId);

  await db
    .collection(Collection.COURSES)
    .deleteOne({ roleId: courseInfo.roleId });
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
};

export const getCourseMembers = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
): Promise<string[] | undefined> => {
  return (await getCourse(ctx, guildId, roleId))?.members;
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
