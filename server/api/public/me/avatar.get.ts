export default defineEventHandler(async (event) => {
  const publicSession = await getPublicUserSession(event);
  const { user } = publicSession;
  if (!user) throw createError({ status: 401, statusText: 'Not authenticated' });
  let avatarUrl: string;
  // Return generic avatar if user has no avatar set
  if (!user.avatar) avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';
  else avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`;
  // Return avatar image from Discord CDN
  const image = await $fetch<ArrayBuffer>(avatarUrl, { responseType: 'arrayBuffer' });
  setHeader(event, 'Content-Type', 'image/png');
  setHeader(event, 'Cache-Control', 'public, max-age=86400');
  return Buffer.from(image);
});