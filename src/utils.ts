import util from 'util';

export type Primitive = string | boolean | number | undefined | null;

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
