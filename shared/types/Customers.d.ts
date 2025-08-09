import type { ObjectId, WithId } from 'mongodb';

export interface Customer {
  name: string;
  vrc_id: string;
  note: string | null;
  telegram_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type CustomerInsertOptions = Omit<Customer, 'created_at' | 'updated_at'> & {
  vrc_id?: string | null;
  note?: string | null;
};

export type CustomerUpdateOptions = Partial<CustomerInsertOptions>;

export type CustomerFilterOptions = {
  name?: string;
  vrc_id?: string;
  note?: string;
};

export type DeserializedCustomer = Deserialized<WithId<Customer>>;

export type WithCustomer<T> = T & { customer: Customer; };
export type WithExistingCustomer<T> = T & { customer: DeserializedCustomer; };
export type WithCustomerId<T> = T & { customer: string; };
export type WithCustomerOId<T> = T & { customer: typeof ObjectId; };