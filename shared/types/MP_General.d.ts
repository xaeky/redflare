export interface MPItem {
  id: string;
  picture_url: string;
  title: string;
  description: string;
  category_id: string;
  currency_id: 'ARS' | 'BRL' | 'CLP' | 'MXN' | 'COP' | 'PEN' | 'UYU';
  quantity: number;
  unit_price: number;
}

export type MPItemOptions =
  Omit<MPItem, 'description' | 'picture_url' | 'category_id' | 'currency_id' | 'id'> &
  Partial<Pick<MPItem, 'description' | 'picture_url' | 'category_id' | 'currency_id' | 'id'>>;

export interface MPPayer {
  name: string;
  surname: string;
  email: string;
  date_created: string;
  phone: {
    area_code: string;
    number: number;
  };
  identification: {
    type: string;
    number: number;
  };
  address: {
    street_name: string;
    street_number: string;
    zip_code: string;
  }
}

export interface MPPayment {
  id: number;
  date_created: string;
  date_approved: string;
  operation_type: 'investment' | 'regular_payment' | 'money_transfer' | 'recurring_payment' | 'account_fund' | 'payment_addition' | 'cellphone_recharge' | 'pos_payment' | 'money_exchange';
  issuer_id: string;
  transaction_details: {
    net_received_amount: string;
    total_paid_amount: string;
  }
  captured: boolean;
}

export interface MPPaymentMethods {
  excluded_payment_methods: string[];
  excluded_payment_types: string[];
  installments: string;
  default_payment_method_id: string;
  defualt_installments: string;
}

export interface MPBackURIs {
  success: string;
  pending: string;
  failure: string;
}

export interface MPAddress {
  zip_code: string;
  street_name: string;
  city_name: string;
  state_name: string;
  street_number: number;
  floor: string;
  apartment: string;
  country_name: string;
}

export interface MPShipment {
  receiver_address: MPAddress
}

export interface MPShipmentOptions extends MPShipment {
  mode: 'custom' | 'me2' | 'not_specified';
  local_pickup: boolean;
  dimensions: string;
  default_shipping_method: number;
  free_methods: { id: number }[];
  cost: number;
  free_shipping: boolean;
}