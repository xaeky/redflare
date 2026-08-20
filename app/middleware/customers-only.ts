export default defineNuxtRouteMiddleware(() => {
  const { session } = usePublicUserSession();
  if (session.value.customer === null)
    return navigateTo('/me/unregistered', { replace: true });
});
