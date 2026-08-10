import { RedflareConfigCategory } from '~~/shared/enums/Config';

export async function isSetupLocked() {
  const config = await getCachedConfigByCategory(RedflareConfigCategory.AuthSetup);
  return !!(config as RedflareConfigAuthSetup | null)?.locked;
}

export async function lockSetup(username: string) {
  const configModel = useConfigModel();
  await configModel.setByCategory(RedflareConfigCategory.AuthSetup, {
    category: RedflareConfigCategory.AuthSetup,
    locked: true,
    lockedAt: new Date().toISOString(),
    lockedByUsername: username
  });
  await invalidateCachedConfigByCategory(RedflareConfigCategory.AuthSetup);
}
