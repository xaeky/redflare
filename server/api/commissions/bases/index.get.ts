export default defineCachedEventHandler(async () => {
  const result = await useAvatarBasesModel().getAll();
  return result;
}, {
  maxAge: 60 * 60, // 1 hour
  getKey: () => 'avatar_bases'
});