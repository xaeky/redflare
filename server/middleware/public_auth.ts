export default defineEventHandler(async (event) => {
  const publicSession = await getPublicUserSession(event);
  const publicPaths = ['/api/public', '/commission'];
  const isPublicRoute = publicPaths.some(path => event.path.startsWith(path));
  if (!isPublicRoute) return;
  return;
});