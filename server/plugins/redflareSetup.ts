export default defineNitroPlugin(async () => {
  // This plugin is responsible for setting up the Redflare application on first run.
  // It checks if the application has been set up, and if not, it creates the initial admin account.
  const isLocked = await isSetupLocked();
  if (isLocked) return;
  const setupToken = await generateSetupToken();
  logger
    .withTag('setup')
    .info(`Welcome, use this setup token when prompted: ${setupToken}`);
});
