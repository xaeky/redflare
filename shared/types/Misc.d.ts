export type Deserialized<T> = Omit<T, '_id'> & { _id: string };

export interface PageAction {
  label: string;
  icon?: string;
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
  variant?: "link" | "solid" | "outline" | "soft" | "subtle" | "ghost";
  action: () => void;
}

export interface RedflareStats {
  commissions: {
    today: number;
    this_week: number;
    this_month: number;
    this_year: number;
    total: number;
  };
  net_revenue: {
    usd: {
      today: number;
      this_week: number;
      this_month: number;
      this_year: number;
      total: number;
    };
    ars: {
      today: number;
      this_week: number;
      this_month: number;
      this_year: number;
      total: number;
    };
  };
  customers: {
    today: number;
    this_week: number;
    this_month: number;
    this_year: number;
    total: number;
  };
}