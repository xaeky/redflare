import type { H3Event } from 'h3';

export const isAPICall = (event: H3Event) => event.path.startsWith('/api/');
export const isTestEnv =
  process.env.PLAYWRIGHT_TEST === '1' &&
  process.env.PLAYWRIGHT_TEST_IGNORE !== '1';
export const isDevEnv = process.env.NODE_ENV === 'development';
export const bypassAuthForDev = (event: H3Event) =>
  isDevEnv && getHeader(event, 'X-RF-Bypass') === '1';
