import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { Collection } from '../../database';

export type courseObject = {
  name: string;
  description: string;
  id: string;
  members: string[];
};

export const courseExists = async (
  ctx: ExecutionContext,
  guildId: string,
  name: string,
): Promise<boolean> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db.collection(Collection.COURSES).findOne({ name: name });

  return course != null;
};

export const getRole = async (
  ctx: ExecutionContext,
  guildId: string,
  name: string,
): Promise<Discord.Role> => {
  const db = await ctx.db.getDb(guildId);

  const role = await db.collection(Collection.COURSES).findOne({ name: name });

  return role;
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

export const addUserToCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
  name: string,
) => {
  const db = await ctx.db.getDb(guildId);

  await db.collection(Collection.COURSES).updateOne(
    {
      name: name,
    },
    {
      $push: {
        members: userId,
      },
    },
  );
};

export const getCourseMembers = async (
  ctx: ExecutionContext,
  guildId: string,
  name: string,
): Promise<string[]> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db
    .collection(Collection.COURSES)
    .findOne({ name: name });

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
