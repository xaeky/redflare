export default defineEventHandler(async (event) => {
  const category = getRouterParam(event, 'category') as RedflareConfigCategory;
  if (!category) {
    throw createError({
      status: 400,
      statusText: 'Missing category parameter',
    });
  }

  const config = await getCachedConfigByCategory(category);
  if (!config) {
    throw createError({
      status: 404,
      statusText: `Configuration for category "${category}" not found`,
    });
  }

  return config;
});
