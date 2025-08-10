import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const telegramId = getRouterParam(event, 'telegramId');
  if (!telegramId) throw createError({ statusCode: 400 });
  const customer = await useCustomerModel().getByTelegramId(telegramId as string);
  const customerId = customer._id.toString('hex');
  const commissions = await useCommissionModel().getAll({ filters: {
    customer: customerId,
  }, page: 1 });
  return commissions;
});