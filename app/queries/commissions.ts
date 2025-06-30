export const commissionsQuery = defineQueryOptions({
  key: ['commissions'],
  query: () => useAPI<SerializedCommission[]>('/api/commissions').then((res) => res),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
})