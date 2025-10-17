import _ from 'lodash';

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig(event);
  const isAPICall = event.path.startsWith('/api/');
  const restrictedEndpoints = ['/api/commissions', '/api/customers', '/api/service', '/api/stats'];
  const isRestrictedRouted = restrictedEndpoints.some(route => event.path.startsWith(route));
  const authenticatedData = await getUserSession(event);
  const isService = getHeader(event, 'X-RF-Service') === runtime.backoffice.service;
  const isAuthenticated = isService || !!_.get(authenticatedData, 'user') || !!_.get(authenticatedData, 'secure.access_token');
  if (isAPICall && isRestrictedRouted && !isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  };
})