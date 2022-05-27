/* eslint-disable no-plusplus */
import sleep from "./sleep";

/* eslint-disable no-await-in-loop */
export async function isResourceAvailable(url: string) {
  const response = await fetch(url, {
    method: 'HEAD'
  }).catch((err) => null);

  console.log(response)

  return (response?.status || 500) < 400; // 200-399 http status range
}

async function waitResourceIsAvailable(url: string, {
  maxAttempts = 30, // how many attempts
  retryTimeMs = 1000, // how long to wait between retries
} = {}): Promise<boolean> {
  let attempt = 1;
  let isAvailable = false;

  while (!isAvailable && (attempt <= maxAttempts)) {
    // console.log(`Making request #${attempt} to ${url}`);
    isAvailable = await isResourceAvailable(url);
    if (!isAvailable && (attempt < maxAttempts)) await sleep(retryTimeMs);
    attempt++;
  }

  return isAvailable;
}

export default waitResourceIsAvailable;
