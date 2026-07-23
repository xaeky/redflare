export default defineEventHandler(async (event) => {
  // TODO: Implement a middleware to handle public authentication
  const publicSession = await getPublicUserSession(event);
  if (!publicSession || !publicSession?.user) throw createError({ status: 401, statusText: 'Unauthorized' });
  const publicUserDiscordId = publicSession.user.id;
  const customersModel = useCustomerModel();
  const commissionsModel = useCommissionModel();
  const customer = await customersModel.getByDiscordId(publicUserDiscordId);
  const commissions = await commissionsModel.getAll({
    filters: { customer: customer._id.toString() },
    page: 1,
    public: true
  });
  return commissions;
});