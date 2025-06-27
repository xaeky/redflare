import type { MPBackURIs, MPItem, MPItemOptions, MPPayer, MPPaymentMethods, MPShipment, MPShipmentOptions } from "./MP_General";

interface MPPreference {
  items: MPItem[];
  payer: MPPayer;
  back_urls: MPBackURIs;
  auto_return: 'approved' | 'all';
  payment_methods: MPPaymentMethods;
  external_reference: string;
  additional_info: string;
  expires: boolean;
  expiration_date_from: string;
  expiration_date_to: string;
  marketplace: string;
  merketplace_fee: number;
  metadata: unknown;
  binary_mode: boolean;
  notification_url: string;
  statement_descriptor: string;
}

export interface MPCreatePreferenceRequestOptions extends Omit<Partial<MPPreference>, 'items'> {
  items: MPItemOptions[];
  differential_pricing?: {
    id: number;
  };
  tracks?: {
    type: 'google_ad' | 'facebook_ad';
    values: {
      conversion_id: number;
      conversion_label: string;
      pixel_id: string;
    }
  }[];
  shipments?: MPShipmentOptions;
}

export interface MPCreatePreferenceResponseFields extends MPPreference {
  collector_id: number;
  operation_type: 'regular_payment' | 'money_transfer';
  client_id: string;
  shipments: MPShipment;
  date_created: string;
  id: string;
  init_point: string;
  sandbox_init_point: string;
}