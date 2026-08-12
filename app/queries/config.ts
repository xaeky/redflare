export const configQuery = defineQueryOptions({
  key: ['config'],
  query: () => useAPI<RedflareConfig[]>('/api/config'),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined',
});

export const configByCategoryQuery = (category: RedflareConfigCategory) =>
  defineQueryOptions({
    key: ['config', category],
    query: () => useAPI<RedflareConfig>(`/api/config/${category}`),
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined',
  });
