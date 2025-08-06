import _ from 'lodash';

type CustomerQueryParams = { name?: string; page?: number, sorting?: { by: string; order: number } };
export const customersQuery = defineQueryOptions(
  ({ name, page = 1, sorting = { by: 'created_at', order: -1 } }: CustomerQueryParams) => ({
    key: ['customers', { name, page, sorting }],
    query: () => {
      const queryObject = { name, page, sort_by: sorting.by, sort_order: sorting.order };
      // Delete undefined properties from the query object with lodash
      const cleanedQueryObject = _.omitBy(queryObject, _.isUndefined || _.isNull || _.isEmpty);
      return useAPI<DeserializedCustomer[]>('/api/customers', { query: cleanedQueryObject }).then((res) => res);
    },
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined'
  })
);

export const customerFilterQuery = defineQueryOptions(
  ({name, page = 1}: { name?: string, page?: number }) => ({
    key: ['customers', { name, page }],
    query: () => {
      const queryObject = { name, page };
      // Delete undefined properties from the query object with lodash
      const cleanedQueryObject = _.omitBy(queryObject, _.isUndefined || _.isNull || _.isEmpty);
      return useAPI<DeserializedCustomer[]>('/api/customers', { query: cleanedQueryObject }).then((res) => res);
    },
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined'
  })
);