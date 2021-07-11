import { User } from '../../Discord';
import ExecutionContext from '../../ExecutionContext';

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
 * Calculate a Date object from the day of year.
 *
 * @param day The day of year to convert.
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
): Promise<User | undefined> => {
  if (targetUserId) {
    return await ctx.api.getUser(targetUserId);
  } else if (requestorId) {
    return await ctx.api.getUser(requestorId);
  }
};
