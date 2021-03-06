import util from 'util';
import dayjs from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
import { customAlphabet } from 'nanoid';

import * as Discord from './Discord';
import { pluralize } from './format';

dayjs.extend(duration);

export const emojiRegexAbomination =
  /<a:.+?:\d+>|\p{Extended_Pictographic}|<:.+?:\d+>/gu;

export type Primitive = string | boolean | number | undefined | null;

export const generateId = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  8,
);

/**
 * Returns a Promise that resolves after the given time.
 *
 * @param time The time to wait, in milliseconds.
 */
export const wait = (time: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, time));

/**
 * Performs a request with automatic retrying of rate-limited requests. Handles
 * any HTTP errors that occur by providing useful error logging.
 *
 * @param fn A function calling the request.
 */
export const performRequest = async <T>(fn: () => Promise<T>): Promise<T> => {
  const stack = new Error('Thrown at:');

  try {
    return await fn();
  } catch (e) {
    if (e.response) {
      if (e.response.status === 429) {
        // We hit a rate-limit, so try again after the specified time (s).
        const delay = (e.response.data || {}).retry_after * 1000 || 1000;
        await wait(delay);
        return performRequest(fn); // Recursively try again.
      }

      // Unexpected response code: log the status code and status text.
      console.error(
        'HTTP request error:',
        e.response.status,
        e.response.statusText,
      );
      if (e.response.data) {
        // Log the entire response object.
        console.error('Response:');
        console.error(util.inspect(e.response.data, false, null, true));
      }
    }

    throw stack;
  }
};

export const formatEmoji = (emoji: Discord.Emoji): string => {
  if (emoji.id === null) {
    return emoji.name;
  }
  return `<:${emoji.name}:${emoji.id}>`;
};

export const parseEmoji = (emojiString: string): Discord.Emoji => {
  if (emojiString.length === 1) {
    return {
      name: emojiString,
      id: null,
    };
  }

  const parts = emojiString.replaceAll('<:', '').replaceAll('>', '').split(':');
  if (parts.length !== 2) {
    throw new Error(`Unable to parse emoji: '${emojiString}'`);
  }

  return {
    name: parts[0],
    id: parts[1],
  };
};

export const extractEmojis = (text: string): string[] | null => {
  return text.match(emojiRegexAbomination);
};

/**
 * Helper method to prepare the emoji for requests
 *
 * @param emojiString The emoji string
 */
export const prepareEmoji = (emojiString: string): string => {
  // checks if the emoji is custom and if it is, it will trim it
  // example:
  //  - from: <:test2:850478323712131073>
  //  - to: test2:850478323712131073
  return encodeURIComponent(
    emojiString.split('<:').join('').split('>').join(''),
  );
};

/**
 * Helper method to format a number to have leading zeros
 *
 * @param number The number
 * @param size The length of the final string
 */
export const padNumber = (number: number, size: number): string => {
  let num: string = number.toString();
  while (num.length < size) {
    num = '0' + num;
  }
  return num;
};

export const eliminateDuplicates = <T extends Primitive>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const dateToUnixTime = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

export const formatMsLong = (ms: number): string => {
  return formatDurationLong(dayjs.duration(ms));
};

export const formatMsCompact = (ms: number): string => {
  return formatDurationCompact(dayjs.duration(ms));
};

export const formatDurationLong = (duration: Duration): string => {
  const s = duration.seconds();
  const m = duration.minutes();
  const h = duration.hours();
  const d = Math.floor(duration.asDays());

  const strParts: string[] = [];
  if (d > 0) strParts.push(d + ' ' + pluralize('day', d));
  if (h > 0) strParts.push(h + ' ' + pluralize('hour', h));
  if (m > 0) strParts.push(m + ' ' + pluralize('minute', m));
  if (s > 0) strParts.push(s + ' ' + pluralize('second', s));

  return strParts.join(' ');
};

export const formatDurationCompact = (duration: Duration): string => {
  const s = duration.seconds();
  const m = duration.minutes();
  const h = duration.hours();
  const d = Math.floor(duration.asDays());

  const strParts: string[] = [];
  if (d > 0) strParts.push(d + 'd');
  if (h > 0) strParts.push(h + 'h');
  if (m > 0) strParts.push(m + 'm');
  if (s > 0) strParts.push(s + 's');

  return strParts.join(' ');
};
