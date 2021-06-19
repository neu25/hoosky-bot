import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { Collection } from '../../database';

export type courseObject = {
  name: string;
  crn: string;
  description: string;
  roleId: string;
  members: string[];
};

export const courseExists = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
): Promise<boolean> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db.collection(Collection.COURSES).findOne({ roleId: roleId });

  return course != null;
};

export const getCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  roleId: string,
): Promise<courseObject> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db.collection(Collection.COURSES).findOne({ roleId: roleId });

  return course;
};

export const createCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  courseInfo: courseObject,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db.collection(Collection.COURSES).insertOne(courseInfo);
  return course;
};

export const deleteCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  courseInfo: courseObject,
): Promise<void> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db.collection(Collection.COURSES).deleteOne({roleId: courseInfo.roleId});
  return;
};

export const addUserToCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
  roleId: string,
) => {
  const db = await ctx.db.getDb(guildId);

  await db.collection(Collection.COURSES).updateOne(
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
) => {
  const db = await ctx.db.getDb(guildId);

  await db.collection(Collection.COURSES).updateOne(
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
): Promise<string[]> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db
    .collection(Collection.COURSES)
    .findOne({ roleId: roleId });

  return course.members;
};

export const getCourses = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const courses = await db.collection(Collection.COURSES).find();

  return courses;
};
