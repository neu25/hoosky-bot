/**
 * Returns a Promise that resolves after the given time.
 *
 * @param time The time to wait, in milliseconds.
 */
export const wait = (time: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, time));

/**
 * Performs a request with automatic retrying of rate-limited requests.
 *
 * @param fn A function calling the request.
 */
export const performRequest = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (e.response) {
      if (e.response.status === 429) {
        const delay = (e.response.data || {}).retry_after * 1000 || 1000;
        await wait(delay);
        return performRequest(fn);
      } else {
        throw e.response;
      }
    } else if (e.request) {
      throw e.request;
    } else {
      throw e;
    }
  }
};
