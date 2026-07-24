type CommissionQueryParams = { page?: number; sorting?: { by: string; order: number } };
type CommissionsResponse = { data: WithCustomer<DeserializedCommission>[]; total: number };

export const commissionsQuery = defineQueryOptions(
  ({ page = 1, sorting = { by: 'created_at', order: -1 } }: CommissionQueryParams) => ({
    key: ['commissions', { page, sorting }],
    query: () => {
      const queryObject = { page, sort_by: sorting.by, sort_order: sorting.order };
      return useAPI<CommissionsResponse>('/api/commissions', { query: queryObject }).then((res) => res);
    },
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined'
  })
);

export const avatarBasesQuery = defineQueryOptions({
  key: ['avatar_bases'],
  query: () => {
    return useAPI<DeserializedAvatarBase[]>(`/api/commissions/bases`);
  },
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
});
