import { RuntimeConfig } from "nuxt/schema";
import _ from 'lodash';
import type { CreatePaymentLinkOptions } from "../types/Links";
import type { MPCreatePreferenceRequestOptions } from "../types/MercadoPago/Preferences";
import type { MPPayment } from "../types/MercadoPago/General";

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
export const mpCreatePreference = async (options: CreatePaymentLinkOptions, runtimeConfig: RuntimeConfig) => {
  const requestBody:MPCreatePreferenceRequestOptions = {
    items: [
      {
        title: `${runtimeConfig.public.creator.marketName} - Comisión #${options.commission_id}`,
        unit_price: options.attachment.amount,
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
    marketplace: `${runtimeConfig.mp.marketplace}`,
    auto_return: 'all',
    external_reference: options.commission_id
  };
  const data = await $mp(`/checkout/preferences`, { method: 'POST', body: requestBody });
  return data;
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
