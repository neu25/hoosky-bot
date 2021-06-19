import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { Collection } from '../../database';

export type dbClass = {
  userId: string;
  birthday: string;
};

export const getTargetUser = async (
  ctx: ExecutionContext,
  requestorId: string | undefined,
  targetUserId: string,
): Promise<Discord.User | undefined> => {
  if (targetUserId) {
    return await ctx.api.getUser(targetUserId);
  } else if (requestorId) {
    return await ctx.api.getUser(requestorId);
  }
};

export const userHasBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<boolean> => {
  const db = await ctx.db.getDb(guildId);

  const birthdayObj = await db
    .collection(Collection.BIRTHDAYS)
    .findOne({ userId });

  return birthdayObj != null;
};

export const setBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  birthdayObject: dbClass,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const birthdayObj = await db
    .collection(Collection.BIRTHDAYS)
    .insertOne(birthdayObject);
  return birthdayObj;
};

export const unsetBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  return false; // TEMPORARY

  // TODO: delete birthday from db

  // const birthdayObj = await db.collection(Collection.BIRTHDAYS).remove();
  // return birthdayObj;
};
