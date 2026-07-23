export default defineEventHandler(async (event) => {
  const isAPITestCall = event.path.startsWith('/api/test');
  if (isAPITestCall && !isTestEnv) {
    logger.warn(`Blocked test-only API call to ${event.path} in non-test environment`);
    throw createError({ status: 404, statusText: 'Not Found' });
  }
});