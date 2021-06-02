import util from 'util';

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
  try {
    return await fn();
  } catch (e) {
    if (e.response) {
      if (e.response.status === 429) {
        // We hit a rate-limit, so try again after the specified time (s).
        const delay = (e.response.data || {}).retry_after * 1000 || 1000;
        await wait(delay);
        return performRequest(fn);
      }

      // Log the status code and status text.
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
      throw new Error('HTTP request error');
    }

    if (e.request) {
      throw e.request;
    }

    throw e;
  }
};
