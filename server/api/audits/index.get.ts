export default defineEventHandler(async (event) => {
  let { page, sort_by, sort_order } = getQuery(event);
  const filters: Partial<Audit> = JSON.parse(String(getQuery(event).filters || '{}'));
  sort_by ||= 'created_at';
  sort_order = (sort_order === '1' || sort_order === '-1') ? Number(sort_order) : -1;
  const sort = (sort_by && sort_order) ? { by: String(sort_by), order: Number(sort_order) as 1 | -1 } : undefined;
  const result = await useAuditModel().getAll({
    page: Number(page) || 1,
    sort, filters
  });
  return result;
});