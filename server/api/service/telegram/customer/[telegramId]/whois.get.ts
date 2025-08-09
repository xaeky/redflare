export default defineEventHandler(async (event) => {
  const telegramId = getRouterParam(event, 'telegramId');
  if (!telegramId) throw createError({ statusCode: 400 });
  const result = await useCustomerModel().getByTelegramId(telegramId as string);
  return result;
});