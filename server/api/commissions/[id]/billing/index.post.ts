
export default defineEventHandler(async (event) => {
  await hasPermission(event, 'create:payment');
  const body = await readValidatedBody(event, commissionPaymentOptionsSchema.safeParse);
  if (!body.success) throw createError({ statusCode: 400, message: 'Invalid body' });
  const commissionId = await validateCommission(event);
  // Insert the new payment transaction item
  const billingModel = useBillingModel();
  const result = await billingModel.insertOne({
    ...body.data,
    manual: true
  });
  if (!result) throw createError({ statusCode: 500, message: 'Failed to create payment' });
  // Add payment ID to the commission's payments array
  const commissionModel = useCommissionModel();
  const updateResult = await commissionModel.addTransactionToOne(commissionId, result.insertedId.toString());
  if (!updateResult) throw createError({ statusCode: 500, message: 'Failed to link transaction to commission' });
  // Return the newly created payment
  return result;
});