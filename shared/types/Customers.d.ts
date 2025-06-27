export interface Customer {
  id: string;
  name: string;
  vrc_id: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export type CustomerOptions = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;