import ExecutionContext from '../../ExecutionContext';

export type dbClass = {
  name: string,
  description: string
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

export const createClass = async (
  ctx: ExecutionContext,
  guildId: string,
  classObject: dbClass
) => {
  const db = await ctx.db.getDb(guildId);

  const classObj = await db.collection('classes').insertOne(classObject);
  return classObj;
};