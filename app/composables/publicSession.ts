export function usePublicUserSession() {
  const publicSessionDefaultState: PublicSessionExposedData = {
    user: null,
    customer: null,
    id: '',
  };
  const publicSessionState = useState<PublicSessionExposedData>(
    'public-session',
    () => publicSessionDefaultState,
  );
  const publicSessionReady = useState('public-session-ready', () => false);

  const fetch = async () => {
    const sessionResult = await useRequestFetch()<PublicSessionExposedData>(
      '/api/public/auth/session',
      {
        headers: { accept: 'application/json' },
        retry: false,
      },
    ).catch(() => null);
    if (sessionResult) {
      publicSessionState.value = {
        user: sessionResult.user,
        customer: sessionResult.customer,
        id: sessionResult.id,
      };
    }
    publicSessionReady.value = true;
  };

  const clear = async () => {
    await useRequestFetch()('/api/public/auth/session', {
      method: 'DELETE',
      headers: { accept: 'application/json' },
      retry: false,
    });
    publicSessionState.value = publicSessionDefaultState;
  };

  const login = async () => {
    return navigateTo('/api/public/auth/discord', {
      replace: true,
      external: true,
    });
  };

  return {
    fetch,
    login,
    clear,
    isLoggedIn: computed(() => Boolean(publicSessionState.value?.user)),
    ready: publicSessionReady,
    session: publicSessionState,
  };
}
