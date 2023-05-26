import sleep from './sleep';

/* eslint-disable no-await-in-loop */
export async function isResourceAvailable(
  url: string,
  signal?: AbortSignal | null | undefined
) {
  const response = await fetch(url, {
    method: 'HEAD',
    ...(signal
      ? {
          signal,
        }
      : {}),
  }).catch((err) => null);

  if (!response) return false;

  return (response?.status || 500) < 400; // 200-399 http status range
}

async function waitResourceIsAvailable(
  url: string,
  {
    maxAttempts = 30, // how many attempts
    retryTimeMs = 1000, // how long to wait between retries
  } = {},
  signal: AbortSignal | null | undefined = undefined
): Promise<boolean> {
  let attempt = 1;
  let isAvailable = false;

  while (!isAvailable && attempt <= maxAttempts) {
    try {
      // console.log(`Making request #${attempt} to ${url}`);
      isAvailable = await isResourceAvailable(url, signal);
      if (!isAvailable && attempt < maxAttempts) await sleep(retryTimeMs);
      attempt++;
    } catch (err) {
      console.error(err);
      attempt = maxAttempts + 1;
      return false;
    }
  }

  return isAvailable;
}

export default waitResourceIsAvailable;
