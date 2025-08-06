export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to delete customers.
  await hasPermission(event, 'delete:customers', true);
  // Get customer ID
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400 });
  // Delete it
  const result = useCustomerModel().deleteOne(id);
  return result;
});