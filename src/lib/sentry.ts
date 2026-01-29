import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';

export function initSentry() {
  // Only initialize Sentry if DSN is provided
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0,

    // Distributed tracing - disabled to avoid CORS issues
    // Remove targets to prevent Sentry from adding headers to API requests
    tracePropagationTargets: [],

    // Session Replay
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,

    // Filtering
    beforeSend(event, hint) {
      // Filter out network errors that are already handled by the UI
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip common network errors that don't need tracking
        if (error.message.includes('NetworkError') ||
            error.message.includes('Failed to fetch')) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      // Random plugins/extensions
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
    ],
  });
}

export { Sentry };