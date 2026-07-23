import _ from 'lodash';

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event);
  const isAPICall = event.path.startsWith('/api/');
  if (!isAPICall) return;
  // All endpoints are treated as restricted except for public ones
  const publicEndpoints = ['/api/auth', '/api/_auth', '/api/_nuxt_icon', '/api/public'];
  if (isTestEnv) publicEndpoints.push('/api/test');
  const isRestrictedRouted = !publicEndpoints.some(route => event.path.startsWith(route));
  if (!isRestrictedRouted) return;
  // For restricted endpoints, check if user is authenticated or if service token is valid
  // TODO: Enhance service token validation
  const isService = getHeader(event, 'X-RF-Service') === runtime.backoffice.service;
  const authenticatedData = isService ? false : await needAuth(event);
  const isAuthenticated = isService || !!_.get(authenticatedData, 'user') || !!_.get(authenticatedData, 'secure.access_token');
  if (!isAuthenticated) {
    logger.warn('Unauthorized access attempt to', event.path);
    throw createError({ status: 401, statusText: 'Unauthorized' });
  };
})