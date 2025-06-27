export default defineEventHandler(async (event) => {
  const permissions = await getPermissions(event);
  return permissions;
});