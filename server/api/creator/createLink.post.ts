import { createPaymentLinkOptionsSchema } from "~/server/schemas/Links";
import { mpCreatePreference } from "~/server/services/mp";

/**
 * @endpoint /api/creator/createLink
 * @method POST
 * @description Create a payment link, linked to a existing commission.
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createPaymentLinkOptionsSchema.safeParse);
  if (!body.success) throw createError({
    statusCode: 401,
    message: 'Invalid body'
  });
  const config = useRuntimeConfig(event);
  if (body.data.attachment.currency !== 'ARS') throw createError({ status: 400, message: 'Unavailable currency' })
  const mpPreference = await mpCreatePreference(body.data, config);

  return mpPreference;
});