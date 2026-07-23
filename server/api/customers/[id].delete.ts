export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to delete customers.
  await hasPermission(event, 'delete:customers', true);
  // Get customer ID
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ status: 400, statusText: 'Customer ID is required' });
  // Delete it
  const result = await useCustomerModel().deleteOne(id);
  return result;
});