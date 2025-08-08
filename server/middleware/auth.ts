import _ from 'lodash';

export default defineEventHandler(async (event) => {
  const isAPICall = event.path.startsWith('/api/');
  const restrictedEndpoints = ['/api/commissions', '/api/customers'];
  const isRestrictedRouted = restrictedEndpoints.some(route => event.path.startsWith(route));
  const authenticatedData = await getUserSession(event);
  const isAuthenticated = !!_.get(authenticatedData, 'user') || !!_.get(authenticatedData, 'secure.access_token');
  if (isAPICall && isRestrictedRouted && !isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  };
})