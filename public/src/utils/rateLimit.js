/**
 * Fetch z rate limitingiem – minimalny odstęp między requestami o tym samym key (ms).
 */

const lastRequestByKey = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wykonuje fetch z opcjonalnym opóźnieniem, aby zachować minIntervalMs między requestami o tym samym key.
 * @param {string} url - URL do pobrania.
 * @param {{ key: string; minIntervalMs: number; headers?: object }} opts
 * @returns {Promise<Response>}
 */
export const rateLimitedFetch = async (url, { key, minIntervalMs, headers = {} }) => {
  const last = lastRequestByKey.get(key) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < minIntervalMs) {
    await sleep(minIntervalMs - elapsed);
  }

  lastRequestByKey.set(key, Date.now());

  return fetch(url, Object.keys(headers).length ? { headers } : {});
};
