/**
 * @endpoint /api/creator/createLink
 * @method POST
 * @description Create a payment link, linked to a existing commission.
 * @deprecated This endpoint is deprecated and will be removed in the future. Use POST /api/commissions/{id}/payments instead.
*/
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createPaymentLinkOptionsSchema.safeParse);
  if (!body.success) throw createError({
    statusCode: 400,
    message: 'Invalid body'
  });
  const config = useRuntimeConfig(event);
  if (body.data.attachment.currency !== 'ARS') throw createError({ status: 400, message: 'Unavailable currency' })
  const mpPreference = await mpCreatePreference(body.data, config);

  return mpPreference;
});