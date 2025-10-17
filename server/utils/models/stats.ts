import { CommissionStatusType } from "~~/shared/enums/Commissions";

type PeriodType = 'day' | 'week' | 'month' | 'year' | 'all';
type CommissionCountFilter = {
  period: PeriodType;
  status?: CommissionStatusType;
};
type RevenueCountFilter = {
  period: PeriodType;
  currency?: 'USD' | 'ARS';
}
type CustomerCountFilter = {
  period: PeriodType;
};

function getPeriodStartOfDay(period: PeriodType) {
  const now = new Date();
  const periodStartMap = {
    day: () => new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    week: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()),
    month: () => new Date(now.getFullYear(), now.getMonth(), 1),
    year: () => new Date(now.getFullYear(), 0, 1),
    all: () => new Date(0)
  };
  // Fallback to today's stats
  const periodStart = periodStartMap[period]() || periodStartMap['day']();
  return periodStart;
}

const getCommissionsCount = async (filter: CommissionCountFilter) => {
  const collection = await useMongoCollection<CommissionBase>('commissions');
  const now = new Date();
  let start: Date;

  start = getPeriodStartOfDay(filter.period);

  const match: Record<string, any> = {
    created_at: { $gte: start.toISOString(), $lte: now.toISOString() }
  };
  if (filter.status) {
    match.status = filter.status;
  }
  const result = await collection.aggregate([
    { $match: match },
    { $count: "count" }
  ]).next();
  return result?.count || 0;
};

const getNetRevenue = async (filter: RevenueCountFilter) => {
  const collection = await useMongoCollection<PaymentTransaction>('billing_transactions');
  const now = new Date();
  let start: Date;

  start = getPeriodStartOfDay(filter.period);

  const match: Record<string, any> = {
    approved_at: { $gte: start.toISOString(), $lte: now.toISOString() },
    payment_currency: filter.currency || 'USD'
  };
  const result = await collection.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$net_received_amount" } } }
  ]).next();
  return result?.total || 0;
};

const getCustomersCount = async (filter: CustomerCountFilter) => {
  const collection = await useMongoCollection<Customer>('customers');
  const now = new Date();
  let start: Date;

  start = getPeriodStartOfDay(filter.period);

  const match: Record<string, any> = {
    created_at: { $gte: start.toISOString(), $lte: now.toISOString() }
  };
  const result = await collection.aggregate([
    { $match: match },
    { $count: "count" }
  ]).next();
  return result?.count || 0;
};

export const useStatsModel = () => ({
  getCommissionsCount,
  getNetRevenue,
  getCustomersCount
});