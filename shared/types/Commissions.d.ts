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
  created_at: string | Date;
  updated_at: string | Date;
  customer: Customer;
  characters: CommissionCharacter[];
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

export interface CommissionBase {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  creator_name: string | null;
  storefront_url: string | null;
}

export interface CommissionCharacter {
  id: string;
  order_id: string;
  commission: Commission;
  base: CommissionBase;
  name: string;
  note: string | undefined;
  changelog: Record<string, string> | undefined;
  created_at: string;
  updated_at: string;
}

export type CommissionOptions = Omit<Commission, 'id' | 'oid' | 'updated_at' | 'customer'> & { customer: string; };
export type CommissionUpdate = Partial<CommissionOptions>;

export type CommissionPaymentOptions = Pick<CommissionPayment, 'currency' | 'income_amount' | 'public_note' | 'secure_note'> & { commission: string; };
export type CommissionPaymentUpdate = Partial<Pick<CommissionPayment, 'public_note' | 'secure_note'>> & { state?: CommissionPaymentStatusEditable; };
export type CommissionPaymentInsert = Omit<CommissionPayment, 'pid' | 'created_at' | 'updated_at'>;

export type CommissionBaseOptions = Omit<CommissionBase, 'id' | 'created_at' | 'updated_at'>;

export type CommissionCharacterOptions = Pick<CommissionCharacter, 'name'> & { note?: string; changelog?: Record<string, string>; commission: string; base: string; };
export type CommissionCharacterUpdate = Partial<CommissionCharacterOptions>;

// Front-end types @ Backoffice

export type SerializedCommission = Omit<Commission, 'customer'> & {
  n_characters: number;
  customer: {
    id: string;
    name: string;
    vrc_id: string | null;
  };
  latest_payment: CommissionPayment;
};

export type SerializedCommissionCharacterOptions = Omit<CommissionCharacterOptions, 'commission'>;

export type WithId<T> = { id: string; } & T;

// Front-end types @ Frontoffice

export type PublicSerializedCommission = Omit<Commission, 'public_note' | 'secure_note'> & {
  note: string;
  n_characters: number;
  customer: {
    id: string;
    name: string;
    vrc_id: string | null;
  };
  latest_payment: CommissionPayment;
}