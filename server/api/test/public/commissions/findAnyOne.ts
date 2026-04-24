export default defineEventHandler(async () => {
  const commissions = await useCommissionModel().getAll({
    page: 1, filters: {},
    sort: { by: 'created_at', order: -1 }
  });
  const selectedCommission = commissions.data[Math.floor(Math.random() * commissions.data.length)];
  return selectedCommission;
});