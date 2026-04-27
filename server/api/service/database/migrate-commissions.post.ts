export default defineEventHandler(async () => {
  return await useCommissionModel().migrateCommissions();
});
