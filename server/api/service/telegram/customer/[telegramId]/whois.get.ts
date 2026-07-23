export default defineEventHandler(async (event) => {
  const telegramId = getRouterParam(event, 'telegramId');
  if (!telegramId) throw createError({ status: 400, statusText: 'Telegram ID is required' });
  const result = await useCustomerModel().getByTelegramId(telegramId as string);
  return result;
});