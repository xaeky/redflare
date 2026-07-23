import _ from "lodash";

interface PaymentAttachment {
  id: string;
  currency: CommissionPaymentCurrency;
  amount: number;
  init_point: string;
  processor: CommissionPaymentProcessor;
}

export const createPaymentPreference = async (options: CreatePaymentLinkOptions, runtimeConfig: any) => {
  const { title, currency, amount } = options;
  const paymentObject:Partial<PaymentAttachment> = {};
  const paymentFunctionMap = {
    'ARS': async () => {
      try {
        const result = await mpCreatePreference({ title, amount }, runtimeConfig);
        // Assign values to paymentObject
        return _.assign(paymentObject, {
          id: result.id,
          currency: 'ARS',
          amount,
          init_point: result.init_point,
          processor: 'mercadopago'
        });
      } catch (error) {
        throw createError({ status: 500, statusText: 'Unable to create MercadoPago preference', data: error });
      }
    },
    'USD': async () => {
      // TODO: PayPal integration
      throw createError({ status: 501, statusText: 'PayPal integration not implemented yet' });
    }
  };
  await paymentFunctionMap[currency]();
  if (!paymentObject) throw createError({ status: 500, statusText: 'Payment object not created' });
  return paymentObject as PaymentAttachment;
};