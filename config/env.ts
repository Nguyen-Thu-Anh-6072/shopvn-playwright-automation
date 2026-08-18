/**
 * Environment configuration. Values can be overridden with environment
 * variables so the same suite can run against another deployment.
 */
const DEFAULT_HOST = 'https://testing.platformforge.dev';

export const env = {
  baseURL: process.env.BASE_URL ?? DEFAULT_HOST,
  apiPrefix: '/api',
} as const;
