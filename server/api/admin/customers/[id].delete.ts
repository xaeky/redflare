export default defineEventHandler(async (event) => {
  await hasPermission(event, 'delete:customers', true);
  const id = getRouterParam(event, 'id');
  if (!id)
    throw createError({ status: 400, statusText: 'Customer ID is required' });
  const result = await useCustomerModel().deleteOne(id);
  event.context.audit = {
    customer_id: id,
  };
  return result;
});
