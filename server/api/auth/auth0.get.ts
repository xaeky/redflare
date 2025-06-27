export default defineOAuthAuth0EventHandler({
  config: {
    scope: ['openid', 'profile']
  },
  async onSuccess(event, { user, tokens }) {
    const { access_token, refresh_token, id_token } = tokens;
    await setUserSession(event, { user, secure: { access_token, refresh_token, id_token } });
    return sendRedirect(event, '/dashboard');
  }
});