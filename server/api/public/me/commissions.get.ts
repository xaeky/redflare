export default defineEventHandler(async (event) => {
  const publicSession = await getPublicUserSession(event);
  if (!publicSession || !publicSession?.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  const publicUserDiscordId = publicSession.user.id;
  const customersModel = useCustomerModel();
  const commissionsModel = useCommissionModel();
  const customer = await customersModel.getByDiscordId(publicUserDiscordId);
  const commissions = await commissionsModel.getAll({ filters: { customer: customer._id.toString() }, page: 1 });
  return commissions;
});