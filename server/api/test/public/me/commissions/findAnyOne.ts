export default defineEventHandler(async (event) => {
  const me = await getPublicUserSession(event);
  console.log('Public user session:', JSON.stringify(me, null, 2));
  const commissions = await useCommissionModel().getAll({
    page: 1,
    filters: { customer: me.secure.customer },
    sort: { by: 'created_at', order: -1 }
  });
  const selectedCommission = commissions.data[Math.floor(Math.random() * commissions.data.length)];
  return selectedCommission;
});