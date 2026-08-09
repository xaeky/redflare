export default defineEventHandler(async () => {
  const { listSecrets } = await useInfisical();
  const secrets = await listSecrets();
  return secrets;
});