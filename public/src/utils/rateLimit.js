
const lastRequestByKey = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const rateLimitedFetch = async (url, { key, minIntervalMs, headers = {} }) => {
  const last = lastRequestByKey.get(key) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < minIntervalMs) {
    await sleep(minIntervalMs - elapsed);
  }

  lastRequestByKey.set(key, Date.now());

  return fetch(url, Object.keys(headers).length ? { headers } : {});
};
