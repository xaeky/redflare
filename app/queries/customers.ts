import type { Customer } from '~/server/types/Customers';

export const customersQuery = defineQueryOptions({
  key: ['customers'],
  query: () => useAPI<Customer[]>('/api/customers').then((res) => res),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
})