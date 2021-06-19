import { Cursor, Collection as MongoCollection } from 'mongodb';
import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { Collection } from '../../database';

export type Birthday = {
  userId: string;
  day: number;
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

export const calculateDate = async (day: number): Promise<string> => {
  return ''; // TEMPORARY

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

export const dayExists = async (
  ctx: ExecutionContext,
  guildId: string,
  day: number,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  return await db.collection(Collection.BIRTHDAYS).findOne({ day });
};

export const userHasBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<boolean> => {
  const db = await ctx.db.getDb(guildId);

  return (
    (await db.collection(Collection.BIRTHDAYS).findOne({ userId })) !== null
  );
};

export const setBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  birthdayInfo: Birthday,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  const day = await dayExists(ctx, guildId, birthdayInfo.day);

  if (day) {
    return await db
      .collection(Collection.BIRTHDAYS)
      .insertOne({ _id: day._id, members: birthdayInfo.userId });
  } else {
    return await db
      .collection(Collection.BIRTHDAYS)
      .updateOne({ _id: day._id }, { $push: { members: birthdayInfo.userId } });
  }
};

export const getBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  return await db.collection(Collection.BIRTHDAYS).findOne({ userId });
};

export const scanBirthdays = async (
  ctx: ExecutionContext,
  guildId: string,
): Promise<Cursor<Birthday>> => {
  return birthdaysCollection(ctx, guildId).find();
};

export const unsetBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<any> => {
  const db = await ctx.db.getDb(guildId);

  return await db.collection(Collection.BIRTHDAYS).deleteOne({ userId });
};

/**
 * Returns the `birthdays` collection for the specified guild.
 *
 * @param ctx The relevant execution context.
 * @param guildId The ID of the guild.
 */
const birthdaysCollection = (
  ctx: ExecutionContext,
  guildId: string,
): MongoCollection<Birthday> => {
  return ctx.db.getDb(guildId).collection(Collection.BIRTHDAYS);
};
