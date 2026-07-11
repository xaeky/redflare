export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  const runtimeConfig = useRuntimeConfig();
  if (!loggedIn.value) return navigateTo(runtimeConfig.public.homepageUrl, { external: true });
  else return navigateTo('/dashboard');
})