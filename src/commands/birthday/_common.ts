import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { Collection } from '../../database';

export type dbClass = {
  userId: string;
  birthday: number;
};

export const calculateDayOfYear = async (date: string): Promise<number> => {
  const now = new Date(date);
  const start = new Date(now.getFullYear(), 0, 0);
  const diff =
    now.getTime() -
    start.getTime() +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return dayOfYear;
};

export const calculateDate = async (day: number): Promise<number> => {
  // TODO: calculate date from day of the year
  // const oneDay = 1000 * 60 * 60 * 24;
  // const date = ;
  // return date;
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

export const getBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const birthdayObj = await db
    .collection(Collection.BIRTHDAYS)
    .findOne({ userId });
  return birthdayObj;
};

export const unsetBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const birthdayObj = await db
    .collection(Collection.BIRTHDAYS)
    .deleteOne({ userId });
  return birthdayObj;
};
