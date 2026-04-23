export const getBillingProcessors = (processor?: CommissionPaymentProcessor) => {
	const processors = [
		{ label: 'MercadoPago', value: 'mercadopago' },
		{ label: 'PayPal', value: 'paypal' },
		{ label: 'Crypto', value: 'crypto' }
	] as { label: string; value: CommissionPaymentProcessor }[];
  return processor ? processors.find(p => p.value === processor) : processors;
};

export const getBillingCurrencies = (currency?: CommissionPaymentCurrency) => {
	const currencies = [
		{ label: 'ARS', value: 'ARS' },
		{ label: 'USD', value: 'USD' },
		{ label: 'USDT', value: 'USDT' },
		{ label: 'USDC', value: 'USDC' },
		{ label: 'Crypto', value: 'CRYPTO' }
	] as { label: string; value: CommissionPaymentCurrency }[];
	return currency ? currencies.find(c => c.value === currency) : currencies;
};