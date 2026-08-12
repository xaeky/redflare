export default defineEventHandler(async (event) => {
  const { data } = await validateCommission(event, true);
  if (!data)
    throw createError({ status: 404, statusText: 'Commission not found' });
  return data;
});
