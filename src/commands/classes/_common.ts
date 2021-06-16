import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';

export type dbClass = {
  name: string,
  description: string
  id: string
};

export const classExists = async (
  ctx: ExecutionContext,
  guildId: string,
  name: string
): Promise<boolean> => {
  const db = await ctx.db.getDb(guildId);

  const classObj = await db.collection('classes').findOne({name: name});

  return classObj != null;
};

export const getRole = async (
  ctx: ExecutionContext,
  guildId: string,
  name: string
): Promise<Discord.Role> => {
  const db = await ctx.db.getDb(guildId);

  const role = await db.collection('classes').findOne({name: name});

  return role;
};

export const createClass = async (
  ctx: ExecutionContext,
  guildId: string,
  classObject: dbClass
) => {
  const db = await ctx.db.getDb(guildId);

  const classObj = await db.collection('classes').insertOne(classObject);
  return classObj;
};