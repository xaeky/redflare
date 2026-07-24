import _ from 'lodash';

type AuditsQueryParams = { page?: number; filters?: Partial<Audit>; sorting?: { by: string; order: 1 | -1 } };

export const auditsQuery = defineQueryOptions(
  ({ page = 1, filters = {}, sorting = { by: 'created_at', order: -1 } }: AuditsQueryParams) => ({
    key: ['audits', { page, filters, sorting }],
    query: () => {
      const queryObject = { page, filters, sort_by: sorting.by, sort_order: sorting.order };
      const cleanedQueryObject = deepOmitBy(queryObject, (val) => _.isUndefined(val) || _.isNull(val));
      return useAPI<{ data: Audit[]; total: number }>('/api/audits', { query: cleanedQueryObject as Record<string, any> }).then((res) => res);
    },
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined'
  })
);