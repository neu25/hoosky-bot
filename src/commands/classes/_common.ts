import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';

export type dbClass = {
  name: string;
  description: string;
  id: string;
  members: string[];
};

export const classExists = async (
  ctx: ExecutionContext,
  guildId: string,
  name: string,
): Promise<boolean> => {
  const db = await ctx.db.getDb(guildId);

  const classObj = await db.collection('classes').findOne({ name: name });

  return classObj != null;
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

export const createClass = async (
  ctx: ExecutionContext,
  guildId: string,
  classObject: dbClass,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const classObj = await db.collection('classes').insertOne(classObject);
  return classObj;
};

export const addUserToClass = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
  className: string,
) => {
  const db = await ctx.db.getDb(guildId);

  await db.collection('classes').update(
    {
      name: className,
    },
    {
      $push: {
        members: userId,
      },
    },
  );
};

export const getClassMembers = async (
  ctx: ExecutionContext,
  guildId: string,
  className: string,
): Promise<string[]> => {
  const db = await ctx.db.getDb(guildId);

  const classObject = await db
    .collection('classes')
    .findOne({ name: className });

  return classObject.members;
};

export const getClasses = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const classes = await db.collection('classes').find();

  return classes;
};
