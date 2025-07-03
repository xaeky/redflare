import _ from 'lodash';

export const customersQuery = defineQueryOptions({
  key: ['customers'],
  query: () => useAPI<Customer[]>('/api/customers').then((res) => res),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
});

export const customerFilterQuery = defineQueryOptions(
  ({name, page = 1}: { name?: string, page?: number }) => ({
    key: ['customers', { name, page }],
    query: () => {
      const queryObject = { name, page };
      // Delete undefined properties from the query object with lodash
      const cleanedQueryObject = _.omitBy(queryObject, _.isUndefined || _.isNull || _.isEmpty);
      return useAPI<Customer[]>('/api/customers', { query: cleanedQueryObject }).then((res) => res);
    },
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined'
  })
);