export const statsQuery = defineQueryOptions({
  key: ['stats'],
  query: () => useAPI<RedflareStats>('/api/stats').then((res) => res),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
});