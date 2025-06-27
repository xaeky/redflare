import type { Customer } from './Customers.d';

type CommissionStatus =
  'settled' | 'missing' | 'backlog' | 'in_setup' | 'next_up' |
  'in_development' | 'in_cooldown' |
  'showtime' | 'maintenance' | 'cancelled';

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

export type CommissionOptions = Omit<Commission, 'id' | 'oid' | 'created_at' | 'updated_at'> & { customer: string; }