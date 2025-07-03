export const commissionsQuery = defineQueryOptions({
  key: ['commissions'],
  query: () => useAPI<SerializedCommission[]>('/api/commissions').then((res) => res),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
});

export const commissionsBasesQuery = defineQueryOptions({
  key: ['commissions_bases'],
  query: () => {
    return useAPI<CommissionBase[]>(`/api/commissions/bases`);
  },
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
});

export const commissionCharactersQuery = defineQueryOptions(
  ({ commissionId }: { commissionId: string }) => ({
    key: ['commission_characters', { commissionId }],
    query: () => {
      return useAPI<CommissionCharacter[]>(`/api/commissions/${commissionId}/characters`);
    },
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined'
  })
);