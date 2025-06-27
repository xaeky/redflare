export interface Payment {
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