export default defineNuxtRouteMiddleware(() => {
  const { session } = usePublicUserSession();
  if (session.value.meta.isRegistered === false)
    return navigateTo('/me/unregistered', { replace: true });
});
