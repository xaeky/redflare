import { createPaymentPreference } from "~~/server/utils/payment";

export default defineEventHandler(async (event) => {
  // Read the validated body from the event
  const body = await readValidatedBody(event, commissionPaymentOptionsSchema.safeParse);
  if (!body.success) throw createError({ statusCode: 400, message: 'Invalid body' });
  // Get the commission ID from the route parameters
  const commission_id = getRouterParam(event, 'id');
  if (!commission_id) throw createError({ statusCode: 400, message: 'Missing commission ID' });
  // Check if commission exists
  const commissionExists = await ($supabase()).from('commissions').select('id').eq('id', commission_id).single();
  if (commissionExists.error || !commissionExists.data) throw createError({ statusCode: 404, message: 'Commission not found' });
  // Prepare the payment, map currency and processor
  const paymentProcessorByCurrency = {
    'ARS': 'mercadopago',
    'USD': 'paypal'
  };
  // Create payment preference
  const { currency, income_amount:amount, public_note, secure_note } = body.data;
  const paymentPreference = await createPaymentPreference({
    title: `Comisión #${commission_id}`,
    currency, amount
  }, useRuntimeConfig(event));
  // Insert the payment into the database
  const { data, error } = await ($supabase()).from('commissions_payments').insert({
    commission: commission_id,
    currency,
    income_amount: amount,
    public_note: public_note || null,
    secure_note: secure_note || null,
    state: 'pending',
    payment_ext_id: paymentPreference.id,
    payment_ext_url: paymentPreference.init_point,
    payment_processor: paymentProcessorByCurrency[currency]
  }).select('*').single();
  if (error) throw createError({ statusCode: 500, message: 'Failed to create payment' });
  // Return the created payment
  return data;
});