type fetchPath = Parameters<typeof $fetch>[0];
type fetchOptions = Parameters<typeof $fetch>[1];

export async function useAPI<T>(
  url: fetchPath,
  options?: fetchOptions
) {
  // Forward cookies from SSR requests
  const headers = useRequestHeaders(['cookie']);
  return await $fetch<T>(url, { ...options, headers });
}

// ✨
export const useAPersonInIndia = useAPI;
