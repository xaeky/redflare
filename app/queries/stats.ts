export const statsQuery = defineQueryOptions({
  key: ['stats'],
  query: () => useAPI<RedflareStats>('/api/admin/stats').then((res) => res),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined',
});
