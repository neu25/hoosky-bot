import { Cursor, Collection as MongoCollection } from 'mongodb';
import ExecutionContext from '../../ExecutionContext';
import * as Discord from '../../Discord';
import { Collection } from '../../database';

export type Birthday = {
  _id: number;
  users: string[];
};

/**
 * Calculate the day of year from a date.
 *
 * @param date The date to convert.
 */
export const calculateDayOfYear = (date: string): number => {
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

/**
 * Calculate a day of year to a Date object.
 *
 * @param day THe day of year to convert.
 */
export const calculateDate = (day: number): Date => {
  const startOfCurrentYear = new Date(new Date().getFullYear(), 0); // Initialize a date to Jan. 1 of the current year
  const calculatedDate = new Date(startOfCurrentYear.setDate(day)); // Add the number of days.

  return calculatedDate;
};

export const getTargetUser = async (
  ctx: ExecutionContext,
  requestorId: string | undefined,
  targetUserId: string | undefined,
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
): Promise<boolean> => {
  return (
    (await birthdaysCollection(ctx, guildId).findOne({ _id: day })) !== null
  );
};

export const userHasBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<boolean> => {
  return (
    (await birthdaysCollection(ctx, guildId).findOne({ users: userId })) !==
    null
  );
};

export const setBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  dayOfYear: number,
  userId: string,
): Promise<any> => {
  const day = await dayExists(ctx, guildId, dayOfYear);

  if (day) {
    return await birthdaysCollection(ctx, guildId).updateOne(
      { _id: dayOfYear },
      { $push: { users: userId } },
    );
  } else {
    return await birthdaysCollection(ctx, guildId).insertOne({
      _id: dayOfYear,
      users: [userId],
    });
  }
};

export const getBirthday = async (
  ctx: ExecutionContext,
  guildId: string,
  userId: string,
): Promise<Birthday | null> => {
  return await birthdaysCollection(ctx, guildId).findOne({ users: userId });
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
  return await birthdaysCollection(ctx, guildId).updateOne(
    { users: userId },
    { $pull: { users: userId } },
  );
};

export const getTodaysBirthdays = async (
  ctx: ExecutionContext,
  guildId: string,
  day: number,
): Promise<Cursor<Birthday>> => {
  return await birthdaysCollection(ctx, guildId).find({ _id: day });
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
