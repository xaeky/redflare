import { RuntimeConfig } from "nuxt/schema";
import { $fetch, type FetchError } from 'ofetch';
import _ from 'lodash';

const runtimeConfig = useRuntimeConfig(); 
export const $mp = $fetch.create({
  baseURL: runtimeConfig.mp.endpointBase,
  headers: { 'Authorization': `Bearer ${runtimeConfig.mp.service}` }
});

/**
 * Creates a preference to start a payment flow.
 * @external https://www.mercadopago.com.ar/developers/es/reference/preferences/_checkout_preferences/post
 * @param options Payment link creation options
 * @param runtimeConfig Nuxt's Runtime Config
 * @returns 
 */
export const mpCreatePreference = async (options: MPCreatePaymentLinkOptions, runtimeConfig: RuntimeConfig) => {
  const requestBody:MPCreatePreferenceRequestOptions = {
    items: [
      {
        title: options.title,
        unit_price: options.amount,
        quantity: 1,
        currency_id: 'ARS',
        category_id: 'virtual_goods'
      }
    ],
    back_urls: {
      success: `${runtimeConfig.public.creator.callbackUri}/commission_checkout/ack`,
      pending: `${runtimeConfig.public.creator.callbackUri}/commission_checkout/ack`,
      failure: `${runtimeConfig.public.creator.callbackUri}/commission_checkout/cancelled`,
    },
    auto_return: 'approved'
  };
  try {
    const result = await $mp(`/checkout/preferences`, { method: 'POST', body: requestBody });
    return result as MPCreatePreferenceResponseFields;
  } catch (error) {
    const err = error as FetchError || Error;
    throw createError({
      statusCode: 500,
      message: 'Failed to create MercadoPago preference',
      data: err.data || err
    });
  }
}

/**
 * Get details about a payment by ID.
 * @param id MercadoPago's payment ID
 * @returns MPPayment
 */
export const mpGetPayment = async (id: string) => {
  const data = await $mp<MPPayment>(`/v1/payments/${id}`, { method: 'GET' });
  return data;
}
