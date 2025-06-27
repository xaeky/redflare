export interface CreatePaymentLinkOptions {
	commission_id: string;
	customer_id: string;
	attachment: {
		currency: "ARS" | "USD";
		amount: number;
	},
	note?: string;
}

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