export const getBillingProcessorsOptions = (processor?: PaymentProcessorType) => {
	const processors = [
		{ label: 'MercadoPago', value: 'mercadopago' },
		{ label: 'PayPal', value: 'paypal' },
		{ label: 'Crypto', value: 'crypto' }
	] as { label: string; value: PaymentProcessorType }[];
  return processor ? processors.find(p => p.value === processor) : processors;
};

export const getBillingCurrenciesOptions = (currency?: PaymentCurrencyType) => {
	const currencies = [
		{ label: 'ARS', value: 'ARS' },
		{ label: 'USD', value: 'USD' },
		{ label: 'USDT', value: 'USDT' },
		{ label: 'USDC', value: 'USDC' }
	] as { label: string; value: PaymentCurrencyType }[];
	return currency ? currencies.find(c => c.value === currency) : currencies;
};

export const getBillingCurrencySymbol = (currency: PaymentCurrencyType) => {
	const symbols: Record<PaymentCurrencyType, string> = {
		'ARS': 'ARS',
		'USD': 'USD',
		'USDT': 'USD',
		'USDC': 'USD'
	};
	return symbols[currency];
}

export const getBillingCurrencyLocales = (currency: PaymentCurrencyType) => {
	const locales: Record<PaymentCurrencyType, string> = {
		'ARS': 'es-AR',
		'USD': 'en-US',
		'USDT': 'en-US',
		'USDC': 'en-US'
	};
	return locales[currency];
}