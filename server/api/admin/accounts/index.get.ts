export default defineEventHandler(async (event) => {
  await hasPermission(event, 'manage:managers', true);
  const accounts = await useAgentAccountsModel().getAll();
  return accounts.map(({ passwordHash, ...rest }) => rest);
});
