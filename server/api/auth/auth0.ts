export default defineOAuthAuth0EventHandler({
  config: {
    scope: ['openid', 'profile']
  },
  async onSuccess(event, { user, tokens }) {
    const { access_token, refresh_token, id_token } = tokens;
    await setUserSession(event, { user, secure: { access_token, refresh_token, id_token } });
    logger.debug('Auth0 login successful for user:', user.sub);
    return sendRedirect(event, '/dashboard');
  }
});