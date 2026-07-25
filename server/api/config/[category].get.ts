export default defineEventHandler(async (event) => {
  const category = getRouterParam(event, 'category') as RedflareConfigCategory;
  return getConfigByCategory(category);
});