export default defineEventHandler(async (event) => {
  await hasPermission(event, 'create:payment');
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  // TODO
});