import type { OptionalId, WithId } from 'mongodb';

export enum CommissionFlagsType {
  None           = 0,
  HideCustomer   = 1 << 0,
  HideCharacters = 1 << 1,
  HidePayment    = 1 << 2,
  HighPriority   = 1 << 3,
}
export type CommissionPaymentStatus = 'pending' | 'paid_auto' | 'paid_manual' | 'cancelled' | 'refunded' | 'chargeback' | 'disputed';
export type CommissionPaymentStatusEditable = 'paid_manual' | 'cancelled' | 'refunded' | 'chargeback' | 'disputed';
export type CommissionPaymentCurrency = 'ARS' | 'USD' | 'USDT' | 'USDC' | 'CRYPTO';
export type CommissionPaymentProcessor = 'mercadopago' | 'paypal' | 'crypto';
// Shared
export type CommissionBaseRaw = OptionalId<{
  schemaVersion?: number;
  status: CommissionStatusType | number;
  flags: CommissionFlagsType | number;
  public_note: string | null;
  secure_note: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  characters: CommissionCharacterRaw[];
  customer: string;
  payments: string[] | OptionalId<PaymentTransaction>[];
}>;
export type CommissionBase = Omit<CommissionBaseRaw, 'characters'> & {
  characters: CommissionCharacter[];
}
export type DeserializedCommission = Deserialized<WithId<CommissionBase>> & {
  locked_fields?: {
    characters_count?: number;
  }
};
export type CommissionOptions = Omit<CommissionBase, 'updated_at' | 'customer' | 'characters'> & {
  customer: string;
  characters: CommissionCharacterOptions[];
  payments: string[];
};
export type CommissionUpdate = CommissionOptions & {
  customer?: ObjectId;
  updated_at?: Date | string;
};
export type CommissionInsert = Omit<CommissionBase, 'characters' | 'customer' | 'payments'> & {
  customer: ObjectId;
  characters: CommissionCharacterOptions[];
};
export type CommissionFilterOptions = {
  customer?: string;
  status?: CommissionStatusType | string;
};
export type CommissionPaymentOptions = Pick<CommissionPayment, 'currency' | 'income_amount' | 'public_note' | 'secure_note'> & { commission: string; };
export type CommissionPaymentUpdate = Partial<Pick<CommissionPayment, 'public_note' | 'secure_note'>> & { state?: CommissionPaymentStatusEditable; };
export type CommissionPaymentInsert = Omit<CommissionPayment, 'pid' | 'created_at' | 'updated_at'>;

// Avatar bases
export type AvatarBase = WithId<{
  created_at: string;
  updated_at: string;
  name: string;
  creator_name: string | null;
  storefront_url: string | null;
  blacklisted: boolean;
}>;
export type AvatarBaseInsertOptions = Omit<AvatarBase, 'created_at' | 'updated_at'>;
export type AvatarBaseUpdateOptions = Partial<AvatarBaseInsertOptions>;
export type DeserializedAvatarBase = Deserialized<WithId<AvatarBase>>;

// Front-end types @ Backoffice
export type SerializedCommission = Omit<CommissionBase, 'customer'> & {
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
export type PublicSerializedCommission = {
  data: CommissionBase & {
    locked_fields?: {
      characters_count: number;
    }
  },
  attachments?: Record<string, CommissionCharacterAttachmentRaw>;
  customer: DeserializedCustomer;
}

export type SingleCommissionResponse = {
  data: CommissionBaseRaw;
  attachments?: Record<string, CommissionCharacterAttachmentRaw>;
  customer: CustomerRaw;
}