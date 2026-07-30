import * as Sentry from '@sentry/react';
import * as SentryCapacitor from '@sentry/capacitor';
import { Capacitor } from '@capacitor/core';

export const initSentry = () => {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not found. Error monitoring is disabled.');
    return;
  }

  const commonOptions = {
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  };

  if (Capacitor.isNativePlatform()) {
    SentryCapacitor.init({
      ...commonOptions,
    });
  } else {
    Sentry.init({
      ...commonOptions,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
  }
};
