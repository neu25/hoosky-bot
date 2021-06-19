import { Cursor, Collection as MongoCollection } from 'mongodb';
import { Collection } from '../../database';
import ExecutionContext from '../../ExecutionContext';

export type Course = {
  _id: string;
  name: string;
  description: string;
  roleId: string;
  members: string[];
};

export const courseExists = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
): Promise<boolean> => {
  return (await getCourse(ctx, guildId, roleId)) !== null;
};

export const getCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
): Promise<Course | null> => {
  return coursesCollection(ctx, guildId).findOne({ roleId: roleId });
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
