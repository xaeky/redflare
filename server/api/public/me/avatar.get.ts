export default defineEventHandler(async (event) => {
  const publicSession = await getPublicUserSession(event);
  const { user } = publicSession;
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`;
  const image = await $fetch<ArrayBuffer>(avatarUrl, { responseType: 'arrayBuffer' });
  setHeader(event, 'Content-Type', 'image/png');
  setHeader(event, 'Cache-Control', 'public, max-age=86400');
  return Buffer.from(image);
});