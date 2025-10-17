export default defineEventHandler(async (event) => {
  await hasPermission(event, 'read:commissions');
  const commissionId = await validateCommission(event);
  const billingModel = useBillingModel();

  const result = await billingModel.getByCommission(commissionId);
  if (!result) throw createError({ statusCode: 500, message: 'Failed to fetch transactions' });

  return result;
});