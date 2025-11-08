import _ from 'lodash';

export default defineEventHandler(async (event) => {
  const { data } = await validateCommission(event, true);
  if (!data) throw createError({ statusCode: 404, message: 'Commission not found' });
  return data;
});