import type { Customer } from './Customers.d';

export type CommissionStatus =
  'settled' | 'missing' | 'backlog' | 'in_setup' | 'next_up' |
  'in_development' | 'in_cooldown' |
  'showtime' | 'maintenance' | 'cancelled';

export type CommissionPaymentStatus = 'pending' | 'paid_auto' | 'paid_manual' | 'cancelled' | 'refunded' | 'chargeback' | 'disputed';
export type CommissionPaymentStatusEditable = 'paid_manual' | 'cancelled' | 'refunded' | 'chargeback' | 'disputed';
export type CommissionPaymentCurrency = 'ARS' | 'USD'; // ISO 4217 currency codes
export type CommissionPaymentProcessor = 'mercadopago' | 'paypal';

export interface Commission {
  id: string;
  oid: string | number;
  status: CommissionStatus | string;
  public_note: string | null;
  secure_note: string | null;
  created_at: string;
  updated_at: string;
  customer: Customer;
}

export interface CommissionPayment {
  // Database fields
  pid: string;
  commission: string;
  currency: string;
  income_amount: number;
  public_note: string | null;
  secure_note: string | null;
  state: CommissionPaymentStatus | string;
  created_at: string;
  updated_at: string;
  // Payment processor fields
  payment_ext_id: string;
  payment_ext_url: string;
  payment_processor: CommissionPaymentProcessor;
}

export type CommissionOptions = Omit<Commission, 'id' | 'oid' | 'created_at' | 'updated_at'> & { customer: string; }
export type CommissionUpdate = Partial<CommissionOptions>;

export type CommissionPaymentOptions = Pick<CommissionPayment, 'currency' | 'income_amount' | 'public_note' | 'secure_note'> & { commission: string; }
export type CommissionPaymentUpdate = Partial<Pick<CommissionPayment, 'public_note' | 'secure_note'>> & { state?: CommissionPaymentStatusEditable; };
export type CommissionPaymentInsert = Omit<CommissionPayment, 'pid' | 'created_at' | 'updated_at'>;