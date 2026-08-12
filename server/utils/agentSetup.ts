import { RedflareConfigCategory } from '~~/shared/enums/Config';

export async function isSetupLocked() {
  const config = await getCachedConfigByCategory(RedflareConfigCategory.AuthSetup);
  return !!(config as RedflareConfigAuthSetup | null)?.locked;
}

export async function generateSetupToken() {
  const token = Bun.randomUUIDv7();
  const configModel = useConfigModel();
  await configModel.setByCategory(RedflareConfigCategory.AuthSetup, {
    category: RedflareConfigCategory.AuthSetup,
    locked: false,
    setupToken: token,
    createdAt: new Date().toISOString()
  });
  await invalidateCachedConfigByCategory(RedflareConfigCategory.AuthSetup);
  return token;
}

export async function lockSetup(username: string, token: string) {
  const configModel = useConfigModel();
  // Verify the provided token matches the stored setup token before locking the setup
  const configDocument = await configModel.getByCategory(RedflareConfigCategory.AuthSetup);
  const storedToken = (configDocument as RedflareConfigAuthSetup | null)?.setupToken;
  if (storedToken !== token) {
    throw new Error('Invalid setup token provided.');
  }
  // If everything looks good, lock the setup and record the username of the person who locked it
  await configModel.setByCategory(RedflareConfigCategory.AuthSetup, {
    category: RedflareConfigCategory.AuthSetup,
    locked: true,
    lockedAt: new Date().toISOString(),
    lockedByUsername: username
  });
  await invalidateCachedConfigByCategory(RedflareConfigCategory.AuthSetup);
}
