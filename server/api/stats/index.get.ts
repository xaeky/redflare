import { RedflareStats } from "~~/shared/types/Misc";

export default defineCachedEventHandler(async () => {
  const { getCommissionsCount, getNetRevenue, getCustomersCount } = useStatsModel();
  const countObject: Partial<RedflareStats> = {
    commissions: {
      today: await getCommissionsCount({ period: 'day' }),
      this_week: await getCommissionsCount({ period: 'week' }),
      this_month: await getCommissionsCount({ period: 'month' }),
      this_year: await getCommissionsCount({ period: 'year' }),
      total: await getCommissionsCount({ period: 'all' })
    },
    net_revenue: {
      ars: {
        today: await getNetRevenue({ period: 'day', currency: 'ARS' }),
        this_week: await getNetRevenue({ period: 'week', currency: 'ARS' }),
        this_month: await getNetRevenue({ period: 'month', currency: 'ARS' }),
        this_year: await getNetRevenue({ period: 'year', currency: 'ARS' }),
        total: await getNetRevenue({ period: 'all', currency: 'ARS' })
      },
      usd: {
        today: await getNetRevenue({ period: 'day', currency: 'USD' }),
        this_week: await getNetRevenue({ period: 'week', currency: 'USD' }),
        this_month: await getNetRevenue({ period: 'month', currency: 'USD' }),
        this_year: await getNetRevenue({ period: 'year', currency: 'USD' }),
        total: await getNetRevenue({ period: 'all', currency: 'USD' })
      }
    },
    customers: {
      today: await getCustomersCount({ period: 'day' }),
      this_week: await getCustomersCount({ period: 'week' }),
      this_month: await getCustomersCount({ period: 'month' }),
      this_year: await getCustomersCount({ period: 'year' }),
      total: await getCustomersCount({ period: 'all' })
    }
  }
  return countObject
}, {
  maxAge: 1800 // cache for 30 minutes
});