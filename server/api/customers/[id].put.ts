export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to write customers.
  await hasPermission(event, 'write:customers', true);
  // Get customer ID
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ status: 400, statusText: 'Customer ID is required' });
  // Get validated body from request
  const trustedBody = await readValidatedBody(event, customerOptionsSchema.safeParse);
  if (trustedBody.error) throw createError({ status: 400, statusText: 'Invalid body', data: trustedBody.error });
  const body = trustedBody.data as CustomerUpdateOptions;
  // Update customer
  const result = await useCustomerModel().updateOne(id, body);
  return result;
});
