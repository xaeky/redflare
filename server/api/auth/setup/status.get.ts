export default defineEventHandler(async () => {
  const locked = await isSetupLocked();
  return { locked };
});
