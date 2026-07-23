export default defineEventHandler(async (event) => {
  await hasPermission(event, 'read:commissions');
  const { id: commissionId } = await validateCommission(event);
  const billingModel = useBillingModel();

  const result = await billingModel.getByCommission(commissionId);
  if (!result) throw createError({ status: 500, statusText: 'Failed to fetch transactions' });

  return result;
});