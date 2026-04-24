export default defineEventHandler(async (event) => {
  const me = await getPublicUserSession(event);
  const commissions = await useCommissionModel().getAll({
    page: 1,
    filters: { customer: me.secure.customer },
    sort: { by: 'created_at', order: -1 }
  });
  return commissions;
});