import { withQuery } from 'ufo';

type DiscordOAuthResponseQuery = {
  code?: string;
  error?: string;
};

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const { clientId: client_id, clientSecret: client_secret, redirectUrl: redirect_uri } = runtimeConfig.frontoffice.oauth.discord;
  const discordUrls = {
    authorization: 'https://discord.com/api/oauth2/authorize',
    token: 'https://discord.com/api/oauth2/token',
    userInfo: 'https://discord.com/api/users/@me'
  }
  const query = getQuery<DiscordOAuthResponseQuery>(event);

  if (query.error) throw createError({ statusCode: 400, statusMessage: `Discord OAuth Error: ${query.error}` });
  let scope = ['identify'].join(' ');
  if (!query.code) {
    return sendRedirect(event,
      withQuery(discordUrls.authorization, {
        response_type: 'code',
        client_id,
        redirect_uri,
        scope
      })
    );
  };

  let tokens: any;
  try {
    const body = new URLSearchParams({
      client_id, client_secret, grant_type: 'authorization_code', redirect_uri, code: query.code, scope
    }).toString();
    const result = await $fetch(discordUrls.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body
    });
    tokens = result;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: `Discord OAuth Error: ${(error as Error).message}` });
  }

  const discordAccessToken = 'Bearer ' + tokens.access_token;
  const discordUser = await $fetch(discordUrls.userInfo, {
    headers: {
      'user-agent': 'RedflareApi',
      'Authorization': discordAccessToken
    }
  });

  await setPublicUserSession(event, { user: discordUser, secure: { access_token: discordAccessToken } });
  return sendRedirect(event, '/me');
});