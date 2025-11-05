export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();
  if (!loggedIn.value) return navigateTo('https://avatars.xaeky.cloud', { external: true });
  else return navigateTo('/dashboard');
})