export const commissionsQuery = defineQueryOptions({
  key: ['commissions'],
  query: () => useAPI<WithExistingCustomer<DeserializedCommission>[]>('/api/commissions').then((res) => res),
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

export const avatarBasesQuery = defineQueryOptions({
  key: ['avatar_bases'],
  query: () => {
    return useAPI<DeserializedAvatarBase[]>(`/api/commissions/bases`);
  },
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
});
