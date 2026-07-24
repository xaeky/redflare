import { RedflareConfigCategory } from '~~/shared/enums/Config';

export default defineEventHandler(async (event) => {
  const configModel = useConfigModel();
  const category = getRouterParam(event, 'category') as RedflareConfigCategory;
  const allowedCategories = Object.values(RedflareConfigCategory);
  // Validate category
  if (!allowedCategories.includes(category)) {
    throw createError({
      status: 400,
      statusText: `Invalid category. Allowed categories: ${allowedCategories.join(', ')}`,
    });
  }
  const body = await readBody<RedflareConfigUpsertOptions>(event);
  await configModel.setByCategory(category, body as RedflareConfig);
  await invalidateCachedConfigByCategory(category);
  return;
});