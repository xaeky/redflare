export default defineEventHandler(async () => {
  const result = await useAvatarBasesModel().getAll();
  return result;
});