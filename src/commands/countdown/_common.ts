import dayjs from 'dayjs';
import ExecutionContext from '../../ExecutionContext';
import { bold, inlineCode } from '../../format';

export const validateDate = (date: string): boolean => {
  return /^\d{1,2}[/-]\d{1,2}[/-]\d{2}$/.test(date);
};

export const respondWithInvalidDate = (
  ctx: ExecutionContext,
): Promise<void> => {
  return ctx.interactionApi.respondWithError(
    bold('Invalid date.') +
      ' Make sure it is in the form ' +
      bold('MM/DD/YY') +
      '.',
  );
};

export const respondWithNotFound = (
  ctx: ExecutionContext,
  date: dayjs.Dayjs,
  eventName: string,
): Promise<void> => {
  const prettyDate = date.format('MMMM D, YYYY');
  return ctx.interactionApi.respondWithError(
    `Could not find event with name ${bold(eventName)} on ${bold(
      prettyDate,
    )}. Make sure the event name is exactly as shown in ${inlineCode(
      '/countdown list',
    )}.`,
  );
};
