import z from 'zod';

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    transactionId: z.string(),
  }).safeParse);
  if (!body.success) throw createError({ status: 400, statusText: 'Invalid body' });
  const { id: commissionId } = await validateCommission(event);
  const commissionModel = useCommissionModel();

  const updateResult = await commissionModel.addTransactionToOne(commissionId, body.data.transactionId);
  return updateResult;
});