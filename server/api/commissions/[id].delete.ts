export default defineEventHandler(async (event) => {
  // Verify if they have permission to perform action
  await hasPermission(event, 'delete:commissions');
  // Get commission ID
  const commissionId = getRouterParam(event, 'id');
  if (!commissionId) throw createError({ statusCode: 400, message: 'Commission ID is required' });
  
  const result = await useCommissionModel().deleteOne(commissionId);
  return result;
});