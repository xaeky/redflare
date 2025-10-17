export type PaymentProcessorType = 'mercadopago' | 'airtm' | 'paypal' | string;
export type PaymentCurrencyType = 'ARS' | 'USD' | string;

export interface PaymentTransaction {
  approved_at: string;
  created_at: string;
  updated_at: string;
  net_received_amount: number;
  total_paid_amount: number;
  payment_currency: PaymentCurrencyType;
  payment_processor: PaymentProcessorType;
  payment_ext_id: string;
  payment_ext_url?: string;
  manual?: boolean;
  internal_note?: boolean;
}

export type PaymentTransactionOptions = Omit<PaymentTransaction, 'created_at' | 'updated_at'>;
export type PaymentTransactionUpdate = Partial<Omit<PaymentTransaction, 'created_at' | 'updated_at'>>;