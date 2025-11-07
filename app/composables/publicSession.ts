export function usePublicUserSession() {
  const publicSessionState = useState<{ user: DiscordOAuthUser | null, id: string }>('public-session', () => ({ user: null, id: '' }));
  const publicSessionReady = useState('public-session-ready', () => false);

  const fetch = async () => {
    const sessionResult = await useRequestFetch()<{ user: DiscordOAuthUser, id: string }>('/api/public/auth/session', {
      headers: { accept: 'application/json' },
      retry: false
    }).catch(() => null);
    if (sessionResult) {
      publicSessionState.value = {
        user: sessionResult.user,
        id: sessionResult.id
      };
    }
    publicSessionReady.value = true;
  };

  const clear = async () => {
    await useRequestFetch()('/api/public/auth/session', {
      method: 'DELETE',
      headers: { accept: 'application/json' },
      retry: false
    });
    publicSessionState.value = { user: null, id: '' };
  }

  const login = async () => {
    return navigateTo('/api/public/auth/discord', {
      replace: true,
      external: true
    });
  };

  return {
    fetch,
    login,
    clear,
    isLoggedIn: computed(() => Boolean(publicSessionState.value?.user)),
    ready: publicSessionReady,
    session: publicSessionState
  }
};