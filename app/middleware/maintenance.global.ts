export default defineNuxtRouteMiddleware((to) => {
  const isDashboard = to.path.startsWith('/dashboard/') || to.path === '/dashboard';
  const isApi = to.path.startsWith('/api/');
  const isPublicApi = to.path.startsWith('/api/public');
  const isPublicConfig = to.path.startsWith('/api/public/config');
  const isMaintenancePage = to.path === '/maintenance';

  if ((isDashboard || isPublicApi) || (isApi && !isPublicApi && !isPublicConfig)) return;

  const { config } = useRedflarePublicConfig();
  const generalConfig = config.value?.general as RedflareConfigGeneral;
  const isUnderMaintenance = generalConfig?.maintenanceMode;

  if (isMaintenancePage && isUnderMaintenance) return;
  if (isMaintenancePage && !isUnderMaintenance) return navigateTo('/');
  if (isUnderMaintenance) return navigateTo('/maintenance');
});