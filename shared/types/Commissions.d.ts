import type { WithId } from 'mongodb';

export enum CommissionFlagsType {
  None           = 0,
  HideCustomer   = 1 << 0,
  HideCharacters = 1 << 1,
  HidePayment    = 1 << 2,
  HighPriority   = 1 << 3,
}

export type CommissionPaymentStatus = 'pending' | 'paid_auto' | 'paid_manual' | 'cancelled' | 'refunded' | 'chargeback' | 'disputed';
export type CommissionPaymentStatusEditable = 'paid_manual' | 'cancelled' | 'refunded' | 'chargeback' | 'disputed';
export type CommissionPaymentCurrency = 'ARS' | 'USD'; // ISO 4217 currency codes
export type CommissionPaymentProcessor = 'mercadopago' | 'paypal';

export interface CommissionBase {
  status: CommissionStatusType | number;
  flags: CommissionFlagsType | number;
  public_note: string | null;
  secure_note: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  characters: CommissionCharacter[];
  payments: string[];
}

export type DeserializedCommission = Deserialized<WithId<CommissionBase>>;

export type CommissionOptions = Omit<Commission, 'created_at' | 'updated_at'> & {
  customer: string | ObjectId;
  characters: (CommissionCharacterOptions & { base: string | ObjectId })[];
  payments: string[];
};
export type CommissionUpdate = CommissionOptions & {
  customer: string | ObjectId;
  characters: (CommissionCharacterOptions & { base: string | ObjectId })[];
  payments: string[];
};
export type CommissionInsert = Omit<Commission, 'created_at' | 'updated_at' | 'customer'> & { customer: string; };

export type CommissionFilterOptions = {
  customer?: string;
  status?: CommissionStatusType | string;
};

export type CommissionPaymentOptions = Pick<CommissionPayment, 'currency' | 'income_amount' | 'public_note' | 'secure_note'> & { commission: string; };
export type CommissionPaymentUpdate = Partial<Pick<CommissionPayment, 'public_note' | 'secure_note'>> & { state?: CommissionPaymentStatusEditable; };
export type CommissionPaymentInsert = Omit<CommissionPayment, 'pid' | 'created_at' | 'updated_at'>;

// Avatar bases

export interface AvatarBase {
  created_at: string;
  updated_at: string;
  name: string;
  creator_name: string | null;
  storefront_url: string | null;
}

export type AvatarBaseInsertOptions = Omit<AvatarBase, 'created_at' | 'updated_at'>;
export type AvatarBaseUpdateOptions = Partial<AvatarBaseInsertOptions>;

export type DeserializedAvatarBase = Deserialized<WithId<AvatarBase>>;

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
