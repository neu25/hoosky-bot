import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';

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

  const course = await db.collection('classes').findOne({ name: name });

  return course != null;
};

export const getRole = async (
  ctx: ExecutionContext,
  guildId: string,
  name: string,
): Promise<Discord.Role> => {
  const db = await ctx.db.getDb(guildId);

  const role = await db.collection('classes').findOne({ name: name });

  return role;
};

export const createCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  courseInfo: courseObject,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db.collection('classes').insertOne(courseInfo);
  return course;
};

export const addUserToCourse = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
  courseName: string,
) => {
  const db = await ctx.db.getDb(guildId);

  await db.collection('classes').updateOne(
    {
      name: courseName,
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
  courseName: string,
): Promise<string[]> => {
  const db = await ctx.db.getDb(guildId);

  const course = await db
    .collection('classes')
    .findOne({ name: courseName });

  return course.members;
};

export const getCourses = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const courses = await db.collection('classes').find();

  return courses;
};
