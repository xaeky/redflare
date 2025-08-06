export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to write customers.
  await hasPermission(event, 'write:customers', true);
  // Get validated body from request
  const trustedBody = await readValidatedBody(event, customerOptionsSchema.safeParse);
  if (trustedBody.error) throw createError({ statusCode: 400 });
  const body = trustedBody.data as CustomerInsertOptions;
  // Write one customer.
  const result = await useCustomerModel().insertOne(body);
  return result;
});
