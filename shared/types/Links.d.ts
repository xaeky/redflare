export interface CreatePaymentLinkOptions {
	currency: 'ARS' | 'USD';
	title: string;
	amount: number;
}

export type MPCreatePaymentLinkOptions = Omit<CreatePaymentLinkOptions, 'currency'>;

export interface PaymentLink {
	paymentlink_id: string;
	author_id: string;
	tempcommission_id?: string;
	tempcustomer_id?: string;
	attachment: {
		currency: "ARS" | "USD";
		amount: number;
	},
	note?: string;
	link: {
		url: string;
		status: "PENDING" | "REJECTED" | "SETTLED";
	};
}

export interface MPAgreementAttempt {
	agreement_id: string;
	agreement_uri: string;
}