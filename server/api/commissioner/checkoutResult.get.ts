import { getPaymentSchema } from "~/server/schemas/Payments";
import { mpCreatePreference, mpGetPayment } from "~/server/services/mp";

/**
 * @endpoint /api/commissioner/checkoutResult
 * @method GET
 * @description Checks the checkout result.
 */
export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, getPaymentSchema.safeParse);
  if (!query.success) throw createError({
    statusCode: 401,
    message: 'Invalid body'
  });
  const paymentData = await mpGetPayment(query.data.id);

  return paymentData;
});