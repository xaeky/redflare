export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read commissions.
  await hasPermission(event, 'read:commissions', true);
  // Commission ID from request parameters
  const commissionId = getRouterParam(event, 'id');
  // Ensure commission ID is provided
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  const result = await useCommissionModel().getOneById(commissionId);
  if (!result) throw createError({ statusCode: 404, message: 'Commission not found' });
  return result;
});