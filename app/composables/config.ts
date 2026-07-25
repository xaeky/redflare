export function useRedflarePublicConfig<T = RedflareConfig>(category: RedflareConfigCategory) {
  return useAsyncData(`config-${category}`, async () => useAPI<T>(`/api/public/config/${category}`));
}