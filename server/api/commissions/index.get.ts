export default defineEventHandler(async (event) => {
  // Verify if current session user has permissions to read commissions.
  await hasPermission(event, 'read:commissions');
  // Set objects and parameters for the request.
  let { page, sort_by, sort_order } = getQuery(event);
  // Filter is a json object, so we need to parse it.
  const filters: CommissionFilterOptions = JSON.parse(String(getQuery(event).filters || '{}'));
  sort_by ||= 'created_at';
  sort_order = (sort_order === '1' || sort_order === '-1') ? Number(sort_order) : 1;
  const sort = (sort_by && sort_order) ? { by: String(sort_by), order: Number(sort_order) as 1 | -1 } : undefined;
  const result = await useCommissionModel().getAll({
    page: Number(page) || 1,
    sort, filters
  });
  return result;
});