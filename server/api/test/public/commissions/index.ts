export default defineEventHandler(async () => {
  const commissions = await useCommissionModel().getAll({
    page: 1, filters: {},
    sort: { by: 'created_at', order: -1 }
  });
  return commissions;
});