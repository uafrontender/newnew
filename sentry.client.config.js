// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { CaptureConsole } from '@sentry/integrations';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://88013d79fd0f45f0b219c26f458fa84b@o1263657.ingest.sentry.io/6453893',
  // Adjust this value in production, or use tracesSampler for greater control
  integrations: [
    new CaptureConsole({
      levels: ['error'],
    }),
  ],
  tracesSampleRate: 1.0,
  environment: 'prod',
  maxBreadcrumbs: 50,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
