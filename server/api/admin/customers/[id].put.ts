export default defineEventHandler(async (event) => {
  await hasPermission(event, 'write:customers', true);
  const id = getRouterParam(event, 'id');
  if (!id)
    throw createError({ status: 400, statusText: 'Customer ID is required' });
  const trustedBody = await readValidatedBody(
    event,
    customerOptionsSchema.safeParse,
  );
  if (trustedBody.error)
    throw createError({
      status: 400,
      statusText: 'Invalid body',
      data: trustedBody.error,
    });
  const body = trustedBody.data as CustomerUpdateOptions;
  const result = await useCustomerModel().updateOne(id, body);
  event.context.audit = {
    customer_id: id,
  };
  return result;
});
