export function useRedflarePublicConfig() {
  const publicConfigState = useState<Record<RedflareConfigCategory, RedflareConfig> | null>('public-config', () => null);

  const fetch = async () => {
    const configResult = await useRequestFetch()<{ [key: string]: RedflareConfig }>('/api/public/config', { retry: false }).catch(() => null);
    if (configResult) publicConfigState.value = configResult as Record<RedflareConfigCategory, RedflareConfig>;
  };

  return {
    fetch,
    config: publicConfigState,
  };
}