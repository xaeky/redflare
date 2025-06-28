import type { Customer } from './Customers.d';

type CommissionStatus =
  'settled' | 'missing' | 'backlog' | 'in_setup' | 'next_up' |
  'in_development' | 'in_cooldown' |
  'showtime' | 'maintenance' | 'cancelled';

type CommissionPaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'chargeback' | 'disputed';
type CommissionPaymentCurrency = 'ARS' | 'USD'; // ISO 4217 currency codes
type CommissionPaymentProcessor = 'mercadopago' | 'paypal';

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
  payment_id: string;
  payment_url: string;
  payment_process: CommissionPaymentProcessor;
}

export type CommissionOptions = Omit<Commission, 'id' | 'oid' | 'created_at' | 'updated_at'> & { customer: string; }
export type CommissionUpdate = Partial<CommissionOptions>;

export type CommissionPaymentOptions = Pick<CommissionPayment, 'currency' | 'income_amount' | 'public_note' | 'secure_note'> & { commission: string; }
export type CommissionPaymentUpdate = Partial<Pick<CommissionPayment, 'public_note' | 'secure_note'>>