// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { CaptureConsole } from '@sentry/integrations';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const NEXT_PUBLIC_ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Adjust this value in production, or use tracesSampler for greater control
    integrations: [
      new CaptureConsole({
        levels: ['error'],
      }),
    ],
    tracesSampleRate: 1.0,
    environment: NEXT_PUBLIC_ENVIRONMENT,
    maxBreadcrumbs: 50,
    // Partially matches the messages
    ignoreErrors: ['Abort', 'abort'],
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
  });
}
