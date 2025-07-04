export default defineNuxtRouteMiddleware(() => {
  return navigateTo('https://avatars.xaeky.cloud', { external: true });
})