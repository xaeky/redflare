export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) return navigateTo('/api/auth/auth0', { external: true });
})